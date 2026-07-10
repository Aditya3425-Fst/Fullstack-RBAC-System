export const validateMobile = (mobile) => {
  if (!mobile || mobile.trim() === '') return 'Mobile number is required.';
  if (!/^\d+$/.test(mobile)) return 'Mobile number must be numeric.';
  if (mobile.length !== 10) return 'Mobile number must be exactly 10 digits.';
  return null;
};

export const validateOTP = (otp) => {
  if (!otp || otp.trim() === '') return 'OTP is required.';
  if (!/^\d+$/.test(otp)) return 'OTP must be numeric.';
  if (otp.length !== 6) return 'OTP must be exactly 6 digits.';
  return null;
};

export const validateName = (name) => {
  if (!name || name.trim() === '') return 'Name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (name.trim().length > 100) return 'Name cannot exceed 100 characters.';
  return null;
};

export const validateRole = (role, allowedRoles) => {
  if (!role) return 'Role is required.';
  if (!allowedRoles.includes(role)) return `Role must be one of: ${allowedRoles.join(', ')}`;
  return null;
};
