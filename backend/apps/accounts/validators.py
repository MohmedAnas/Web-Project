import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class CustomPasswordValidator:
    """
    Custom password validator with enhanced security requirements
    """
    
    def __init__(self, min_length=8, require_uppercase=True, require_lowercase=True, 
                 require_numbers=True, require_special_chars=True):
        self.min_length = min_length
        self.require_uppercase = require_uppercase
        self.require_lowercase = require_lowercase
        self.require_numbers = require_numbers
        self.require_special_chars = require_special_chars
    
    def validate(self, password, user=None):
        """
        Validate password against security requirements
        """
        errors = []
        
        # Check minimum length
        if len(password) < self.min_length:
            errors.append(
                ValidationError(
                    _("Password must be at least %(min_length)d characters long."),
                    code='password_too_short',
                    params={'min_length': self.min_length},
                )
            )
        
        # Check for uppercase letters
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append(
                ValidationError(
                    _("Password must contain at least one uppercase letter."),
                    code='password_no_upper',
                )
            )
        
        # Check for lowercase letters
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append(
                ValidationError(
                    _("Password must contain at least one lowercase letter."),
                    code='password_no_lower',
                )
            )
        
        # Check for numbers
        if self.require_numbers and not re.search(r'\d', password):
            errors.append(
                ValidationError(
                    _("Password must contain at least one number."),
                    code='password_no_number',
                )
            )
        
        # Check for special characters
        if self.require_special_chars and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append(
                ValidationError(
                    _("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)."),
                    code='password_no_special',
                )
            )
        
        # Check for common patterns
        if self._has_common_patterns(password):
            errors.append(
                ValidationError(
                    _("Password contains common patterns that are not secure."),
                    code='password_common_pattern',
                )
            )
        
        # Check against user information
        if user and self._contains_user_info(password, user):
            errors.append(
                ValidationError(
                    _("Password cannot contain personal information."),
                    code='password_contains_user_info',
                )
            )
        
        if errors:
            raise ValidationError(errors)
    
    def _has_common_patterns(self, password):
        """
        Check for common insecure patterns
        """
        common_patterns = [
            r'123456',
            r'password',
            r'qwerty',
            r'abc123',
            r'admin',
            r'letmein',
            r'welcome',
            r'monkey',
            r'dragon',
            r'master',
        ]
        
        password_lower = password.lower()
        for pattern in common_patterns:
            if pattern in password_lower:
                return True
        
        # Check for keyboard patterns
        keyboard_patterns = [
            r'qwertyuiop',
            r'asdfghjkl',
            r'zxcvbnm',
            r'1234567890',
        ]
        
        for pattern in keyboard_patterns:
            if pattern in password_lower or pattern[::-1] in password_lower:
                return True
        
        return False
    
    def _contains_user_info(self, password, user):
        """
        Check if password contains user information
        """
        password_lower = password.lower()
        
        # Check email
        if user.email:
            email_parts = user.email.lower().split('@')
            if email_parts[0] in password_lower:
                return True
        
        # Check name
        if user.name:
            name_parts = user.name.lower().split()
            for part in name_parts:
                if len(part) > 2 and part in password_lower:
                    return True
        
        # Check phone (if available)
        if hasattr(user, 'phone') and user.phone:
            phone_digits = re.sub(r'\D', '', user.phone)
            if len(phone_digits) > 4 and phone_digits in password:
                return True
        
        return False
    
    def get_help_text(self):
        """
        Return help text for password requirements
        """
        requirements = [
            f"at least {self.min_length} characters long"
        ]
        
        if self.require_uppercase:
            requirements.append("at least one uppercase letter")
        
        if self.require_lowercase:
            requirements.append("at least one lowercase letter")
        
        if self.require_numbers:
            requirements.append("at least one number")
        
        if self.require_special_chars:
            requirements.append("at least one special character")
        
        return _("Password must be %(requirements)s.") % {
            'requirements': ', '.join(requirements)
        }


def validate_email_format(email):
    """
    Validate email format with enhanced checks
    """
    if not email:
        raise ValidationError(_("Email is required."))
    
    # Basic email format check
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationError(_("Enter a valid email address."))
    
    # Check for suspicious patterns
    suspicious_patterns = [
        r'\.{2,}',  # Multiple consecutive dots
        r'^\.|\.$',  # Starting or ending with dot
        r'@.*@',  # Multiple @ symbols
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, email):
            raise ValidationError(_("Email format is not valid."))
    
    # Check domain length
    domain = email.split('@')[1]
    if len(domain) > 253:
        raise ValidationError(_("Email domain is too long."))
    
    return email


def validate_phone_number(phone):
    """
    Validate phone number format
    """
    if not phone:
        return phone
    
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    
    # Check length (assuming international format)
    if len(digits_only) < 10 or len(digits_only) > 15:
        raise ValidationError(_("Phone number must be between 10 and 15 digits."))
    
    # Check for suspicious patterns
    if len(set(digits_only)) == 1:  # All same digits
        raise ValidationError(_("Phone number format is not valid."))
    
    return phone


def validate_student_id(student_id):
    """
    Validate student ID format
    """
    if not student_id:
        raise ValidationError(_("Student ID is required."))
    
    # Check format (alphanumeric, 6-20 characters)
    if not re.match(r'^[A-Za-z0-9]{6,20}$', student_id):
        raise ValidationError(
            _("Student ID must be 6-20 characters long and contain only letters and numbers.")
        )
    
    return student_id.upper()


def validate_course_code(course_code):
    """
    Validate course code format
    """
    if not course_code:
        raise ValidationError(_("Course code is required."))
    
    # Check format (alphanumeric with optional hyphens, 3-10 characters)
    if not re.match(r'^[A-Za-z0-9-]{3,10}$', course_code):
        raise ValidationError(
            _("Course code must be 3-10 characters long and contain only letters, numbers, and hyphens.")
        )
    
    return course_code.upper()


def validate_positive_decimal(value):
    """
    Validate that a decimal value is positive
    """
    if value is None:
        raise ValidationError(_("This field is required."))
    
    if value <= 0:
        raise ValidationError(_("Value must be greater than zero."))
    
    return value


def validate_positive_integer(value):
    """
    Validate that an integer value is positive
    """
    if value is None:
        raise ValidationError(_("This field is required."))
    
    if value <= 0:
        raise ValidationError(_("Value must be greater than zero."))
    
    return value
