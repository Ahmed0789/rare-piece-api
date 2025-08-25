import twilio from 'twilio'; // npm install twilio
// Alternative: import AWS from 'aws-sdk'; // for AWS SNS

class SMSService {
  constructor() {
    // Twilio configuration
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    }

    // AWS SNS configuration (alternative)
    /*
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
      this.sns = new AWS.SNS();
    }
    */
  }

  // Send phone verification code
  async sendVerification({ to, code, expiresAt }) {
    const expiresInMinutes = Math.ceil((expiresAt - new Date()) / (1000 * 60));
    const message = `Your verification code is: ${code}. This code expires in ${expiresInMinutes} minutes. Do not share this code with anyone.`;

    return this.sendSMS(to, message);
  }

  // Send MFA code
  async sendMFACode({ to, code, expiresAt }) {
    const expiresInMinutes = Math.ceil((expiresAt - new Date()) / (1000 * 60));
    const message = `Security Alert: Your login verification code is: ${code}. Expires in ${expiresInMinutes} minutes. If this wasn't you, contact support immediately.`;

    return this.sendSMS(to, message);
  }

  // Generic SMS sending method
  async sendSMS(to, message) {
    try {
      if (!this.client) {
        throw new Error('SMS service not configured. Please set up Twilio credentials.');
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      console.log('SMS sent successfully:', result.sid);
      return result;

    } catch (error) {
      console.error('SMS send error:', error);
      throw error;
    }
  }

  // Alternative: Send SMS using AWS SNS
  /*
  async sendSMSWithAWS(to, message) {
    try {
      if (!this.sns) {
        throw new Error('AWS SNS not configured');
      }

      const params = {
        Message: message,
        PhoneNumber: to,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      };

      const result = await this.sns.publish(params).promise();
      console.log('SMS sent via AWS SNS:', result.MessageId);
      return result;

    } catch (error) {
      console.error('AWS SNS SMS error:', error);
      throw error;
    }
  }
  */
}

export default new SMSService();