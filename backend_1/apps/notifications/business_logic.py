"""
Email Notifications Business Logic
"""
import os
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from apps.fees.models import StudentFee
from apps.attendance.business_logic import AttendanceCalculator, AttendanceAlerts
from apps.certificates.models import StudentCertificate

logger = logging.getLogger(__name__)


class EmailNotificationService:
    """Handle all email notifications"""
    
    # Email templates directory
    TEMPLATE_DIR = 'emails/'
    
    # Default sender
    DEFAULT_FROM_EMAIL = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@rbcomputer.com')
    
    @classmethod
    def send_email(cls, subject, message, recipient_list, html_message=None, 
                   from_email=None, fail_silently=False):
        """
        Send email with error handling
        
        Args:
            subject: Email subject
            message: Plain text message
            recipient_list: List of recipient emails
            html_message: HTML message (optional)
            from_email: Sender email
            fail_silently: Whether to suppress errors
            
        Returns:
            bool: Success status
        """
        try:
            from_email = from_email or cls.DEFAULT_FROM_EMAIL
            
            if html_message:
                # Send HTML email
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=message,
                    from_email=from_email,
                    to=recipient_list
                )
                email.attach_alternative(html_message, "text/html")
                email.send()
            else:
                # Send plain text email
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=from_email,
                    recipient_list=recipient_list,
                    fail_silently=fail_silently
                )
            
            logger.info(f"Email sent successfully to {recipient_list}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_list}: {str(e)}")
            if not fail_silently:
                raise
            return False
    
    @classmethod
    def render_email_template(cls, template_name, context):
        """
        Render email template with context
        
        Args:
            template_name: Template file name
            context: Template context
            
        Returns:
            tuple: (plain_text, html_content)
        """
        try:
            # Render HTML template
            html_template = f"{cls.TEMPLATE_DIR}{template_name}.html"
            html_content = render_to_string(html_template, context)
            
            # Try to render plain text template
            try:
                text_template = f"{cls.TEMPLATE_DIR}{template_name}.txt"
                plain_text = render_to_string(text_template, context)
            except:
                # Fallback: strip HTML tags for plain text
                import re
                plain_text = re.sub('<[^<]+?>', '', html_content)
            
            return plain_text, html_content
            
        except Exception as e:
            logger.error(f"Failed to render email template {template_name}: {str(e)}")
            return None, None


