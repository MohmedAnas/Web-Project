"""
Certificate Generation Business Logic
"""
import os
from io import BytesIO
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from django.core.files.base import ContentFile
from datetime import datetime
import uuid

# For PDF generation - we'll use reportlab
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.units import inch
    from reportlab.lib.colors import black, blue, red
    from reportlab.pdfbase import pdfutils
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from .models import StudentCertificate, CertificateTemplate
from apps.attendance.business_logic import AttendanceCalculator


class CertificateGenerator:
    """Handle certificate generation and management"""
    
    # Certificate grades based on performance
    GRADE_THRESHOLDS = {
        'A+': {'min_percentage': 95, 'min_attendance': 95},
        'A': {'min_percentage': 90, 'min_attendance': 90},
        'B+': {'min_percentage': 85, 'min_attendance': 85},
        'B': {'min_percentage': 80, 'min_attendance': 80},
        'C+': {'min_percentage': 75, 'min_attendance': 75},
        'C': {'min_percentage': 70, 'min_attendance': 70},
        'D': {'min_percentage': 60, 'min_attendance': 60},
        'F': {'min_percentage': 0, 'min_attendance': 0},
    }
    
    @classmethod
    def calculate_certificate_grade(cls, enrollment, attendance_percentage=None):
        """
        Calculate certificate grade based on attendance and performance
        
        Args:
            enrollment: StudentEnrollment instance
            attendance_percentage: Override attendance calculation
            
        Returns:
            dict: Grade calculation details
        """
        # Calculate attendance if not provided
        if attendance_percentage is None:
            attendance_stats = AttendanceCalculator.calculate_student_attendance(
                student=enrollment.student,
                enrollment=enrollment
            )
            attendance_percentage = attendance_stats['attendance_percentage']
        
        # For now, we'll use attendance as the main criteria
        # In a real system, you might have exam scores, assignments, etc.
        performance_percentage = attendance_percentage  # Simplified
        
        # Determine grade
        grade = 'F'  # Default
        for grade_level, thresholds in cls.GRADE_THRESHOLDS.items():
            if (performance_percentage >= thresholds['min_percentage'] and 
                attendance_percentage >= thresholds['min_attendance']):
                grade = grade_level
                break
        
        return {
            'grade': grade,
            'performance_percentage': round(performance_percentage, 2),
            'attendance_percentage': round(attendance_percentage, 2),
            'criteria_met': {
                'performance': performance_percentage >= cls.GRADE_THRESHOLDS[grade]['min_percentage'],
                'attendance': attendance_percentage >= cls.GRADE_THRESHOLDS[grade]['min_attendance']
            }
        }
    
    @classmethod
    def generate_certificate_data(cls, enrollment, completion_date=None):
        """
        Generate all data needed for certificate creation
        
        Args:
            enrollment: StudentEnrollment instance
            completion_date: Certificate completion date
            
        Returns:
            dict: Certificate data
        """
        student = enrollment.student
        course = enrollment.course
        
        # Calculate grade
        grade_info = cls.calculate_certificate_grade(enrollment)
        
        # Get attendance stats
        attendance_stats = AttendanceCalculator.calculate_student_attendance(
            student=student,
            enrollment=enrollment
        )
        
        # Certificate data
        certificate_data = {
            # Student information
            'student_name': student.user.name,
            'student_id': student.student_id,
            'student_email': student.user.email,
            'parent_name': student.parent_name,
            'parent_email': student.parent_email,
            
            # Course information
            'course_name': course.name,
            'course_code': course.code,
            'course_description': course.description,
            'course_duration': f"{enrollment.duration_months} months",
            'batch': enrollment.get_batch_display(),
            
            # Dates
            'start_date': enrollment.start_date,
            'completion_date': completion_date or enrollment.end_date,
            'issue_date': timezone.now().date(),
            
            # Performance
            'grade': grade_info['grade'],
            'percentage': grade_info['performance_percentage'],
            'attendance_percentage': grade_info['attendance_percentage'],
            
            # Attendance details
            'total_sessions': attendance_stats['total_sessions'],
            'present_sessions': attendance_stats['present_sessions'],
            'attendance_grade': attendance_stats['attendance_grade'],
            
            # Certificate details
            'certificate_number': cls._generate_certificate_number(course, enrollment.start_date),
            'verification_code': str(uuid.uuid4()),
            'institute_name': 'R.B Computer Training Institute',
            'institute_address': 'Your Institute Address Here',
            'principal_name': 'Principal Name',
            'issue_authority': 'R.B Computer Training Institute',
        }
        
        return certificate_data
    
    @classmethod
    def create_certificate_pdf(cls, certificate_data, template=None):
        """
        Generate PDF certificate
        
        Args:
            certificate_data: Dictionary with certificate information
            template: CertificateTemplate instance (optional)
            
        Returns:
            BytesIO: PDF file content
        """
        if not REPORTLAB_AVAILABLE:
            raise ImportError("ReportLab is required for PDF generation. Install with: pip install reportlab")
        
        buffer = BytesIO()
        
        # Create PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )
        
        # Build certificate content
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=blue
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=18,
            spaceAfter=20,
            alignment=TA_CENTER
        )
        
        content_style = ParagraphStyle(
            'CustomContent',
            parent=styles['Normal'],
            fontSize=14,
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        # Certificate content
        story.append(Paragraph("CERTIFICATE OF COMPLETION", title_style))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("This is to certify that", content_style))
        story.append(Spacer(1, 10))
        
        story.append(Paragraph(f"<b>{certificate_data['student_name']}</b>", subtitle_style))
        story.append(Paragraph(f"Student ID: {certificate_data['student_id']}", content_style))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("has successfully completed the course", content_style))
        story.append(Spacer(1, 10))
        
        story.append(Paragraph(f"<b>{certificate_data['course_name']}</b>", subtitle_style))
        story.append(Paragraph(f"Course Code: {certificate_data['course_code']}", content_style))
        story.append(Paragraph(f"Duration: {certificate_data['course_duration']}", content_style))
        story.append(Paragraph(f"Batch: {certificate_data['batch']}", content_style))
        story.append(Spacer(1, 20))
        
        # Performance details
        story.append(Paragraph(f"Grade Achieved: <b>{certificate_data['grade']}</b>", content_style))
        story.append(Paragraph(f"Attendance: {certificate_data['attendance_percentage']:.1f}%", content_style))
        story.append(Spacer(1, 20))
        
        # Dates
        story.append(Paragraph(f"Course Period: {certificate_data['start_date']} to {certificate_data['completion_date']}", content_style))
        story.append(Paragraph(f"Date of Issue: {certificate_data['issue_date']}", content_style))
        story.append(Spacer(1, 30))
        
        # Certificate details
        story.append(Paragraph(f"Certificate No: {certificate_data['certificate_number']}", content_style))
        story.append(Paragraph(f"Verification Code: {certificate_data['verification_code']}", content_style))
        story.append(Spacer(1, 20))
        
        # Authority
        story.append(Paragraph(f"Issued by: {certificate_data['institute_name']}", content_style))
        story.append(Paragraph(f"Principal: {certificate_data['principal_name']}", content_style))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return BytesIO(pdf_content)
    
    @classmethod
    def create_student_certificate(cls, enrollment, template=None, 
                                 completion_date=None, issued_by=None):
        """
        Create a complete student certificate
        
        Args:
            enrollment: StudentEnrollment instance
            template: CertificateTemplate instance
            completion_date: Certificate completion date
            issued_by: User who issued the certificate
            
        Returns:
            StudentCertificate: Created certificate instance
        """
        # Generate certificate data
        cert_data = cls.generate_certificate_data(enrollment, completion_date)
        
        # Get or create default template if none provided
        if not template:
            template = cls._get_default_template(enrollment.course)
        
        # Create certificate record
        certificate = StudentCertificate.objects.create(
            student=enrollment.student,
            enrollment=enrollment,
            template=template,
            issue_date=cert_data['issue_date'],
            completion_date=cert_data['completion_date'],
            grade=cert_data['grade'],
            percentage=cert_data['percentage'],
            status='draft',
            verification_code=cert_data['verification_code'],
            issued_by=issued_by
        )
        
        # Generate PDF
        try:
            pdf_buffer = cls.create_certificate_pdf(cert_data, template)
            
            # Save PDF file
            filename = f"certificate_{certificate.certificate_number}.pdf"
            certificate.certificate_file.save(
                filename,
                ContentFile(pdf_buffer.getvalue()),
                save=True
            )
            
            # Update status to issued
            certificate.status = 'issued'
            certificate.save()
            
        except Exception as e:
            # Log error and keep certificate as draft
            print(f"Error generating PDF: {e}")
            certificate.notes = f"PDF generation failed: {str(e)}"
            certificate.save()
        
        return certificate
    
    @classmethod
    def bulk_generate_certificates(cls, enrollments, template=None, 
                                 completion_date=None, issued_by=None):
        """
        Generate certificates for multiple enrollments
        
        Args:
            enrollments: List of StudentEnrollment instances
            template: CertificateTemplate instance
            completion_date: Certificate completion date
            issued_by: User who issued the certificates
            
        Returns:
            dict: Generation results
        """
        results = {
            'successful': [],
            'failed': [],
            'total': len(enrollments)
        }
        
        for enrollment in enrollments:
            try:
                # Check if certificate already exists
                if StudentCertificate.objects.filter(
                    student=enrollment.student,
                    enrollment=enrollment
                ).exists():
                    results['failed'].append({
                        'enrollment': enrollment,
                        'error': 'Certificate already exists'
                    })
                    continue
                
                # Generate certificate
                certificate = cls.create_student_certificate(
                    enrollment=enrollment,
                    template=template,
                    completion_date=completion_date,
                    issued_by=issued_by
                )
                
                results['successful'].append({
                    'enrollment': enrollment,
                    'certificate': certificate
                })
                
            except Exception as e:
                results['failed'].append({
                    'enrollment': enrollment,
                    'error': str(e)
                })
        
        return results
    
    @classmethod
    def _generate_certificate_number(cls, course, start_date):
        """Generate unique certificate number"""
        year = start_date.year
        course_code = course.code.upper()
        
        # Get next sequence number
        existing_certs = StudentCertificate.objects.filter(
            enrollment__course=course,
            issue_date__year=year
        ).count()
        
        sequence = existing_certs + 1
        
        return f"RBC-{course_code}-{year}-{sequence:04d}"
    
    @classmethod
    def _get_default_template(cls, course):
        """Get or create default template for course"""
        template, created = CertificateTemplate.objects.get_or_create(
            course=course,
            name=f"Default Template - {course.name}",
            defaults={
                'template_content': cls._get_default_template_content(),
                'is_active': True
            }
        )
        return template
    
    @classmethod
    def _get_default_template_content(cls):
        """Get default HTML template content"""
        return """
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h1 style="color: #2c3e50; font-size: 36px; margin-bottom: 30px;">
                CERTIFICATE OF COMPLETION
            </h1>
            
            <p style="font-size: 18px; margin: 20px 0;">This is to certify that</p>
            
            <h2 style="color: #3498db; font-size: 28px; margin: 20px 0;">
                {{student_name}}
            </h2>
            
            <p style="font-size: 16px;">Student ID: {{student_id}}</p>
            
            <p style="font-size: 18px; margin: 30px 0;">
                has successfully completed the course
            </p>
            
            <h3 style="color: #2c3e50; font-size: 24px; margin: 20px 0;">
                {{course_name}}
            </h3>
            
            <div style="margin: 30px 0; font-size: 16px;">
                <p>Course Code: {{course_code}}</p>
                <p>Duration: {{course_duration}}</p>
                <p>Grade: {{grade}}</p>
                <p>Attendance: {{attendance_percentage}}%</p>
            </div>
            
            <div style="margin: 40px 0; font-size: 14px;">
                <p>Course Period: {{start_date}} to {{completion_date}}</p>
                <p>Date of Issue: {{issue_date}}</p>
            </div>
            
            <div style="margin-top: 50px; font-size: 14px;">
                <p>Certificate No: {{certificate_number}}</p>
                <p>{{institute_name}}</p>
            </div>
        </div>
        """


