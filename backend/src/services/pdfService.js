const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDate, formatCurrency } = require('../utils/helpers');
const logger = require('../utils/logger');

class PDFService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.certificatesDir = path.join(this.uploadsDir, 'certificates');
    this.reportsDir = path.join(this.uploadsDir, 'reports');
    this.receiptsDir = path.join(this.uploadsDir, 'receipts');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.uploadsDir, this.certificatesDir, this.reportsDir, this.receiptsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Generate Certificate PDF
  async generateCertificate(certificateData) {
    try {
      const doc = new PDFDocument({ 
        layout: 'landscape',
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const filename = `certificate_${certificateData.certificateNumber}.pdf`;
      const filepath = path.join(this.certificatesDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(24)
         .fillColor('#1f4e79')
         .text('R.B COMPUTER INSTITUTE', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(16)
         .fillColor('#666')
         .text('Certificate of Completion', { align: 'center' })
         .moveDown(1);

      // Certificate content
      doc.fontSize(14)
         .fillColor('#333')
         .text('This is to certify that', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(20)
         .fillColor('#1f4e79')
         .text(`${certificateData.student.firstName} ${certificateData.student.lastName}`, { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(14)
         .fillColor('#333')
         .text('has successfully completed the course', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(18)
         .fillColor('#d4af37')
         .text(certificateData.course.name, { align: 'center' })
         .moveDown(1);

      // Course details
      if (certificateData.courseDetails) {
        doc.fontSize(12)
           .fillColor('#666')
           .text(`Duration: ${certificateData.courseDetails.duration} days`, { align: 'center' })
           .text(`From: ${formatDate(certificateData.courseDetails.startDate)} To: ${formatDate(certificateData.courseDetails.endDate)}`, { align: 'center' })
           .moveDown(1);
      }

      // Grade information
      if (certificateData.grade && certificateData.grade.letter !== 'N/A') {
        doc.fontSize(14)
           .fillColor('#333')
           .text(`Grade: ${certificateData.grade.letter}`, { align: 'center' });
        
        if (certificateData.grade.percentage) {
          doc.text(`Score: ${certificateData.grade.percentage}%`, { align: 'center' });
        }
        doc.moveDown(1);
      }

      // Certificate details
      doc.fontSize(10)
         .fillColor('#666')
         .text(`Certificate No: ${certificateData.certificateNumber}`, 50, doc.page.height - 100)
         .text(`Issue Date: ${formatDate(certificateData.issueDate)}`, 50, doc.page.height - 85)
         .text(`Verification Code: ${certificateData.verification.verificationCode}`, 50, doc.page.height - 70);

      // Signature area
      doc.text('Authorized Signature', doc.page.width - 200, doc.page.height - 100, { align: 'center', width: 150 });

      doc.end();

      logger.info('Certificate PDF generated', { certificateNumber: certificateData.certificateNumber });

      return {
        filename,
        filepath,
        url: `/uploads/certificates/${filename}`
      };

    } catch (error) {
      logger.error('Error generating certificate PDF:', error);
      throw error;
    }
  }

  // Generate Fee Receipt PDF
  async generateFeeReceipt(feeData, paymentData) {
    try {
      const doc = new PDFDocument({ size: 'A4' });
      
      const filename = `receipt_${paymentData.paymentId}.pdf`;
      const filepath = path.join(this.receiptsDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(20)
         .fillColor('#1f4e79')
         .text('R.B COMPUTER INSTITUTE', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(16)
         .text('Fee Receipt', { align: 'center' })
         .moveDown(1);

      // Receipt details
      doc.fontSize(12)
         .fillColor('#333')
         .text(`Receipt No: ${paymentData.paymentId}`, 50, 150)
         .text(`Date: ${formatDate(paymentData.paidAt)}`, 400, 150)
         .moveDown(1);

      // Student details
      doc.text('Student Details:', 50, 180)
         .text(`Name: ${feeData.student.firstName} ${feeData.student.lastName}`, 50, 200)
         .text(`UID: ${feeData.student.admissionUID}`, 50, 220)
         .text(`Course: ${feeData.course.name}`, 50, 240)
         .moveDown(1);

      // Payment details
      doc.text('Payment Details:', 50, 280)
         .text(`Fee Type: ${feeData.feeType}`, 50, 300)
         .text(`Amount Paid: ${formatCurrency(paymentData.amount)}`, 50, 320)
         .text(`Payment Method: ${paymentData.method}`, 50, 340);

      if (paymentData.transactionId) {
        doc.text(`Transaction ID: ${paymentData.transactionId}`, 50, 360);
      }

      // Footer
      doc.fontSize(10)
         .fillColor('#666')
         .text('This is a computer generated receipt', { align: 'center' }, 50, doc.page.height - 50);

      doc.end();

      logger.info('Fee receipt PDF generated', { paymentId: paymentData.paymentId });

      return {
        filename,
        filepath,
        url: `/uploads/receipts/${filename}`
      };

    } catch (error) {
      logger.error('Error generating fee receipt PDF:', error);
      throw error;
    }
  }

  // Generate Attendance Report PDF
  async generateAttendanceReport(reportData) {
    try {
      const doc = new PDFDocument({ size: 'A4' });
      
      const filename = `attendance_report_${Date.now()}.pdf`;
      const filepath = path.join(this.reportsDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(18)
         .fillColor('#1f4e79')
         .text('Attendance Report', { align: 'center' })
         .moveDown(1);

      // Report details
      doc.fontSize(12)
         .fillColor('#333')
         .text(`Course: ${reportData.course.name}`, 50, 100)
         .text(`Date Range: ${formatDate(reportData.startDate)} - ${formatDate(reportData.endDate)}`, 50, 120)
         .text(`Generated: ${formatDate(new Date())}`, 400, 120)
         .moveDown(1);

      // Table header
      let yPosition = 160;
      doc.fontSize(10)
         .text('Student Name', 50, yPosition)
         .text('UID', 200, yPosition)
         .text('Present', 300, yPosition)
         .text('Absent', 350, yPosition)
         .text('Percentage', 400, yPosition);

      // Draw line
      doc.moveTo(50, yPosition + 15)
         .lineTo(550, yPosition + 15)
         .stroke();

      yPosition += 25;

      // Student data
      reportData.students.forEach(student => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.text(student.name, 50, yPosition)
           .text(student.uid, 200, yPosition)
           .text(student.present.toString(), 300, yPosition)
           .text(student.absent.toString(), 350, yPosition)
           .text(`${student.percentage}%`, 400, yPosition);

        yPosition += 20;
      });

      doc.end();

      logger.info('Attendance report PDF generated');

      return {
        filename,
        filepath,
        url: `/uploads/reports/${filename}`
      };

    } catch (error) {
      logger.error('Error generating attendance report PDF:', error);
      throw error;
    }
  }

  // Generate Student Progress Report PDF
  async generateProgressReport(studentData) {
    try {
      const doc = new PDFDocument({ size: 'A4' });
      
      const filename = `progress_report_${studentData.admissionUID}_${Date.now()}.pdf`;
      const filepath = path.join(this.reportsDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(18)
         .fillColor('#1f4e79')
         .text('Student Progress Report', { align: 'center' })
         .moveDown(1);

      // Student info
      doc.fontSize(12)
         .fillColor('#333')
         .text(`Student: ${studentData.firstName} ${studentData.lastName}`, 50, 100)
         .text(`UID: ${studentData.admissionUID}`, 50, 120)
         .text(`Email: ${studentData.email}`, 50, 140)
         .text(`Report Date: ${formatDate(new Date())}`, 400, 100)
         .moveDown(2);

      // Attendance summary
      doc.fontSize(14)
         .text('Attendance Summary', 50, 180);
      
      doc.fontSize(12)
         .text(`Total Classes: ${studentData.attendance.totalClasses}`, 50, 200)
         .text(`Attended: ${studentData.attendance.attendedClasses}`, 50, 220)
         .text(`Percentage: ${studentData.attendance.attendancePercentage}%`, 50, 240)
         .moveDown(1);

      // Performance summary
      doc.fontSize(14)
         .text('Performance Summary', 50, 280);
      
      doc.fontSize(12)
         .text(`Overall Grade: ${studentData.performance.overallGrade}`, 50, 300)
         .text(`Assignments Completed: ${studentData.performance.assignments.completed}/${studentData.performance.assignments.total}`, 50, 320)
         .text(`Tests Passed: ${studentData.performance.tests.passed}/${studentData.performance.tests.total}`, 50, 340)
         .text(`Average Score: ${studentData.performance.tests.averageScore}%`, 50, 360);

      doc.end();

      logger.info('Progress report PDF generated', { studentUID: studentData.admissionUID });

      return {
        filename,
        filepath,
        url: `/uploads/reports/${filename}`
      };

    } catch (error) {
      logger.error('Error generating progress report PDF:', error);
      throw error;
    }
  }

  // Generate Bulk Reports
  async generateBulkReports(reportType, dataArray) {
    try {
      const results = [];

      for (const data of dataArray) {
        let result;
        
        switch (reportType) {
          case 'certificates':
            result = await this.generateCertificate(data);
            break;
          case 'receipts':
            result = await this.generateFeeReceipt(data.fee, data.payment);
            break;
          case 'progress':
            result = await this.generateProgressReport(data);
            break;
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

        results.push(result);
      }

      logger.info('Bulk reports generated', { type: reportType, count: results.length });

      return results;

    } catch (error) {
      logger.error('Error generating bulk reports:', error);
      throw error;
    }
  }
}

module.exports = new PDFService();