class FeeNotifications:
    """Handle fee-related notifications"""
    
    @classmethod
    def send_fee_reminder(cls, student_fee, reminder_type='due_soon'):
        """
        Send fee reminder to student and parent
        
        Args:
            student_fee: StudentFee instance
            reminder_type: 'due_soon', 'overdue', 'final_notice'
            
        Returns:
            dict: Notification results
        """
        student = student_fee.student
        enrollment = student_fee.enrollment
        
        # Prepare context
        context = {
            'student_name': student.user.name,
            'student_id': student.student_id,
            'course_name': enrollment.course.name,
            'course_code': enrollment.course.code,
            'total_amount': student_fee.total_amount,
            'paid_amount': student_fee.paid_amount,
            'remaining_amount': student_fee.remaining_amount,
            'due_date': student_fee.due_date,
            'days_overdue': (timezone.now().date() - student_fee.due_date).days if student_fee.due_date < timezone.now().date() else 0,
            'institute_name': 'R.B Computer Training Institute',
            'contact_email': 'admin@rbcomputer.com',
            'contact_phone': '+91-XXXXXXXXXX'
        }
        
        # Determine subject and template based on reminder type
        if reminder_type == 'due_soon':
            subject = f"Fee Payment Reminder - {enrollment.course.name}"
            template = 'fee_reminder_due_soon'
        elif reminder_type == 'overdue':
            subject = f"Overdue Fee Notice - {enrollment.course.name}"
            template = 'fee_reminder_overdue'
        elif reminder_type == 'final_notice':
            subject = f"Final Notice - Fee Payment Required - {enrollment.course.name}"
            template = 'fee_reminder_final'
        else:
            subject = f"Fee Payment Reminder - {enrollment.course.name}"
            template = 'fee_reminder_general'
        
        # Render email content
        plain_text, html_content = EmailNotificationService.render_email_template(
            template, context
        )
        
        if not plain_text:
            # Fallback message
            plain_text = f"""
Dear {student.user.name},

This is a reminder that your fee payment for {enrollment.course.name} is {reminder_type.replace('_', ' ')}.

Amount Due: ₹{student_fee.remaining_amount}
Due Date: {student_fee.due_date}

Please make the payment at your earliest convenience.

Thank you,
R.B Computer Training Institute
            """.strip()
        
        # Send to student
        recipients = [student.user.email]
        
        # Add parent email if available
        if student.parent_email:
            recipients.append(student.parent_email)
        
        # Send email
        success = EmailNotificationService.send_email(
            subject=subject,
            message=plain_text,
            recipient_list=recipients,
            html_message=html_content,
            fail_silently=True
        )
        
        return {
            'success': success,
            'recipients': recipients,
            'reminder_type': reminder_type,
            'student_fee_id': student_fee.id
        }
    
    @classmethod
    def send_payment_confirmation(cls, fee_payment):
        """
        Send payment confirmation email
        
        Args:
            fee_payment: FeePayment instance
            
        Returns:
            dict: Notification results
        """
        student_fee = fee_payment.student_fee
        student = student_fee.student
        enrollment = student_fee.enrollment
        
        context = {
            'student_name': student.user.name,
            'student_id': student.student_id,
            'course_name': enrollment.course.name,
            'payment_amount': fee_payment.amount,
            'payment_date': fee_payment.payment_date,
            'payment_method': fee_payment.get_payment_method_display(),
            'transaction_id': fee_payment.transaction_id,
            'remaining_amount': student_fee.remaining_amount,
            'total_amount': student_fee.total_amount,
            'paid_amount': student_fee.paid_amount,
            'institute_name': 'R.B Computer Training Institute'
        }
        
        subject = f"Payment Confirmation - {enrollment.course.name}"
        
        # Render email
        plain_text, html_content = EmailNotificationService.render_email_template(
            'payment_confirmation', context
        )
        
        if not plain_text:
            plain_text = f"""
Dear {student.user.name},

Thank you for your payment of ₹{fee_payment.amount} for {enrollment.course.name}.

Payment Details:
- Amount: ₹{fee_payment.amount}
- Date: {fee_payment.payment_date}
- Method: {fee_payment.get_payment_method_display()}
- Transaction ID: {fee_payment.transaction_id or 'N/A'}

Remaining Balance: ₹{student_fee.remaining_amount}

Thank you,
R.B Computer Training Institute
            """.strip()
        
        recipients = [student.user.email]
        if student.parent_email:
            recipients.append(student.parent_email)
        
        success = EmailNotificationService.send_email(
            subject=subject,
            message=plain_text,
            recipient_list=recipients,
            html_message=html_content,
            fail_silently=True
        )
        
        return {
            'success': success,
            'recipients': recipients,
            'payment_id': fee_payment.id
        }


