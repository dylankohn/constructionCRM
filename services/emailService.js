const nodemailer = require('nodemailer');

// Create email transporter
// Using Gmail as example - you can switch to SendGrid, AWS SES, etc.
const createTransporter = () => {
  // For Gmail: You need to enable "Less secure app access" or use App Passwords
  // For production, use SendGrid, AWS SES, or similar service
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password, not regular password
      }
    });
  }
  
  // For other SMTP services
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, username) => {
  const transporter = createTransporter();
  
  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'https://www.beamliner.com'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Construction CRM'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Construction CRM',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #234848; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #4DA3A2; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${username}</strong>,</p>
            
            <p>We received a request to reset your password for your Construction CRM account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4DA3A2;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              • This link will expire in 1 hour<br>
              • If you didn't request this reset, please ignore this email<br>
              • Your password will remain unchanged until you create a new one
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            
            <p>Best regards,<br>
            The Construction CRM Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Construction CRM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${username},

We received a request to reset your password for your Construction CRM account.

Click this link to reset your password:
${resetUrl}

⚠️ This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.
Your password will remain unchanged until you create a new one.

Best regards,
The Construction CRM Team
    `.trim()
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send password reset confirmation email
 */
const sendPasswordResetConfirmation = async (email, username) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Construction CRM'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Successfully Reset - Construction CRM',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #234848; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 12px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${username}</strong>,</p>
            
            <div class="success">
              Your password has been successfully reset.
            </div>
            
            <p>You can now log in to your Construction CRM account with your new password.</p>
            
            <p>If you did not make this change, please contact support immediately.</p>
            
            <p>Best regards,<br>
            The Construction CRM Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Construction CRM. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${username},

✅ Your password has been successfully reset.

You can now log in to your Construction CRM account with your new password.

If you did not make this change, please contact support immediately.

Best regards,
The Construction CRM Team
    `.trim()
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset confirmation sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    // Don't throw error for confirmation emails
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation
};

