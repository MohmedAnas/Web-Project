"""
Test factories for creating test data using factory_boy
"""

import factory
from django.contrib.auth import get_user_model
from apps.students.models import Student
from apps.courses.models import Course, CourseModule, CourseSchedule
from apps.fees.models import Fee, FeePayment
from apps.attendance.models import AttendanceSession, Attendance
from apps.notices.models import Notice
from apps.certificates.models import Certificate

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True
    role = 'student'

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        if not create:
            return
        password = extracted or 'testpass123'
        self.set_password(password)
        self.save()


class AdminUserFactory(UserFactory):
    role = 'admin'
    is_staff = True


class SuperAdminUserFactory(UserFactory):
    role = 'super_admin'
    is_staff = True
    is_superuser = True


class StudentUserFactory(UserFactory):
    role = 'student'


class CourseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Course

    name = factory.Faker('sentence', nb_words=3)
    description = factory.Faker('text', max_nb_chars=500)
    duration_months = factory.Faker('random_int', min=1, max=12)
    fee_amount = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    is_active = True


class CourseModuleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CourseModule

    course = factory.SubFactory(CourseFactory)
    name = factory.Faker('sentence', nb_words=2)
    description = factory.Faker('text', max_nb_chars=300)
    order = factory.Sequence(lambda n: n)


class CourseScheduleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CourseSchedule

    course = factory.SubFactory(CourseFactory)
    batch = factory.Faker('random_element', elements=['morning', 'afternoon', 'evening'])
    start_time = factory.Faker('time')
    end_time = factory.Faker('time')
    days_of_week = factory.Faker('random_element', elements=[
        'monday,wednesday,friday',
        'tuesday,thursday,saturday',
        'monday,tuesday,wednesday,thursday,friday'
    ])


class StudentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Student

    user = factory.SubFactory(StudentUserFactory)
    admission_uid = factory.Sequence(lambda n: f'RBC{n:06d}')
    phone = factory.Faker('phone_number')
    address = factory.Faker('address')
    date_of_birth = factory.Faker('date_of_birth', minimum_age=16, maximum_age=50)
    course = factory.SubFactory(CourseFactory)
    batch = factory.Faker('random_element', elements=['morning', 'afternoon', 'evening'])
    enrollment_date = factory.Faker('date_this_year')
    parent_name = factory.Faker('name')
    parent_email = factory.Faker('email')
    parent_phone = factory.Faker('phone_number')


class FeeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Fee

    student = factory.SubFactory(StudentFactory)
    amount = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    due_date = factory.Faker('future_date', end_date='+30d')
    fee_type = 'course_fee'
    status = 'pending'


class FeePaymentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FeePayment

    fee = factory.SubFactory(FeeFactory)
    amount = factory.LazyAttribute(lambda obj: obj.fee.amount)
    payment_method = 'cash'
    payment_date = factory.Faker('date_this_month')
    transaction_id = factory.Faker('uuid4')


class AttendanceSessionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AttendanceSession

    course = factory.SubFactory(CourseFactory)
    batch = factory.Faker('random_element', elements=['morning', 'afternoon', 'evening'])
    date = factory.Faker('date_this_month')
    start_time = factory.Faker('time')
    end_time = factory.Faker('time')
    topic = factory.Faker('sentence', nb_words=4)


class AttendanceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Attendance

    session = factory.SubFactory(AttendanceSessionFactory)
    student = factory.SubFactory(StudentFactory)
    status = 'present'


class NoticeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Notice

    title = factory.Faker('sentence', nb_words=5)
    content = factory.Faker('text', max_nb_chars=1000)
    priority = 'medium'
    is_active = True
    created_by = factory.SubFactory(AdminUserFactory)


class CertificateFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Certificate

    student = factory.SubFactory(StudentFactory)
    course = factory.SubFactory(CourseFactory)
    certificate_number = factory.Sequence(lambda n: f'CERT{n:08d}')
    issue_date = factory.Faker('date_this_year')
    grade = 'A'
    verification_code = factory.Faker('uuid4')