class CertificateValidation:
    """Handle certificate validation and verification"""
    
    @classmethod
    def validate_certificate_eligibility(cls, enrollment):
        """
        Check if student is eligible for certificate
        
        Args:
            enrollment: StudentEnrollment instance
            
        Returns:
            dict: Validation results
        """
        issues = []
        warnings = []
        
        # Check enrollment status
        if enrollment.status != 'completed':
            issues.append("Enrollment must be completed")
        
        # Check course completion
        if enrollment.end_date > timezone.now().date():
            issues.append("Course not yet completed")
        
        # Check attendance
        attendance_stats = AttendanceCalculator.calculate_student_attendance(
            student=enrollment.student,
            enrollment=enrollment
        )
        
        if attendance_stats['attendance_percentage'] < 60:
            issues.append(f"Insufficient attendance: {attendance_stats['attendance_percentage']:.1f}%")
        elif attendance_stats['attendance_percentage'] < 75:
            warnings.append(f"Low attendance: {attendance_stats['attendance_percentage']:.1f}%")
        
        # Check if certificate already exists
        if StudentCertificate.objects.filter(
            student=enrollment.student,
            enrollment=enrollment
        ).exists():
            issues.append("Certificate already issued")
        
        return {
            'is_eligible': len(issues) == 0,
            'issues': issues,
            'warnings': warnings,
            'attendance_percentage': attendance_stats['attendance_percentage']
        }
    
    @classmethod
    def verify_certificate_authenticity(cls, certificate_number=None, 
                                      verification_code=None):
        """
        Verify certificate authenticity
        
        Args:
            certificate_number: Certificate number
            verification_code: UUID verification code
            
        Returns:
            dict: Verification results
        """
        try:
            if verification_code:
                certificate = StudentCertificate.objects.get(
                    verification_code=verification_code
                )
            elif certificate_number:
                certificate = StudentCertificate.objects.get(
                    certificate_number=certificate_number
                )
            else:
                return {
                    'is_valid': False,
                    'error': 'Certificate number or verification code required'
                }
            
            # Check certificate status
            if certificate.status != 'issued':
                return {
                    'is_valid': False,
                    'error': f'Certificate status: {certificate.status}'
                }
            
            return {
                'is_valid': True,
                'certificate': certificate,
                'student_name': certificate.student.user.name,
                'student_id': certificate.student.student_id,
                'course_name': certificate.enrollment.course.name,
                'course_code': certificate.enrollment.course.code,
                'issue_date': certificate.issue_date,
                'completion_date': certificate.completion_date,
                'grade': certificate.grade,
                'certificate_number': certificate.certificate_number
            }
            
        except StudentCertificate.DoesNotExist:
            return {
                'is_valid': False,
                'error': 'Certificate not found'
            }