class AttendanceNotifications:
    """Handle attendance-related notifications"""
    
    @classmethod
    def send_attendance_alert(cls, student, alert_data):
        """
        Send attendance alert to student and parent
        
        Args:
            student: StudentProfile instance
            alert_data: Alert information from AttendanceAlerts
            
        Returns:
            dict: Notification results
        """
        context = {
            'student_name': student.user.name,
            'student_id': student.student_id,
            'alerts': alert_data,
            'institute_name': 'R.B Computer Training Institute',
            'contact_email': 'admin@rbcomputer.com'
        }
        
        # Determine subject based on alert severity
        high_severity_alerts = [a for a in alert_data if a['severity'] == 'high']
        
        if high_severity_alerts:
            subject = f"Urgent: Attendance Alert - {student.user.name}"
            template = 'attendance_alert_urgent'
        else:
            subject = f"Attendance Alert - {student.user.name}"
            template = 'attendance_alert_general'
        
        # Render email
        plain_text, html_content = EmailNotificationService.render_email_template(
            template, context
        )
        
        if not plain_text:
            alert_messages = []
            for alert in alert_data:
                alert_messages.append(f"- {alert['message']}")
            
            plain_text = f"""
Dear {student.user.name},

We would like to bring to your attention some concerns regarding your attendance:

{chr(10).join(alert_messages)}

Please ensure regular attendance to make the most of your course.

Thank you,
R.B Computer Training Institute
            """.strip()
        
        recipients = [student.user.email]
        if student.parent_email:
            recipients.append(student.parent_email)
        
        success = EmailNotificationService.send_email(
            subject=subject,
            message=plain_text,
            recipient_list=recipients,
            html_message=html_content,
            fail_silently=True
        )
        
        return {
            'success': success,
            'recipients': recipients,
            'alert_count': len(alert_data),
            'student_id': student.student_id
        }
    
    @classmethod
    def send_weekly_attendance_report(cls, student, week_start_date=None):
        """
        Send weekly attendance report to parents
        
        Args:
            student: StudentProfile instance
            week_start_date: Start date of the week
            
        Returns:
            dict: Notification results
        """
        if not student.parent_email:
            return {'success': False, 'error': 'No parent email available'}
        
        # Calculate week dates
        if not week_start_date:
            today = timezone.now().date()
            week_start_date = today - timedelta(days=today.weekday())
        
        week_end_date = week_start_date + timedelta(days=6)
        
        # Get attendance stats for the week
        attendance_stats = AttendanceCalculator.calculate_student_attendance(
            student=student,
            start_date=week_start_date,
            end_date=week_end_date
        )
        
        # Get overall attendance
        overall_stats = AttendanceCalculator.calculate_student_attendance(student=student)
        
        context = {
            'student_name': student.user.name,
            'student_id': student.student_id,
            'parent_name': student.parent_name,
            'week_start': week_start_date,
            'week_end': week_end_date,
            'week_stats': attendance_stats,
            'overall_stats': overall_stats,
            'institute_name': 'R.B Computer Training Institute'
        }
        
        subject = f"Weekly Attendance Report - {student.user.name} ({week_start_date})"
        
        # Render email
        plain_text, html_content = EmailNotificationService.render_email_template(
            'weekly_attendance_report', context
        )
        
        if not plain_text:
            plain_text = f"""
Dear {student.parent_name or 'Parent'},

Weekly Attendance Report for {student.user.name} ({student.student_id})
Week: {week_start_date} to {week_end_date}

This Week:
- Total Sessions: {attendance_stats['total_sessions']}
- Present: {attendance_stats['present_sessions']}
- Absent: {attendance_stats['absent_sessions']}
- Late: {attendance_stats['late_sessions']}
- Attendance: {attendance_stats['attendance_percentage']:.1f}%

Overall Attendance: {overall_stats['attendance_percentage']:.1f}%

Thank you,
R.B Computer Training Institute
            """.strip()
        
        success = EmailNotificationService.send_email(
            subject=subject,
            message=plain_text,
            recipient_list=[student.parent_email],
            html_message=html_content,
            fail_silently=True
        )
        
        return {
            'success': success,
            'recipients': [student.parent_email],
            'week_start': week_start_date,
            'student_id': student.student_id
        }


