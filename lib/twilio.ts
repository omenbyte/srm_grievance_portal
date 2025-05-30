// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

// Hardcoded OTP for testing
const TEST_OTP = '123456'

// Validate Twilio configuration
if (!accountSid || !authToken || !verifyServiceSid) {
  console.error('Missing Twilio configuration:', {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasVerifyServiceSid: !!verifyServiceSid
  })
  throw new Error('Twilio configuration missing')
}

export async function sendOTP(phone: string) {
  try {
    // Validate phone number format
    if (!phone.startsWith('+')) {
      throw new Error('Phone number must be in E.164 format (e.g., +91XXXXXXXXXX)')
    }

    console.log('Sending OTP to:', phone)
    console.log('Test OTP:', TEST_OTP) // Log the test OTP

    return {
      success: true,
      status: 'pending',
      message: 'Test OTP sent successfully'
    }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return {
      success: false,
      error: 'Failed to send verification code. Please try again.'
    }
  }
}

export async function verifyOTP(phone: string, code: string) {
  try {
    // Validate phone number format
    if (!phone.startsWith('+')) {
      throw new Error('Phone number must be in E.164 format (e.g., +91XXXXXXXXXX)')
    }

    console.log('Verifying OTP for:', phone)
    console.log('Entered OTP:', code)
    console.log('Expected OTP:', TEST_OTP)

    // Check if the entered code matches the test OTP
    const isValid = code === TEST_OTP

    return {
      success: isValid,
      status: isValid ? 'approved' : 'failed',
      message: isValid ? 'OTP verified successfully' : 'Invalid OTP'
    }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return {
      success: false,
      error: 'Invalid verification code. Please try again.'
    }
  }
} 