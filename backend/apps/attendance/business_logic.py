"""
Attendance Tracking Business Logic
"""
from decimal import Decimal
from django.utils import timezone
from django.db.models import Count, Q, Avg
from datetime import datetime, timedelta
from .models import AttendanceSession, AttendanceRecord, AttendanceSummary
from apps.students.models import StudentEnrollment


class AttendanceCalculator:
    """Handle attendance calculations and analytics"""
    
    # Attendance thresholds
    EXCELLENT_THRESHOLD = Decimal('95')
    GOOD_THRESHOLD = Decimal('85')
    AVERAGE_THRESHOLD = Decimal('75')
    POOR_THRESHOLD = Decimal('60')
    
    @classmethod
    def calculate_student_attendance(cls, student, enrollment=None, 
                                   start_date=None, end_date=None):
        """
        Calculate attendance percentage for a student
        
        Args:
            student: StudentProfile instance
            enrollment: Specific enrollment (optional)
            start_date: Start date for calculation
            end_date: End date for calculation
            
        Returns:
            dict: Attendance statistics
        """
        # Build query filters
        filters = {'student': student}
        
        if enrollment:
            filters['enrollment'] = enrollment
        
        if start_date:
            filters['session__date__gte'] = start_date
        
        if end_date:
            filters['session__date__lte'] = end_date
        
        # Get attendance records
        records = AttendanceRecord.objects.filter(**filters)
        
        total_sessions = records.count()
        if total_sessions == 0:
            return cls._empty_attendance_stats()
        
        # Count different status types
        present_count = records.filter(status__in=['present', 'late']).count()
        absent_count = records.filter(status='absent').count()
        late_count = records.filter(status='late').count()
        excused_count = records.filter(status='excused').count()
        
        # Calculate percentages
        attendance_percentage = (present_count / total_sessions) * 100
        late_percentage = (late_count / total_sessions) * 100
        absent_percentage = (absent_count / total_sessions) * 100
        
        # Determine attendance grade
        grade = cls._get_attendance_grade(attendance_percentage)
        
        return {
            'total_sessions': total_sessions,
            'present_sessions': present_count,
            'absent_sessions': absent_count,
            'late_sessions': late_count,
            'excused_sessions': excused_count,
            'attendance_percentage': round(attendance_percentage, 2),
            'late_percentage': round(late_percentage, 2),
            'absent_percentage': round(absent_percentage, 2),
            'attendance_grade': grade,
            'is_excellent': attendance_percentage >= cls.EXCELLENT_THRESHOLD,
            'is_good': attendance_percentage >= cls.GOOD_THRESHOLD,
            'needs_improvement': attendance_percentage < cls.POOR_THRESHOLD,
            'consecutive_absences': cls._get_consecutive_absences(student, enrollment)
        }
    
    @classmethod
    def calculate_course_attendance(cls, course, batch=None, date_range=None):
        """
        Calculate attendance statistics for a course
        
        Args:
            course: Course instance
            batch: Specific batch (optional)
            date_range: Tuple of (start_date, end_date)
            
        Returns:
            dict: Course attendance statistics
        """
        # Build session filters
        session_filters = {'course': course}
        
        if batch:
            session_filters['batch'] = batch
        
        if date_range:
            session_filters['date__gte'] = date_range[0]
            session_filters['date__lte'] = date_range[1]
        
        # Get sessions and records
        sessions = AttendanceSession.objects.filter(**session_filters)
        records = AttendanceRecord.objects.filter(session__in=sessions)
        
        if not records.exists():
            return cls._empty_course_stats()
        
        # Calculate statistics
        total_sessions = sessions.count()
        total_records = records.count()
        present_records = records.filter(status__in=['present', 'late']).count()
        
        # Average attendance per session
        session_stats = []
        for session in sessions:
            session_records = records.filter(session=session)
            session_present = session_records.filter(status__in=['present', 'late']).count()
            session_total = session_records.count()
            
            if session_total > 0:
                session_percentage = (session_present / session_total) * 100
                session_stats.append({
                    'session_id': session.id,
                    'date': session.date,
                    'attendance_percentage': round(session_percentage, 2),
                    'present_count': session_present,
                    'total_count': session_total
                })
        
        # Overall statistics
        overall_percentage = (present_records / total_records) * 100 if total_records > 0 else 0
        
        return {
            'course_name': course.name,
            'total_sessions': total_sessions,
            'total_records': total_records,
            'present_records': present_records,
            'overall_attendance_percentage': round(overall_percentage, 2),
            'session_stats': session_stats,
            'average_students_per_session': total_records / total_sessions if total_sessions > 0 else 0,
            'best_session': max(session_stats, key=lambda x: x['attendance_percentage']) if session_stats else None,
            'worst_session': min(session_stats, key=lambda x: x['attendance_percentage']) if session_stats else None
        }
    
    @classmethod
    def _get_attendance_grade(cls, percentage):
        """Get attendance grade based on percentage"""
        if percentage >= cls.EXCELLENT_THRESHOLD:
            return 'Excellent'
        elif percentage >= cls.GOOD_THRESHOLD:
            return 'Good'
        elif percentage >= cls.AVERAGE_THRESHOLD:
            return 'Average'
        elif percentage >= cls.POOR_THRESHOLD:
            return 'Poor'
        else:
            return 'Critical'
    
    @classmethod
    def _get_consecutive_absences(cls, student, enrollment=None):
        """Get count of consecutive absences"""
        filters = {'student': student, 'status': 'absent'}
        if enrollment:
            filters['enrollment'] = enrollment
        
        # Get recent absence records ordered by date
        recent_absences = AttendanceRecord.objects.filter(
            **filters
        ).order_by('-session__date')[:10]  # Check last 10 records
        
        consecutive_count = 0
        for record in recent_absences:
            if record.status == 'absent':
                consecutive_count += 1
            else:
                break
        
        return consecutive_count
    
    @classmethod
    def _empty_attendance_stats(cls):
        """Return empty attendance statistics"""
        return {
            'total_sessions': 0,
            'present_sessions': 0,
            'absent_sessions': 0,
            'late_sessions': 0,
            'excused_sessions': 0,
            'attendance_percentage': 0,
            'late_percentage': 0,
            'absent_percentage': 0,
            'attendance_grade': 'No Data',
            'is_excellent': False,
            'is_good': False,
            'needs_improvement': False,
            'consecutive_absences': 0
        }
    
    @classmethod
    def _empty_course_stats(cls):
        """Return empty course statistics"""
        return {
            'total_sessions': 0,
            'total_records': 0,
            'present_records': 0,
            'overall_attendance_percentage': 0,
            'session_stats': [],
            'average_students_per_session': 0,
            'best_session': None,
            'worst_session': None
        }


