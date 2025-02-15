export const validateRegistrationForm = (
  name: string,
  email: string,
  password: string,
  cpassword: string,
  otp: string
) => {
  const errors: Record<string, string> = {};

  // Name validation
  if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    errors.password = "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    errors.password = "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    errors.password = "Password must contain at least one number";
  }

  // Confirm password validation
  if (password !== cpassword) {
    errors.cpassword = "Passwords do not match";
  }

  // OTP validation
  if (!/^\d{6}$/.test(otp)) {
    errors.otp = "OTP must be 6 digits";
  }

  return errors;
};
