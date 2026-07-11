const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { upload } = require('../utils/cloudinary');

router.post(
  '/upload',
  requireAuth,
  isAdmin,
  upload.array('files', 10),
  async (req, res, next) => {
    try {
      const files = req.files.map((file) => ({
        url: file.path,
        alt: file.originalname,
        publicId: file.filename,
      }));
      res.json({ data: files, message: 'Files uploaded successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