class AttendanceAlerts:
    """Handle attendance-based alerts and notifications"""
    
    # Alert thresholds
    LOW_ATTENDANCE_THRESHOLD = 75
    CONSECUTIVE_ABSENCE_THRESHOLD = 3
    LATE_FREQUENCY_THRESHOLD = 5  # 5 late marks in a month
    
    @classmethod
    def check_student_alerts(cls, student, enrollment=None):
        """
        Check for attendance alerts for a student
        
        Args:
            student: StudentProfile instance
            enrollment: Specific enrollment (optional)
            
        Returns:
            list: List of alert dictionaries
        """
        alerts = []
        
        # Calculate current attendance
        stats = AttendanceCalculator.calculate_student_attendance(
            student=student,
            enrollment=enrollment
        )
        
        # Low attendance alert
        if stats['attendance_percentage'] < cls.LOW_ATTENDANCE_THRESHOLD:
            alerts.append({
                'type': 'low_attendance',
                'severity': 'high' if stats['attendance_percentage'] < 60 else 'medium',
                'message': f"Low attendance: {stats['attendance_percentage']:.1f}%",
                'data': {
                    'attendance_percentage': stats['attendance_percentage'],
                    'threshold': cls.LOW_ATTENDANCE_THRESHOLD
                }
            })
        
        # Consecutive absences alert
        if stats['consecutive_absences'] >= cls.CONSECUTIVE_ABSENCE_THRESHOLD:
            alerts.append({
                'type': 'consecutive_absences',
                'severity': 'high',
                'message': f"Consecutive absences: {stats['consecutive_absences']} days",
                'data': {
                    'consecutive_absences': stats['consecutive_absences'],
                    'threshold': cls.CONSECUTIVE_ABSENCE_THRESHOLD
                }
            })
        
        # Frequent late arrivals alert
        if stats['late_sessions'] >= cls.LATE_FREQUENCY_THRESHOLD:
            alerts.append({
                'type': 'frequent_late',
                'severity': 'medium',
                'message': f"Frequent late arrivals: {stats['late_sessions']} times",
                'data': {
                    'late_count': stats['late_sessions'],
                    'late_percentage': stats['late_percentage']
                }
            })
        
        return alerts
    
    @classmethod
    def get_students_needing_attention(cls, course=None, batch=None):
        """
        Get list of students who need attendance attention
        
        Args:
            course: Filter by course (optional)
            batch: Filter by batch (optional)
            
        Returns:
            list: Students with attendance issues
        """
        from apps.accounts.models import StudentProfile
        
        # Get students based on filters
        students = StudentProfile.objects.all()
        
        if course or batch:
            enrollment_filters = {}
            if course:
                enrollment_filters['course'] = course
            if batch:
                enrollment_filters['batch'] = batch
            
            students = students.filter(
                enrollments__in=StudentEnrollment.objects.filter(**enrollment_filters)
            ).distinct()
        
        students_with_issues = []
        
        for student in students:
            alerts = cls.check_student_alerts(student)
            if alerts:
                student_data = {
                    'student': student,
                    'student_id': student.student_id,
                    'student_name': student.user.name,
                    'alerts': alerts,
                    'alert_count': len(alerts),
                    'highest_severity': cls._get_highest_severity(alerts)
                }
                students_with_issues.append(student_data)
        
        # Sort by severity and alert count
        students_with_issues.sort(
            key=lambda x: (x['highest_severity'] == 'high', x['alert_count']),
            reverse=True
        )
        
        return students_with_issues
    
    @classmethod
    def _get_highest_severity(cls, alerts):
        """Get the highest severity level from alerts"""
        severities = [alert['severity'] for alert in alerts]
        if 'high' in severities:
            return 'high'
        elif 'medium' in severities:
            return 'medium'
        else:
            return 'low'


