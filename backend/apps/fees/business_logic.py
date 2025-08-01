"""
Fee Calculation Business Logic
"""
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from .models import FeeStructure, StudentFee
from apps.students.models import StudentEnrollment


class FeeCalculator:
    """Handle all fee calculation logic"""
    
    # Batch-based fee multipliers
    BATCH_MULTIPLIERS = {
        'morning': Decimal('1.0'),    # Standard rate
        'afternoon': Decimal('0.95'), # 5% discount
        'evening': Decimal('1.1'),    # 10% premium
    }
    
    # Duration-based discounts
    DURATION_DISCOUNTS = {
        1: Decimal('0'),      # No discount for 1 month
        3: Decimal('5'),      # 5% discount for 3 months
        6: Decimal('10'),     # 10% discount for 6 months
        12: Decimal('15'),    # 15% discount for 12 months
    }
    
    # Early bird discount (if paid before course starts)
    EARLY_BIRD_DISCOUNT = Decimal('5')  # 5% discount
    
    @classmethod
    def calculate_course_fee(cls, course, duration_months, batch='morning', 
                           early_bird=False, custom_discount=None):
        """
        Calculate total fee for a course enrollment
        
        Args:
            course: Course instance
            duration_months: Duration in months
            batch: Batch type (morning/afternoon/evening)
            early_bird: Whether early bird discount applies
            custom_discount: Custom discount percentage
            
        Returns:
            dict: Fee breakdown
        """
        base_fee = course.fee
        registration_fee = Decimal('500')  # Standard registration fee
        
        # Apply batch multiplier
        batch_multiplier = cls.BATCH_MULTIPLIERS.get(batch, Decimal('1.0'))
        adjusted_base_fee = base_fee * batch_multiplier
        
        # Apply duration discount
        duration_discount_percent = cls.DURATION_DISCOUNTS.get(duration_months, Decimal('0'))
        duration_discount_amount = (adjusted_base_fee * duration_discount_percent) / 100
        
        # Apply early bird discount
        early_bird_discount_amount = Decimal('0')
        if early_bird:
            early_bird_discount_amount = (adjusted_base_fee * cls.EARLY_BIRD_DISCOUNT) / 100
        
        # Apply custom discount
        custom_discount_amount = Decimal('0')
        if custom_discount:
            custom_discount_amount = (adjusted_base_fee * Decimal(str(custom_discount))) / 100
        
        # Calculate totals
        total_discount = (duration_discount_amount + early_bird_discount_amount + 
                         custom_discount_amount)
        
        subtotal = adjusted_base_fee - total_discount
        total_fee = subtotal + registration_fee
        
        return {
            'base_fee': base_fee,
            'batch_multiplier': batch_multiplier,
            'adjusted_base_fee': adjusted_base_fee,
            'registration_fee': registration_fee,
            'duration_discount_percent': duration_discount_percent,
            'duration_discount_amount': duration_discount_amount,
            'early_bird_discount_amount': early_bird_discount_amount,
            'custom_discount_amount': custom_discount_amount,
            'total_discount': total_discount,
            'subtotal': subtotal,
            'total_fee': total_fee,
            'breakdown': {
                'course_fee': adjusted_base_fee,
                'registration_fee': registration_fee,
                'discounts': total_discount,
                'final_amount': total_fee
            }
        }
    
    @classmethod
    def create_fee_structure_if_not_exists(cls, course, duration_months, 
                                         custom_discount=None):
        """
        Create fee structure if it doesn't exist
        """
        fee_structure, created = FeeStructure.objects.get_or_create(
            course=course,
            duration_months=duration_months,
            defaults={
                'base_fee': course.fee,
                'registration_fee': Decimal('500'),
                'discount_percentage': custom_discount or Decimal('0'),
                'is_active': True
            }
        )
        return fee_structure, created
    
    @classmethod
    def calculate_installments(cls, total_amount, duration_months, 
                             installment_type='monthly'):
        """
        Calculate installment breakdown
        
        Args:
            total_amount: Total fee amount
            duration_months: Course duration
            installment_type: 'monthly', 'quarterly', 'half_yearly'
            
        Returns:
            list: Installment details
        """
        installments = []
        
        if installment_type == 'monthly':
            installment_amount = total_amount / duration_months
            for i in range(duration_months):
                due_date = timezone.now().date() + timedelta(days=30 * (i + 1))
                installments.append({
                    'installment_number': i + 1,
                    'amount': installment_amount,
                    'due_date': due_date,
                    'description': f'Month {i + 1} fee'
                })
        
        elif installment_type == 'quarterly' and duration_months >= 3:
            quarters = duration_months // 3
            installment_amount = total_amount / quarters
            for i in range(quarters):
                due_date = timezone.now().date() + timedelta(days=90 * (i + 1))
                installments.append({
                    'installment_number': i + 1,
                    'amount': installment_amount,
                    'due_date': due_date,
                    'description': f'Quarter {i + 1} fee'
                })
        
        elif installment_type == 'half_yearly' and duration_months >= 6:
            halves = duration_months // 6
            installment_amount = total_amount / halves
            for i in range(halves):
                due_date = timezone.now().date() + timedelta(days=180 * (i + 1))
                installments.append({
                    'installment_number': i + 1,
                    'amount': installment_amount,
                    'due_date': due_date,
                    'description': f'Half-year {i + 1} fee'
                })
        
        return installments
    
    @classmethod
    def apply_late_fee(cls, student_fee, days_overdue):
        """
        Calculate and apply late fee
        
        Args:
            student_fee: StudentFee instance
            days_overdue: Number of days overdue
            
        Returns:
            Decimal: Late fee amount
        """
        if days_overdue <= 0:
            return Decimal('0')
        
        # Late fee calculation: 2% per week or part thereof
        weeks_overdue = (days_overdue + 6) // 7  # Round up to nearest week
        late_fee_percent = min(weeks_overdue * 2, 20)  # Max 20% late fee
        
        late_fee = (student_fee.remaining_amount * Decimal(str(late_fee_percent))) / 100
        return late_fee
    
    @classmethod
    def calculate_refund(cls, student_fee, withdrawal_date):
        """
        Calculate refund amount for course withdrawal
        
        Args:
            student_fee: StudentFee instance
            withdrawal_date: Date of withdrawal
            
        Returns:
            dict: Refund calculation details
        """
        enrollment = student_fee.enrollment
        course_start_date = enrollment.start_date
        course_end_date = enrollment.end_date
        
        # No refund if course already started
        if withdrawal_date >= course_start_date:
            return {
                'refund_amount': Decimal('0'),
                'refund_percent': Decimal('0'),
                'reason': 'Course already started'
            }
        
        # Calculate days before course start
        days_before_start = (course_start_date - withdrawal_date).days
        
        # Refund policy
        if days_before_start >= 30:
            refund_percent = Decimal('90')  # 90% refund
        elif days_before_start >= 15:
            refund_percent = Decimal('75')  # 75% refund
        elif days_before_start >= 7:
            refund_percent = Decimal('50')  # 50% refund
        else:
            refund_percent = Decimal('25')  # 25% refund
        
        # Registration fee is non-refundable
        refundable_amount = student_fee.total_amount - student_fee.fee_structure.registration_fee
        refund_amount = (refundable_amount * refund_percent) / 100
        
        return {
            'refund_amount': refund_amount,
            'refund_percent': refund_percent,
            'refundable_amount': refundable_amount,
            'non_refundable_amount': student_fee.fee_structure.registration_fee,
            'days_before_start': days_before_start
        }


