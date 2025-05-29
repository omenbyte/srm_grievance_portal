// Hardcoded OTP for development
const DEV_OTP = "123456";

export async function sendOTP(phone: string) {
  try {
    // For development, just return success
    console.log(`[DEV] OTP ${DEV_OTP} would be sent to ${phone}`);
    return { success: true, status: 'pending' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { 
      success: false, 
      error: 'Failed to send verification code. Please try again.' 
    };
  }
}

export async function verifyOTP(phone: string, code: string) {
  try {
    // For development, check against hardcoded OTP
    const isValid = code === DEV_OTP;
    return { 
      success: isValid,
      status: isValid ? 'approved' : 'pending'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      error: 'Invalid verification code. Please try again.' 
    };
  }
} 