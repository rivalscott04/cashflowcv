const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const File = require('../models/File');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${Date.now()}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 300000, // 300KB default
    files: 2 // Maximum 2 files (invoice + tax invoice)
  },
  fileFilter: fileFilter
});

// File type mapping
const getFileType = (fieldname) => {
  if (fieldname === 'invoice' || fieldname === 'invoiceFile') {
    return 'invoice';
  } else if (fieldname === 'tax_invoice' || fieldname === 'taxInvoiceFile') {
    return 'tax_invoice';
  }
  return 'other';
};

// @desc    Upload files (invoice and/or tax invoice)
// @route   POST /api/files/upload
// @access  Private
const uploadFiles = async (req, res, next) => {
  try {
    const uploadedFileData = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileData = {
          user_id: req.user.id,
          original_name: file.originalname,
          filename: file.filename,
          file_path: file.path,
          mime_type: file.mimetype,
          file_size: file.size,
          file_type: getFileType(file.fieldname)
        };

        // Save file record to database
        const savedFile = await File.create(fileData);
        uploadedFileData.push(savedFile.toJSON());
      }
    }

    res.status(200).json({
      success: true,
      data: {
        files: uploadedFileData
      },
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    // Clean up uploaded files if database save fails
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    next(error);
  }
};

// @desc    Get file by ID
// @route   GET /api/files/:id
// @access  Private
const getFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find file by ID and user ID
    const file = await File.findByIdAndUserId(id, userId);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'File not found'
        }
      });
    }

    // Check if file exists on disk
    const fileExists = await file.exists();
    if (!fileExists) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'File not found on disk'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        file: file.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find file by ID and user ID
    const file = await File.findByIdAndUserId(id, userId);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'File not found'
        }
      });
    }

    // Check if file exists on disk
    const fileExists = await file.exists();
    if (!fileExists) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'File not found on disk'
        }
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.mime_type);

    // Send file
    res.sendFile(path.resolve(file.file_path));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Delete file by ID and user ID (this will also delete the physical file)
    const deleted = await File.deleteByIdAndUserId(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'File not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's files
// @route   GET /api/files
// @access  Private
const getUserFiles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      file_type,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const userId = req.user.id;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      file_type,
      sortBy,
      sortOrder
    };

    const [files, total, stats] = await Promise.all([
      File.findByUserId(userId, options),
      File.countByUserId(userId, { file_type }),
      File.getStorageStatsByUserId(userId)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        files: files.map(f => f.toJSON()),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File too large. Maximum size is 300KB.'
        }
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Too many files. Maximum 2 files allowed.'
        }
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Unexpected file field.'
        }
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message
      }
    });
  }

  next(err);
};

// Routes
router.post('/upload', protect, upload.array('files', 2), handleMulterError, uploadFiles);
router.get('/', protect, getUserFiles);
router.get('/:id', protect, getFile);
router.get('/:id/download', protect, downloadFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;