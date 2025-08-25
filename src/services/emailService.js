import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Configure your email transporter (example with Gmail)
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
      }
    });

    // Or use SMTP configuration
    /*
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    */
  }

  // Send email verification code
  async sendVerification({ to, name, code, expiresAt }) {
    const expiresInMinutes = Math.ceil((expiresAt - new Date()) / (1000 * 60));
    
    const mailOptions = {
      from: {
        name: process.env.APP_NAME || 'Rare Piece Limited',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: to,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello ${name || 'there'},</p>
          <p>Thank you for registering! Please use the following verification code to verify your email address:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
          </div>
          
          <p><strong>This code will expire in ${expiresInMinutes} minutes.</strong></p>
          
          <p>If you didn't request this verification, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email verification sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  // Send MFA code
  async sendMFACode({ to, name, code, ipAddress, expiresAt }) {
    const expiresInMinutes = Math.ceil((expiresAt - new Date()) / (1000 * 60));
    
    const mailOptions = {
      from: {
        name: process.env.APP_NAME || 'Your App',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: to,
      subject: 'Security Alert - Login Verification Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">🔐 Security Alert</h2>
          <p>Hello ${name || 'there'},</p>
          <p>We detected a login attempt from a new device or location:</p>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <strong>IP Address:</strong> ${ipAddress || 'Unknown'}<br>
            <strong>Time:</strong> ${new Date().toLocaleString()}
          </div>
          
          <p>If this was you, please use the following verification code to complete your login:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
          </div>
          
          <p><strong>This code will expire in ${expiresInMinutes} minutes.</strong></p>
          
          <div style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <strong>⚠️ If this wasn't you:</strong><br>
            Someone may be trying to access your account. Please change your password immediately and contact support.
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated security message, please do not reply to this email.
          </p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('MFA email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('MFA email send error:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordReset({ to, name, resetToken, expiresAt }) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const expiresInMinutes = Math.ceil((expiresAt - new Date()) / (1000 * 60));
    
    const mailOptions = {
      from: {
        name: process.env.APP_NAME || 'Your App',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: to,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>Hello ${name || 'there'},</p>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          
          <p><strong>This link will expire in ${expiresInMinutes} minutes.</strong></p>
          
          <p>If you didn't request this password reset, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Password reset email send error:', error);
      throw error;
    }
  }
}

export default new EmailService();

// services/smsService.js
