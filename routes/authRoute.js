const express = require("express");
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require("../middleware/authMiddleware");

const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  completeUserProfile,
  getUserProfile,
  uploadDocument
} = require("../controllers/authController");

//const app = express();
// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const extension = file.originalname.split('.').pop();
    cb(null, Date.now() + '.' + extension);
  }
});
const upload = multer({ storage: storage });
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgetPassword", authenticateToken, forgetPassword);
router.post("/resetPassword", resetPassword);
router.post("/completeUserProfile",authenticateToken,completeUserProfile)
router.get("/getUserProfile",authenticateToken,getUserProfile)
// POST route to upload a document for the authenticated user
router.post('/upload', authenticateToken, uploadDocument);

module.exports = router;

