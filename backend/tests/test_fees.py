"""
Unit tests for fees module
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta
from django.urls import reverse
from rest_framework import status
from apps.fees.models import Fee, FeePayment
from .base import BaseAPITestCase, APIResponseMixin, TestDataMixin
from .factories import FeeFactory, FeePaymentFactory, StudentFactory, CourseFactory


@pytest.mark.unit
class FeeModelTestCase(BaseAPITestCase):
    """Test Fee model"""
    
    def test_fee_creation(self):
        """Test fee creation"""
        student = StudentFactory()
        fee = FeeFactory(
            student=student,
            amount=Decimal('5000.00'),
            fee_type='course_fee',
            status='pending'
        )
        self.assertEqual(fee.student, student)
        self.assertEqual(fee.amount, Decimal('5000.00'))
        self.assertEqual(fee.fee_type, 'course_fee')
        self.assertEqual(fee.status, 'pending')
    
    def test_fee_string_representation(self):
        """Test fee string representation"""
        student = StudentFactory()
        fee = FeeFactory(student=student, amount=Decimal('5000.00'))
        expected = f"{student.user.get_full_name()} - ₹5000.00"
        self.assertEqual(str(fee), expected)
    
    def test_fee_is_overdue(self):
        """Test fee overdue status"""
        # Create overdue fee
        overdue_date = date.today() - timedelta(days=10)
        overdue_fee = FeeFactory(due_date=overdue_date, status='pending')
        self.assertTrue(overdue_fee.is_overdue)
        
        # Create future fee
        future_date = date.today() + timedelta(days=10)
        future_fee = FeeFactory(due_date=future_date, status='pending')
        self.assertFalse(future_fee.is_overdue)
        
        # Paid fee should not be overdue
        paid_fee = FeeFactory(due_date=overdue_date, status='paid')
        self.assertFalse(paid_fee.is_overdue)
    
    def test_fee_remaining_amount(self):
        """Test fee remaining amount calculation"""
        fee = FeeFactory(amount=Decimal('5000.00'))
        
        # No payments made
        self.assertEqual(fee.remaining_amount, Decimal('5000.00'))
        
        # Partial payment
        FeePaymentFactory(fee=fee, amount=Decimal('2000.00'))
        fee.refresh_from_db()
        self.assertEqual(fee.remaining_amount, Decimal('3000.00'))
        
        # Full payment
        FeePaymentFactory(fee=fee, amount=Decimal('3000.00'))
        fee.refresh_from_db()
        self.assertEqual(fee.remaining_amount, Decimal('0.00'))
    
    def test_fee_total_paid(self):
        """Test fee total paid calculation"""
        fee = FeeFactory(amount=Decimal('5000.00'))
        
        # Create multiple payments
        FeePaymentFactory(fee=fee, amount=Decimal('2000.00'))
        FeePaymentFactory(fee=fee, amount=Decimal('1500.00'))
        
        fee.refresh_from_db()
        self.assertEqual(fee.total_paid, Decimal('3500.00'))


@pytest.mark.unit
class FeePaymentModelTestCase(BaseAPITestCase):
    """Test FeePayment model"""
    
    def test_payment_creation(self):
        """Test fee payment creation"""
        fee = FeeFactory()
        payment = FeePaymentFactory(
            fee=fee,
            amount=Decimal('2000.00'),
            payment_method='cash'
        )
        self.assertEqual(payment.fee, fee)
        self.assertEqual(payment.amount, Decimal('2000.00'))
        self.assertEqual(payment.payment_method, 'cash')
    
    def test_payment_string_representation(self):
        """Test payment string representation"""
        fee = FeeFactory()
        payment = FeePaymentFactory(fee=fee, amount=Decimal('2000.00'))
        expected = f"Payment of ₹2000.00 for {fee.student.user.get_full_name()}"
        self.assertEqual(str(payment), expected)


@pytest.mark.api
class FeeAPITestCase(BaseAPITestCase, APIResponseMixin, TestDataMixin):
    """Test Fee API endpoints"""
    
    def test_list_fees_admin(self):
        """Test listing fees as admin"""
        self.authenticate_admin()
        
        # Create test fees
        fees = [FeeFactory() for _ in range(5)]
        
        url = reverse('fees:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertPaginatedResponse(response)
    
    def test_list_fees_student_own_only(self):
        """Test student can only see own fees"""
        self.authenticate_student()
        
        # Create fee for authenticated student
        student_fee = FeeFactory(student=self.student)
        
        # Create fee for another student
        other_student = StudentFactory()
        other_fee = FeeFactory(student=other_student)
        
        url = reverse('fees:my_fees')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['id'], student_fee.id)
    
    def test_create_fee(self):
        """Test creating a new fee"""
        self.authenticate_admin()
        student = StudentFactory()
        
        url = reverse('fees:list')
        data = {
            'student': student.id,
            'amount': '5000.00',
            'due_date': '2024-12-31',
            'fee_type': 'course_fee',
            'description': 'Course fee for Python programming'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify fee was created
        fee = Fee.objects.get(student=student)
        self.assertEqual(fee.amount, Decimal('5000.00'))
        self.assertEqual(fee.fee_type, 'course_fee')
    
    def test_create_fee_student_forbidden(self):
        """Test student cannot create fees"""
        self.authenticate_student()
        
        url = reverse('fees:list')
        data = {
            'student': self.student.id,
            'amount': '1000.00',
            'due_date': '2024-12-31',
            'fee_type': 'course_fee'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_fee_detail(self):
        """Test getting fee details"""
        self.authenticate_admin()
        fee = FeeFactory()
        
        url = reverse('fees:detail', kwargs={'pk': fee.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['id'], fee.id)
        self.assertEqual(Decimal(data['amount']), fee.amount)
    
    def test_update_fee(self):
        """Test updating fee information"""
        self.authenticate_admin()
        fee = FeeFactory()
        
        url = reverse('fees:detail', kwargs={'pk': fee.id})
        data = {
            'amount': '6000.00',
            'description': 'Updated fee description'
        }
        response = self.patch_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        fee.refresh_from_db()
        self.assertEqual(fee.amount, Decimal('6000.00'))
        self.assertEqual(fee.description, 'Updated fee description')
    
    def test_delete_fee(self):
        """Test deleting a fee"""
        self.authenticate_admin()
        fee = FeeFactory()
        
        url = reverse('fees:detail', kwargs={'pk': fee.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify fee was deleted
        self.assertFalse(Fee.objects.filter(id=fee.id).exists())
    
    def test_bulk_create_fees(self):
        """Test bulk fee creation"""
        self.authenticate_admin()
        students = [StudentFactory() for _ in range(3)]
        
        url = reverse('fees:bulk_create')
        data = {
            'students': [s.id for s in students],
            'amount': '5000.00',
            'due_date': '2024-12-31',
            'fee_type': 'course_fee',
            'description': 'Bulk created course fee'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify fees were created for all students
        for student in students:
            fee = Fee.objects.get(student=student)
            self.assertEqual(fee.amount, Decimal('5000.00'))
    
    def test_fee_statistics(self):
        """Test fee statistics endpoint"""
        self.authenticate_admin()
        
        # Create test fees with different statuses
        FeeFactory(amount=Decimal('5000.00'), status='paid')
        FeeFactory(amount=Decimal('3000.00'), status='pending')
        FeeFactory(amount=Decimal('2000.00'), status='overdue')
        
        url = reverse('fees:stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('total_fees', data)
        self.assertIn('paid_amount', data)
        self.assertIn('pending_amount', data)
        self.assertIn('overdue_amount', data)
    
    def test_fee_reports(self):
        """Test fee reports endpoint"""
        self.authenticate_admin()
        
        # Create test data
        FeeFactory.create_batch(5)
        
        url = reverse('fees:reports')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertIn('monthly_collection', data)
        self.assertIn('fee_status_breakdown', data)
    
    def test_filter_fees_by_status(self):
        """Test filtering fees by status"""
        self.authenticate_admin()
        
        paid_fee = FeeFactory(status='paid')
        pending_fee = FeeFactory(status='pending')
        
        url = reverse('fees:list')
        response = self.client.get(url, {'status': 'paid'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], paid_fee.id)
    
    def test_filter_fees_by_student(self):
        """Test filtering fees by student"""
        self.authenticate_admin()
        
        student1 = StudentFactory()
        student2 = StudentFactory()
        
        fee1 = FeeFactory(student=student1)
        fee2 = FeeFactory(student=student2)
        
        url = reverse('fees:list')
        response = self.client.get(url, {'student': student1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], fee1.id)


@pytest.mark.api
class FeePaymentAPITestCase(BaseAPITestCase, APIResponseMixin):
    """Test FeePayment API endpoints"""
    
    def test_create_payment(self):
        """Test creating a fee payment"""
        self.authenticate_admin()
        fee = FeeFactory(amount=Decimal('5000.00'), status='pending')
        
        url = reverse('fees:payments', kwargs={'fee_pk': fee.id})
        data = {
            'amount': '2000.00',
            'payment_method': 'cash',
            'payment_date': '2024-01-15',
            'transaction_id': 'TXN123456'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify payment was created
        payment = FeePayment.objects.get(fee=fee)
        self.assertEqual(payment.amount, Decimal('2000.00'))
        self.assertEqual(payment.payment_method, 'cash')
        
        # Verify fee remaining amount updated
        fee.refresh_from_db()
        self.assertEqual(fee.remaining_amount, Decimal('3000.00'))
    
    def test_full_payment_updates_status(self):
        """Test full payment updates fee status to paid"""
        self.authenticate_admin()
        fee = FeeFactory(amount=Decimal('5000.00'), status='pending')
        
        url = reverse('fees:payments', kwargs={'fee_pk': fee.id})
        data = {
            'amount': '5000.00',
            'payment_method': 'online',
            'payment_date': '2024-01-15'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify fee status updated to paid
        fee.refresh_from_db()
        self.assertEqual(fee.status, 'paid')
        self.assertEqual(fee.remaining_amount, Decimal('0.00'))
    
    def test_overpayment_not_allowed(self):
        """Test overpayment is not allowed"""
        self.authenticate_admin()
        fee = FeeFactory(amount=Decimal('5000.00'), status='pending')
        
        url = reverse('fees:payments', kwargs={'fee_pk': fee.id})
        data = {
            'amount': '6000.00',  # More than fee amount
            'payment_method': 'cash',
            'payment_date': '2024-01-15'
        }
        response = self.post_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_payments_for_fee(self):
        """Test listing payments for a specific fee"""
        self.authenticate_admin()
        fee = FeeFactory()
        
        # Create payments for this fee
        payments = [FeePaymentFactory(fee=fee) for _ in range(3)]
        
        url = reverse('fees:payments', kwargs={'fee_pk': fee.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()
        self.assertEqual(len(data), 3)
    
    def test_update_payment(self):
        """Test updating a payment"""
        self.authenticate_admin()
        fee = FeeFactory()
        payment = FeePaymentFactory(fee=fee)
        
        url = reverse('fees:payment_detail', kwargs={'fee_pk': fee.id, 'pk': payment.id})
        data = {
            'payment_method': 'online',
            'transaction_id': 'UPDATED123'
        }
        response = self.patch_json(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        payment.refresh_from_db()
        self.assertEqual(payment.payment_method, 'online')
        self.assertEqual(payment.transaction_id, 'UPDATED123')
    
    def test_delete_payment(self):
        """Test deleting a payment"""
        self.authenticate_admin()
        fee = FeeFactory(amount=Decimal('5000.00'))
        payment = FeePaymentFactory(fee=fee, amount=Decimal('2000.00'))
        
        # Verify initial state
        fee.refresh_from_db()
        self.assertEqual(fee.remaining_amount, Decimal('3000.00'))
        
        url = reverse('fees:payment_detail', kwargs={'fee_pk': fee.id, 'pk': payment.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify payment was deleted and fee amount restored
        self.assertFalse(FeePayment.objects.filter(id=payment.id).exists())
        fee.refresh_from_db()
        self.assertEqual(fee.remaining_amount, Decimal('5000.00'))


@pytest.mark.integration
class FeeIntegrationTestCase(BaseAPITestCase):
    """Integration tests for fee workflows"""
    
    def test_complete_fee_payment_workflow(self):
        """Test complete fee payment workflow"""
        self.authenticate_admin()
        student = StudentFactory()
        
        # Step 1: Create fee
        fee_url = reverse('fees:list')
        fee_data = {
            'student': student.id,
            'amount': '10000.00',
            'due_date': '2024-12-31',
            'fee_type': 'course_fee',
            'description': 'Full course fee'
        }
        response = self.post_json(fee_url, fee_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        fee_id = response.json()['id']
        
        # Step 2: Make partial payment
        payment_url = reverse('fees:payments', kwargs={'fee_pk': fee_id})
        payment_data = {
            'amount': '4000.00',
            'payment_method': 'cash',
            'payment_date': '2024-01-15'
        }
        response = self.post_json(payment_url, payment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Step 3: Verify fee status
        fee_detail_url = reverse('fees:detail', kwargs={'pk': fee_id})
        response = self.client.get(fee_detail_url)
        data = response.json()
        self.assertEqual(data['status'], 'partial')
        self.assertEqual(Decimal(data['remaining_amount']), Decimal('6000.00'))
        
        # Step 4: Make final payment
        final_payment_data = {
            'amount': '6000.00',
            'payment_method': 'online',
            'payment_date': '2024-02-15'
        }
        response = self.post_json(payment_url, final_payment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Step 5: Verify fee is fully paid
        response = self.client.get(fee_detail_url)
        data = response.json()
        self.assertEqual(data['status'], 'paid')
        self.assertEqual(Decimal(data['remaining_amount']), Decimal('0.00'))


@pytest.mark.performance
class FeePerformanceTestCase(BaseAPITestCase):
    """Performance tests for fee operations"""
    
    def test_list_fees_performance(self):
        """Test performance of listing fees"""
        self.authenticate_admin()
        
        # Create many fees
        FeeFactory.create_batch(100)
        
        url = reverse('fees:list')
        
        # Test query count
        with self.assertNumQueries(5):  # Should be optimized
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_fee_statistics_performance(self):
        """Test performance of fee statistics"""
        self.authenticate_admin()
        
        # Create many fees with payments
        for _ in range(50):
            fee = FeeFactory()
            FeePaymentFactory(fee=fee)
        
        url = reverse('fees:stats')
        
        with self.assertNumQueries(10):  # Should be optimized with aggregation
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
