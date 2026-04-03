"""
Partner Security Module
Handles password policy, PIN management, and 90-day rotation enforcement.
"""

import re
from datetime import datetime, timezone, timedelta
from uuid import uuid4


# Default security settings (Master Admin configurable)
DEFAULT_SECURITY_SETTINGS = {
    "password_min_length": 7,
    "password_require_upper": True,
    "password_require_lower": True,
    "password_min_numbers": 2,
    "password_min_special": 2,
    "password_banned_special": ["!"],
    "pin_length": 6,
    "pin_no_shared_digits_with_password": True,
    "rotation_days": 90,
}


def validate_partner_password(password: str, settings: dict = None):
    """Validate password against security policy. Returns (bool, error_message)."""
    # Merge with defaults to ensure all keys exist
    s = {**DEFAULT_SECURITY_SETTINGS, **(settings or {})}
    errors = []

    min_len = s.get("password_min_length", 7)
    if len(password) < min_len:
        errors.append(f"Password must be at least {min_len} characters")

    if s.get("password_require_upper") and not re.search(r'[A-Z]', password):
        errors.append("Password must include at least one uppercase letter")

    if s.get("password_require_lower") and not re.search(r'[a-z]', password):
        errors.append("Password must include at least one lowercase letter")

    num_count = len(re.findall(r'[0-9]', password))
    min_nums = s.get("password_min_numbers", 2)
    if num_count < min_nums:
        errors.append(f"Password must include at least {min_nums} numbers")

    special_chars = re.findall(r'[^a-zA-Z0-9]', password)
    banned = s.get("password_banned_special", ["!"])
    for c in special_chars:
        if c in banned:
            errors.append(f"Password cannot contain the character '{c}'")

    valid_specials = [c for c in special_chars if c not in banned]
    min_special = s.get("password_min_special", 2)
    if len(valid_specials) < min_special:
        errors.append(f"Password must include at least {min_special} special characters (not {''.join(banned)})")

    return (len(errors) == 0, "; ".join(errors) if errors else "")


def validate_partner_pin(pin: str, password: str, settings: dict = None):
    """Validate 6-digit PIN. Returns (bool, error_message)."""
    s = settings or DEFAULT_SECURITY_SETTINGS
    errors = []

    pin_len = s.get("pin_length", 6)
    if len(pin) != pin_len:
        errors.append(f"PIN must be exactly {pin_len} digits")

    if not pin.isdigit():
        errors.append("PIN must contain only digits")

    if s.get("pin_no_shared_digits_with_password", True) and password:
        password_digits = set(re.findall(r'[0-9]', password))
        pin_digits = set(pin)
        shared = password_digits & pin_digits
        if shared:
            errors.append(f"PIN cannot contain digits found in your password ({', '.join(sorted(shared))})")

    return (len(errors) == 0, "; ".join(errors) if errors else "")


def check_rotation_needed(last_set_date: str, rotation_days: int = 90):
    """Check if password/PIN rotation is needed."""
    if not last_set_date:
        return True
    try:
        last = datetime.fromisoformat(last_set_date.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return (now - last).days >= rotation_days
    except (ValueError, TypeError):
        return True