class CertificateNotifications:
    """Handle certificate-related notifications"""
    
    @classmethod
    def send_certificate_issued_notification(cls, certificate):
        """
        Send notification when certificate is issued
        
        Args:
            certificate: StudentCertificate instance
            
        Returns:
            dict: Notification results
        """
        student = certificate.student
        enrollment = certificate.enrollment
        
        context = {
            'student_name': student.user.name,
            'student_id': student.student_id,
            'course_name': enrollment.course.name,
            'course_code': enrollment.course.code,
            'certificate_number': certificate.certificate_number,
            'issue_date': certificate.issue_date,
            'completion_date': certificate.completion_date,
            'grade': certificate.grade,
            'verification_url': f"https://rbcomputer.com/verify/{certificate.verification_code}",
            'download_url': f"https://rbcomputer.com/certificates/{certificate.id}/download/",
            'institute_name': 'R.B Computer Training Institute'
        }
        
        subject = f"Certificate Issued - {enrollment.course.name}"
        
        # Render email
        plain_text, html_content = EmailNotificationService.render_email_template(
            'certificate_issued', context
        )
        
        if not plain_text:
            plain_text = f"""
Dear {student.user.name},

Congratulations! Your certificate for {enrollment.course.name} has been issued.

Certificate Details:
- Certificate Number: {certificate.certificate_number}
- Course: {enrollment.course.name} ({enrollment.course.code})
- Grade: {certificate.grade}
- Issue Date: {certificate.issue_date}

You can verify your certificate using the verification code: {certificate.verification_code}

Thank you,
R.B Computer Training Institute
            """.strip()
        
        recipients = [student.user.email]
        if student.parent_email:
            recipients.append(student.parent_email)
        
        success = EmailNotificationService.send_email(
            subject=subject,
            message=plain_text,
            recipient_list=recipients,
            html_message=html_content,
            fail_silently=True
        )
        
        return {
            'success': success,
            'recipients': recipients,
            'certificate_id': certificate.id
        }


class NotificationAutomation:
    """Automated notification processes"""
    
    @classmethod
    def send_daily_fee_reminders(cls):
        """
        Send daily fee reminders for due and overdue fees
        
        Returns:
            dict: Summary of sent notifications
        """
        today = timezone.now().date()
        
        # Fees due in 3 days
        due_soon_fees = StudentFee.objects.filter(
            due_date=today + timedelta(days=3),
            status__in=['pending', 'partial']
        )
        
        # Overdue fees
        overdue_fees = StudentFee.objects.filter(
            due_date__lt=today,
            status__in=['pending', 'partial', 'overdue']
        )
        
        results = {
            'due_soon_sent': 0,
            'overdue_sent': 0,
            'errors': []
        }
        
        # Send due soon reminders
        for fee in due_soon_fees:
            try:
                result = FeeNotifications.send_fee_reminder(fee, 'due_soon')
                if result['success']:
                    results['due_soon_sent'] += 1
            except Exception as e:
                results['errors'].append(f"Fee {fee.id}: {str(e)}")
        
        # Send overdue reminders
        for fee in overdue_fees:
            try:
                days_overdue = (today - fee.due_date).days
                reminder_type = 'final_notice' if days_overdue > 30 else 'overdue'
                
                result = FeeNotifications.send_fee_reminder(fee, reminder_type)
                if result['success']:
                    results['overdue_sent'] += 1
            except Exception as e:
                results['errors'].append(f"Fee {fee.id}: {str(e)}")
        
        return results
    
    @classmethod
    def send_weekly_attendance_reports(cls):
        """
        Send weekly attendance reports to all parents
        
        Returns:
            dict: Summary of sent reports
        """
        from apps.accounts.models import StudentProfile
        
        # Get all students with parent emails
        students = StudentProfile.objects.exclude(parent_email='')
        
        results = {
            'reports_sent': 0,
            'errors': []
        }
        
        for student in students:
            try:
                result = AttendanceNotifications.send_weekly_attendance_report(student)
                if result['success']:
                    results['reports_sent'] += 1
            except Exception as e:
                results['errors'].append(f"Student {student.student_id}: {str(e)}")
        
        return results
    
    @classmethod
    def check_and_send_attendance_alerts(cls):
        """
        Check for attendance issues and send alerts
        
        Returns:
            dict: Summary of sent alerts
        """
        # Get students needing attention
        students_with_issues = AttendanceAlerts.get_students_needing_attention()
        
        results = {
            'alerts_sent': 0,
            'students_checked': len(students_with_issues),
            'errors': []
        }
        
        for student_data in students_with_issues:
            try:
                result = AttendanceNotifications.send_attendance_alert(
                    student=student_data['student'],
                    alert_data=student_data['alerts']
                )
                if result['success']:
                    results['alerts_sent'] += 1
            except Exception as e:
                results['errors'].append(f"Student {student_data['student_id']}: {str(e)}")
        
        return results
