const nodemailer = require('nodemailer');
const { EMAIL_TEMPLATES } = require('../config/constants');
const logger = require('../utils/logger');
const { formatDate, formatCurrency } = require('../utils/helpers');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify connection
      await this.transporter.verify();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  // Send welcome email to new students
  async sendWelcomeEmail(studentData) {
    try {
      const subject = 'Welcome to R.B Computer Institute';
      const html = this.generateWelcomeTemplate(studentData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: studentData.email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Welcome email sent successfully', {
        to: studentData.email,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Send fee reminder email
  async sendFeeReminderEmail(feeData) {
    try {
      const subject = `Fee Reminder - ${feeData.course.name}`;
      const html = this.generateFeeReminderTemplate(feeData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: feeData.student.email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Fee reminder email sent successfully', {
        to: feeData.student.email,
        feeId: feeData._id,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Error sending fee reminder email:', error);
      throw error;
    }
  }

  // Send attendance alert email
  async sendAttendanceAlertEmail(studentData, attendanceData) {
    try {
      const subject = 'Attendance Alert - Low Attendance Warning';
      const html = this.generateAttendanceAlertTemplate(studentData, attendanceData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: studentData.email,
        cc: studentData.parentDetails?.parentEmail,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Attendance alert email sent successfully', {
        to: studentData.email,
        studentId: studentData._id,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Error sending attendance alert email:', error);
      throw error;
    }
  }

  // Send certificate issued notification
  async sendCertificateIssuedEmail(certificateData) {
    try {
      const subject = 'Certificate Issued - Congratulations!';
      const html = this.generateCertificateIssuedTemplate(certificateData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: certificateData.student.email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Certificate issued email sent successfully', {
        to: certificateData.student.email,
        certificateId: certificateData._id,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Error sending certificate issued email:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(userData, resetToken) {
    try {
      const subject = 'Password Reset Request';
      const html = this.generatePasswordResetTemplate(userData, resetToken);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: userData.email,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Password reset email sent successfully', {
        to: userData.email,
        userId: userData._id,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Send weekly report email
  async sendWeeklyReportEmail(reportData, recipientEmail) {
    try {
      const subject = `Weekly Report - ${formatDate(new Date())}`;
      const html = this.generateWeeklyReportTemplate(reportData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: recipientEmail,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Weekly report email sent successfully', {
        to: recipientEmail,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Error sending weekly report email:', error);
      throw error;
    }
  }

  // Send bulk emails
  async sendBulkEmails(emailList, subject, template, templateData) {
    try {
      const results = {
        successful: [],
        failed: [],
        total: emailList.length
      };

      for (const email of emailList) {
        try {
          const html = this.generateCustomTemplate(template, { ...templateData, email });
          
          const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject,
            html
          };

          const result = await this.transporter.sendMail(mailOptions);
          
          results.successful.push({
            email,
            messageId: result.messageId
          });

        } catch (error) {
          results.failed.push({
            email,
            error: error.message
          });
        }
      }

      logger.info('Bulk emails sent', {
        total: results.total,
        successful: results.successful.length,
        failed: results.failed.length
      });

      return results;

    } catch (error) {
      logger.error('Error sending bulk emails:', error);
      throw error;
    }
  }

  // Template generators
  generateWelcomeTemplate(studentData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f4e79; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to R.B Computer Institute</h1>
          </div>
          <div class="content">
            <h2>Dear ${studentData.firstName} ${studentData.lastName},</h2>
            <p>Welcome to R.B Computer Institute! We're excited to have you join our learning community.</p>
            <p><strong>Your Details:</strong></p>
            <ul>
              <li>Student ID: ${studentData.admissionUID}</li>
              <li>Email: ${studentData.email}</li>
              <li>Phone: ${studentData.phone}</li>
            </ul>
            <p>Your temporary password has been sent separately. Please change it upon first login.</p>
            <p>We look forward to supporting your educational journey!</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>R.B Computer Institute Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateFeeReminderTemplate(feeData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d4af37; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #d4af37; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Fee Reminder</h1>
          </div>
          <div class="content">
            <h2>Dear ${feeData.student.firstName} ${feeData.student.lastName},</h2>
            <p>This is a reminder that your fee payment is due.</p>
            <p><strong>Fee Details:</strong></p>
            <ul>
              <li>Course: ${feeData.course.name}</li>
              <li>Fee Type: ${feeData.feeType}</li>
              <li>Amount Due: <span class="amount">${formatCurrency(feeData.pendingAmount)}</span></li>
              <li>Due Date: ${formatDate(feeData.dueDate)}</li>
            </ul>
            <p>Please make the payment at your earliest convenience to avoid any inconvenience.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>R.B Computer Institute</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateAttendanceAlertTemplate(studentData, attendanceData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .warning { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Attendance Alert</h1>
          </div>
          <div class="content">
            <h2>Dear ${studentData.firstName} ${studentData.lastName},</h2>
            <p class="warning">Your attendance has fallen below the required minimum.</p>
            <p><strong>Attendance Summary:</strong></p>
            <ul>
              <li>Total Classes: ${attendanceData.totalClasses}</li>
              <li>Classes Attended: ${attendanceData.attendedClasses}</li>
              <li>Attendance Percentage: <span class="warning">${attendanceData.attendancePercentage}%</span></li>
              <li>Required Minimum: 75%</li>
            </ul>
            <p>Please ensure regular attendance to maintain your academic standing.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>R.B Computer Institute</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateCertificateIssuedTemplate(certificateData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .certificate-no { font-size: 18px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Certificate Issued!</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${certificateData.student.firstName} ${certificateData.student.lastName}!</h2>
            <p>Your certificate has been successfully issued.</p>
            <p><strong>Certificate Details:</strong></p>
            <ul>
              <li>Certificate Number: <span class="certificate-no">${certificateData.certificateNumber}</span></li>
              <li>Course: ${certificateData.course.name}</li>
              <li>Issue Date: ${formatDate(certificateData.issueDate)}</li>
              <li>Grade: ${certificateData.grade?.letter || 'N/A'}</li>
            </ul>
            <p>You can download your certificate from the student portal.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>R.B Computer Institute</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetTemplate(userData, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f4e79; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .button { background: #1f4e79; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Dear ${userData.firstName} ${userData.lastName},</h2>
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>R.B Computer Institute</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWeeklyReportTemplate(reportData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f4e79; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; }
          .stat { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #1f4e79; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Weekly Report</h1>
            <p>${formatDate(new Date())}</p>
          </div>
          <div class="content">
            <h2>Institute Summary</h2>
            <div class="stat">
              <strong>Total Students:</strong> ${reportData.totalStudents || 0}
            </div>
            <div class="stat">
              <strong>New Admissions:</strong> ${reportData.newAdmissions || 0}
            </div>
            <div class="stat">
              <strong>Fee Collection:</strong> ${formatCurrency(reportData.feeCollection || 0)}
            </div>
            <div class="stat">
              <strong>Average Attendance:</strong> ${reportData.averageAttendance || 0}%
            </div>
            <div class="stat">
              <strong>Certificates Issued:</strong> ${reportData.certificatesIssued || 0}
            </div>
          </div>
          <div class="footer">
            <p>Generated automatically by R.B Computer Institute System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateCustomTemplate(template, data) {
    // Simple template replacement
    let html = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key]);
    });
    return html;
  }
}

module.exports = new EmailService();
