const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const {
  verifyToken,
} = require("../middleware/authMiddleware");
const {
  logInPage,
  login,
  dashboard,
  profilePage,
  profile,
  changePasswordPage,
  changePassword,
  logout,
  desciplinesPage,
  desciplinesList,
  desciplinesAddPage,
  insertDesciplines,
  desciplinesEditPage,
  updateDesciplines,
  deleteDiscipline
} = require("../controllers/adminAuthController");

const {
  universityPage,
  universityAddPage,
  insertUniversity,
  universitiesList,
  universityEditPage,
  updateUniversity,
  deleteUniversity
} = require("../controllers/adminUniversityController");

const {
  agentPage,
  agentAddPage,
  insertAgent,
  agentsList,
  agentEditPage,
  updateAgent,
  deleteAgent
} = require("../controllers/adminAgentController");


router.get("/login", logInPage);

router.post("/login", login);

router.get("/", verifyToken, dashboard);

router.get("/profile", verifyToken, profilePage);

router.post("/profile", verifyToken, profile);

router.get('/change-password', verifyToken, changePasswordPage);

router.post('/change-password', verifyToken, changePassword);

router.get('/logout', verifyToken, logout);

// DISCIPLINE

router.get('/descipline', verifyToken, desciplinesPage);

router.get('/descipline-list', verifyToken, desciplinesList);

router.get('/descipline-add', verifyToken, desciplinesAddPage);

router.post('/descipline-add', verifyToken, insertDesciplines);

router.get('/descipline-edit/:id', verifyToken, desciplinesEditPage);

router.post('/descipline-edit/:id', verifyToken, updateDesciplines);
router.get('/descipline-delete/:id', verifyToken, deleteDiscipline);

// UNIVERSITY

router.get('/university', verifyToken, universityPage);
router.get('/university-add', verifyToken, universityAddPage);
router.post('/university-add', verifyToken, insertUniversity);
router.get('/university-list', verifyToken, universitiesList);
router.get('/university-edit/:id', verifyToken, universityEditPage);
router.post('/university-edit/:id', verifyToken, updateUniversity);
router.get('/university-delete/:id', verifyToken, deleteUniversity);

// AGENT
router.get('/agent', verifyToken, agentPage);
router.get('/agent-add', verifyToken, agentAddPage);
router.post('/agent-add', verifyToken, insertAgent);
router.get('/agent-list', verifyToken, agentsList);
router.get('/agent-edit/:id', verifyToken, agentEditPage);
router.post('/agent-edit/:id', verifyToken, updateAgent);
router.get('/agent-delete/:id', verifyToken, deleteAgent);

// router.post(
//     '/is-email-exists',
//     verifyToken,
//     validate(validations.isEmailExists, 'body', { stripUnknown: true }, 'self', true),
//     AuthController.isEmailExists
// );

// router.post(
//     '/is-user-email-exist',
//     verifyToken,
//     validate(validations.isEmailExists, 'body', { stripUnknown: true }, 'self', true),
//     UserController.isEmailExists
// );

// router.post(
//     '/is-useredit-email-exist',
//     verifyToken,
//     validate(validations.isUserEmailExists, 'body', { stripUnknown: true }, 'self', true),
//     UserController.isEmailExists
// );

// router.post(
//     '/is-user-phone-exist',
//     verifyToken,
//     validate(validations.isPhoneExists, 'body', { stripUnknown: true }, 'self', true),
//     UserController.isPhoneExists
// );

// router.post('/is-user-exist', verifyToken, UserController.isUserExists);

// router.get('/settings', verifyToken, AuthController.settingsPage);

// router.post(
//     '/settings',
//     verifyToken,
//     validate(validations.settings, 'body', {}, 'self'),
//     AuthController.updateSettings
// );

module.exports = router;
