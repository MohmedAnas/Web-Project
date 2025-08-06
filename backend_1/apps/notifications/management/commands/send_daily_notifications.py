"""
Management command to send daily notifications
Usage: python manage.py send_daily_notifications
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.notifications.business_logic import NotificationAutomation
from apps.fees.business_logic import FeeAutomation
from apps.attendance.business_logic import AttendanceAutomation


class Command(BaseCommand):
    help = 'Send daily notifications (fee reminders, attendance alerts)'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--fees-only',
            action='store_true',
            help='Send only fee reminders',
        )
        parser.add_argument(
            '--attendance-only',
            action='store_true',
            help='Send only attendance alerts',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be sent without actually sending',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS(f'Starting daily notifications - {timezone.now()}')
        )
        
        total_sent = 0
        total_errors = 0
        
        # Update overdue fees first
        if not options['attendance_only']:
            self.stdout.write('Updating overdue fees...')
            updated_fees = FeeAutomation.update_overdue_fees()
            self.stdout.write(f'Updated {updated_fees} overdue fees')
        
        # Send fee reminders
        if not options['attendance_only']:
            self.stdout.write('Sending fee reminders...')
            
            if options['dry_run']:
                self.stdout.write(self.style.WARNING('DRY RUN: Would send fee reminders'))
            else:
                fee_results = NotificationAutomation.send_daily_fee_reminders()
                total_sent += fee_results['due_soon_sent'] + fee_results['overdue_sent']
                total_errors += len(fee_results['errors'])
                
                self.stdout.write(
                    f'Fee reminders sent: {fee_results["due_soon_sent"]} due soon, '
                    f'{fee_results["overdue_sent"]} overdue'
                )
                
                if fee_results['errors']:
                    self.stdout.write(
                        self.style.ERROR(f'Fee reminder errors: {len(fee_results["errors"])}')
                    )
                    for error in fee_results['errors'][:5]:  # Show first 5 errors
                        self.stdout.write(self.style.ERROR(f'  - {error}'))
        
        # Send attendance alerts
        if not options['fees_only']:
            self.stdout.write('Checking attendance alerts...')
            
            if options['dry_run']:
                self.stdout.write(self.style.WARNING('DRY RUN: Would send attendance alerts'))
            else:
                attendance_results = NotificationAutomation.check_and_send_attendance_alerts()
                total_sent += attendance_results['alerts_sent']
                total_errors += len(attendance_results['errors'])
                
                self.stdout.write(
                    f'Attendance alerts sent: {attendance_results["alerts_sent"]} '
                    f'(checked {attendance_results["students_checked"]} students)'
                )
                
                if attendance_results['errors']:
                    self.stdout.write(
                        self.style.ERROR(f'Attendance alert errors: {len(attendance_results["errors"])}')
                    )
                    for error in attendance_results['errors'][:5]:
                        self.stdout.write(self.style.ERROR(f'  - {error}'))
        
        # Summary
        if options['dry_run']:
            self.stdout.write(
                self.style.SUCCESS('DRY RUN completed - no notifications were actually sent')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Daily notifications completed: {total_sent} sent, {total_errors} errors'
                )
            )
        
        self.stdout.write(f'Finished at {timezone.now()}')