class AttendanceAutomation:
    """Automated attendance processes"""
    
    @classmethod
    def create_monthly_summaries(cls, month=None, year=None):
        """
        Create monthly attendance summaries for all students
        
        Args:
            month: Month number (1-12), defaults to current month
            year: Year, defaults to current year
            
        Returns:
            int: Number of summaries created
        """
        if not month or not year:
            now = timezone.now()
            month = month or now.month
            year = year or now.year
        
        # First day of the month
        summary_month = datetime(year, month, 1).date()
        
        # Get all active enrollments
        enrollments = StudentEnrollment.objects.filter(
            status='active',
            start_date__lte=summary_month
        )
        
        created_count = 0
        
        for enrollment in enrollments:
            # Check if summary already exists
            if AttendanceSummary.objects.filter(
                student=enrollment.student,
                enrollment=enrollment,
                month=summary_month
            ).exists():
                continue
            
            # Calculate attendance for the month
            start_date = summary_month
            if month == 12:
                end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
            else:
                end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
            
            stats = AttendanceCalculator.calculate_student_attendance(
                student=enrollment.student,
                enrollment=enrollment,
                start_date=start_date,
                end_date=end_date
            )
            
            # Create summary
            summary = AttendanceSummary.objects.create(
                student=enrollment.student,
                enrollment=enrollment,
                month=summary_month,
                total_sessions=stats['total_sessions'],
                present_sessions=stats['present_sessions'],
                absent_sessions=stats['absent_sessions'],
                late_sessions=stats['late_sessions'],
                excused_sessions=stats['excused_sessions'],
                attendance_percentage=stats['attendance_percentage']
            )
            
            created_count += 1
        
        return created_count
    
    @classmethod
    def auto_mark_absent_students(cls, session):
        """
        Automatically mark students as absent if not marked present
        
        Args:
            session: AttendanceSession instance
            
        Returns:
            int: Number of students marked absent
        """
        # Get all students enrolled in this course and batch
        enrolled_students = StudentEnrollment.objects.filter(
            course=session.course,
            batch=session.batch,
            status='active',
            start_date__lte=session.date,
            end_date__gte=session.date
        )
        
        marked_absent_count = 0
        
        for enrollment in enrolled_students:
            # Check if attendance record exists
            if not AttendanceRecord.objects.filter(
                session=session,
                student=enrollment.student
            ).exists():
                # Mark as absent
                AttendanceRecord.objects.create(
                    session=session,
                    student=enrollment.student,
                    enrollment=enrollment,
                    status='absent',
                    notes='Auto-marked absent'
                )
                marked_absent_count += 1
        
        return marked_absent_count
    
    @classmethod
    def generate_attendance_trends(cls, student, days=30):
        """
        Generate attendance trends for a student
        
        Args:
            student: StudentProfile instance
            days: Number of days to analyze
            
        Returns:
            dict: Trend analysis
        """
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get attendance records for the period
        records = AttendanceRecord.objects.filter(
            student=student,
            session__date__gte=start_date,
            session__date__lte=end_date
        ).order_by('session__date')
        
        # Group by week
        weekly_stats = {}
        for record in records:
            week_start = record.session.date - timedelta(days=record.session.date.weekday())
            week_key = week_start.strftime('%Y-%W')
            
            if week_key not in weekly_stats:
                weekly_stats[week_key] = {
                    'week_start': week_start,
                    'total': 0,
                    'present': 0,
                    'absent': 0,
                    'late': 0
                }
            
            weekly_stats[week_key]['total'] += 1
            if record.status in ['present', 'late']:
                weekly_stats[week_key]['present'] += 1
            elif record.status == 'absent':
                weekly_stats[week_key]['absent'] += 1
            elif record.status == 'late':
                weekly_stats[week_key]['late'] += 1
        
        # Calculate weekly percentages
        weekly_trends = []
        for week_data in weekly_stats.values():
            if week_data['total'] > 0:
                attendance_percentage = (week_data['present'] / week_data['total']) * 100
                weekly_trends.append({
                    'week_start': week_data['week_start'],
                    'attendance_percentage': round(attendance_percentage, 2),
                    'total_sessions': week_data['total'],
                    'present_sessions': week_data['present'],
                    'absent_sessions': week_data['absent'],
                    'late_sessions': week_data['late']
                })
        
        # Sort by week
        weekly_trends.sort(key=lambda x: x['week_start'])
        
        # Calculate trend direction
        if len(weekly_trends) >= 2:
            recent_avg = sum(w['attendance_percentage'] for w in weekly_trends[-2:]) / 2
            earlier_avg = sum(w['attendance_percentage'] for w in weekly_trends[:-2]) / max(1, len(weekly_trends) - 2)
            
            if recent_avg > earlier_avg + 5:
                trend_direction = 'improving'
            elif recent_avg < earlier_avg - 5:
                trend_direction = 'declining'
            else:
                trend_direction = 'stable'
        else:
            trend_direction = 'insufficient_data'
        
        return {
            'period_days': days,
            'weekly_trends': weekly_trends,
            'trend_direction': trend_direction,
            'total_weeks': len(weekly_trends),
            'average_weekly_attendance': sum(w['attendance_percentage'] for w in weekly_trends) / len(weekly_trends) if weekly_trends else 0
        }
