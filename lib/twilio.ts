import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifyServiceSid) {
  throw new Error('Missing Twilio credentials');
}

const client = twilio(accountSid, authToken);

export const sendVerificationCode = async (phoneNumber: string) => {
  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
    return { success: true, status: verification.status };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { success: false, error };
  }
};

export const verifyCode = async (phoneNumber: string, code: string) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phoneNumber, code });
    return { 
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status 
    };
  } catch (error) {
    console.error('Error verifying code:', error);
    return { success: false, error };
  }
}; 