class FeeAutomation:
    """Automated fee-related processes"""
    
    @classmethod
    def create_enrollment_fees(cls, enrollment, installment_type='full'):
        """
        Automatically create fees when student enrolls
        
        Args:
            enrollment: StudentEnrollment instance
            installment_type: 'full', 'monthly', 'quarterly'
            
        Returns:
            list: Created StudentFee instances
        """
        # Calculate fee
        fee_calc = FeeCalculator.calculate_course_fee(
            course=enrollment.course,
            duration_months=enrollment.duration_months,
            batch=enrollment.batch,
            early_bird=enrollment.start_date > timezone.now().date()
        )
        
        # Get or create fee structure
        fee_structure, _ = FeeCalculator.create_fee_structure_if_not_exists(
            course=enrollment.course,
            duration_months=enrollment.duration_months
        )
        
        created_fees = []
        
        if installment_type == 'full':
            # Create single fee record
            student_fee = StudentFee.objects.create(
                student=enrollment.student,
                enrollment=enrollment,
                fee_structure=fee_structure,
                total_amount=fee_calc['total_fee'],
                due_date=enrollment.start_date
            )
            created_fees.append(student_fee)
        
        else:
            # Create installment fees
            installments = FeeCalculator.calculate_installments(
                total_amount=fee_calc['total_fee'],
                duration_months=enrollment.duration_months,
                installment_type=installment_type
            )
            
            for installment in installments:
                student_fee = StudentFee.objects.create(
                    student=enrollment.student,
                    enrollment=enrollment,
                    fee_structure=fee_structure,
                    total_amount=installment['amount'],
                    due_date=installment['due_date']
                )
                created_fees.append(student_fee)
        
        return created_fees
    
    @classmethod
    def update_overdue_fees(cls):
        """
        Update status of overdue fees and calculate late fees
        """
        today = timezone.now().date()
        overdue_fees = StudentFee.objects.filter(
            due_date__lt=today,
            status__in=['pending', 'partial']
        )
        
        updated_count = 0
        for fee in overdue_fees:
            days_overdue = (today - fee.due_date).days
            late_fee = FeeCalculator.apply_late_fee(fee, days_overdue)
            
            # Update fee with late charges
            if late_fee > 0:
                fee.total_amount += late_fee
                fee.status = 'overdue'
                fee.save()
                updated_count += 1
        
        return updated_count
