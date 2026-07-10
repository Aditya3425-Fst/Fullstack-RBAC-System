import axiosInstance from '../api/axiosInstance';

/**
 * Send OTP to any mobile number (registered or new).
 */
export const sendOTP = async (mobile) => {
  const response = await axiosInstance.post('/auth/send-otp', { mobile });
  return response.data;
};

/**
 * Verify OTP.
 * - Existing user  → { isNewUser: false, token, user }
 * - New number     → { isNewUser: true, mobile }
 */
export const verifyOTP = async (mobile, otp) => {
  const response = await axiosInstance.post('/auth/verify-otp', { mobile, otp });
  return response.data;
};

/**
 * Register new user after OTP verification and get JWT.
 */
export const registerUser = async (mobile, name, role) => {
  const response = await axiosInstance.post('/auth/register', { mobile, name, role });
  return response.data;
};
