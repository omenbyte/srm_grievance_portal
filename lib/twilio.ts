import twilio from 'twilio'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

// Validate Twilio configuration
if (!accountSid || !authToken || !verifyServiceSid) {
  console.error('Missing Twilio configuration:', {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasVerifyServiceSid: !!verifyServiceSid
  })
  throw new Error('Twilio configuration missing')
}

const client = twilio(accountSid, authToken)

export async function sendOTP(phone: string) {
  try {
    // Validate phone number format
    if (!phone.startsWith('+')) {
      throw new Error('Phone number must be in E.164 format (e.g., +91XXXXXXXXXX)')
    }

    console.log('Sending OTP to:', phone)

    // Send verification code using Twilio Verify
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone, channel: 'sms' })

    return {
      success: true,
      status: verification.status,
      message: 'Verification code sent successfully'
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

    // Verify the code using Twilio Verify
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code })

    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status,
      message: verificationCheck.status === 'approved' 
        ? 'OTP verified successfully' 
        : 'Invalid OTP'
    }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return {
      success: false,
      error: 'Invalid verification code. Please try again.'
    }
  }
} 