const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { FILE_LIMITS } = require('../config/constants');
const logger = require('../utils/logger');

class FileUploadService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.documentsDir = path.join(this.uploadsDir, 'documents');
    this.profilesDir = path.join(this.uploadsDir, 'profiles');
    this.templatesDir = path.join(this.uploadsDir, 'templates');
    this.tempDir = path.join(this.uploadsDir, 'temp');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Configure multer storage
    this.configureStorage();
  }

  ensureDirectories() {
    [
      this.uploadsDir, 
      this.documentsDir, 
      this.profilesDir, 
      this.templatesDir, 
      this.tempDir
    ].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  configureStorage() {
    // Storage for student documents
    this.documentStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.documentsDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = this.generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
      }
    });

    // Storage for profile images
    this.profileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.profilesDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = this.generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
      }
    });

    // Storage for certificate templates
    this.templateStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.templatesDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = this.generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
      }
    });
  }

  generateUniqueFilename(originalname) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalname);
    const baseName = path.basename(originalname, extension);
    
    return `${baseName}_${timestamp}_${randomString}${extension}`;
  }

  // File filter for documents
  documentFileFilter(req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and documents are allowed.'), false);
    }
  }

  // File filter for profile images
  imageFileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'), false);
    }
  }

  // Get multer middleware for document uploads
  getDocumentUploadMiddleware() {
    return multer({
      storage: this.documentStorage,
      fileFilter: this.documentFileFilter,
      limits: {
        fileSize: FILE_LIMITS.MAX_SIZE,
        files: 5 // Maximum 5 files at once
      }
    });
  }

  // Get multer middleware for profile image uploads
  getProfileUploadMiddleware() {
    return multer({
      storage: this.profileStorage,
      fileFilter: this.imageFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB for profile images
        files: 1
      }
    });
  }

  // Get multer middleware for template uploads
  getTemplateUploadMiddleware() {
    return multer({
      storage: this.templateStorage,
      fileFilter: this.documentFileFilter,
      limits: {
        fileSize: FILE_LIMITS.MAX_SIZE,
        files: 1
      }
    });
  }

  // Process uploaded files
  async processUploadedFiles(files, uploadType, userId) {
    try {
      const processedFiles = [];

      for (const file of files) {
        const fileData = {
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: userId,
          type: uploadType,
          url: this.getFileUrl(file.filename, uploadType)
        };

        // Validate file
        const validation = await this.validateFile(file);
        if (!validation.isValid) {
          // Delete invalid file
          this.deleteFile(file.path);
          throw new Error(`File validation failed: ${validation.error}`);
        }

        processedFiles.push(fileData);

        logger.info('File processed successfully', {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          uploadType,
          userId
        });
      }

      return processedFiles;

    } catch (error) {
      logger.error('Error processing uploaded files:', error);
      throw error;
    }
  }

  // Validate uploaded file
  async validateFile(file) {
    try {
      // Check file size
      if (file.size > FILE_LIMITS.MAX_SIZE) {
        return {
          isValid: false,
          error: `File size exceeds maximum limit of ${FILE_LIMITS.MAX_SIZE / (1024 * 1024)}MB`
        };
      }

      // Check file type
      if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.mimetype)) {
        return {
          isValid: false,
          error: 'File type not allowed'
        };
      }

      // Check if file exists
      if (!fs.existsSync(file.path)) {
        return {
          isValid: false,
          error: 'File not found after upload'
        };
      }

      // Additional security checks can be added here
      // (virus scanning, content validation, etc.)

      return { isValid: true };

    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // Get file URL
  getFileUrl(filename, uploadType) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    
    switch (uploadType) {
      case 'document':
        return `${baseUrl}/uploads/documents/${filename}`;
      case 'profile':
        return `${baseUrl}/uploads/profiles/${filename}`;
      case 'template':
        return `${baseUrl}/uploads/templates/${filename}`;
      default:
        return `${baseUrl}/uploads/${filename}`;
    }
  }

  // Delete file
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('File deleted successfully', { filePath });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error deleting file:', error);
      return false;
    }
  }

  // Bulk file processing
  async processBulkFiles(fileArray, uploadType, userId) {
    try {
      const results = {
        successful: [],
        failed: [],
        total: fileArray.length
      };

      for (let i = 0; i < fileArray.length; i++) {
        try {
          const processedFile = await this.processUploadedFiles([fileArray[i]], uploadType, userId);
          results.successful.push({
            index: i,
            file: processedFile[0]
          });
        } catch (error) {
          results.failed.push({
            index: i,
            filename: fileArray[i].originalname,
            error: error.message
          });
        }
      }

      logger.info('Bulk file processing completed', {
        total: results.total,
        successful: results.successful.length,
        failed: results.failed.length,
        uploadType,
        userId
      });

      return results;

    } catch (error) {
      logger.error('Error in bulk file processing:', error);
      throw error;
    }
  }

  // Clean up old files
  async cleanupOldFiles(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const directories = [this.tempDir];
      let deletedCount = 0;

      for (const dir of directories) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            this.deleteFile(filePath);
            deletedCount++;
          }
        }
      }

      logger.info('File cleanup completed', { deletedCount, days });
      return deletedCount;

    } catch (error) {
      logger.error('Error during file cleanup:', error);
      throw error;
    }
  }

  // Get file info
  getFileInfo(filename, uploadType) {
    try {
      let filePath;
      
      switch (uploadType) {
        case 'document':
          filePath = path.join(this.documentsDir, filename);
          break;
        case 'profile':
          filePath = path.join(this.profilesDir, filename);
          break;
        case 'template':
          filePath = path.join(this.templatesDir, filename);
          break;
        default:
          throw new Error('Invalid upload type');
      }

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      
      return {
        filename,
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: this.getFileUrl(filename, uploadType)
      };

    } catch (error) {
      logger.error('Error getting file info:', error);
      return null;
    }
  }

  // Create download stream
  createDownloadStream(filename, uploadType) {
    try {
      const fileInfo = this.getFileInfo(filename, uploadType);
      
      if (!fileInfo) {
        throw new Error('File not found');
      }

      return fs.createReadStream(fileInfo.path);

    } catch (error) {
      logger.error('Error creating download stream:', error);
      throw error;
    }
  }
}

module.exports = new FileUploadService();
