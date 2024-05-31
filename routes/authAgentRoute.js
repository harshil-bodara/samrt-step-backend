const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const {
  verifyToken,
} = require("../middleware/authAgentMiddleware");
const {
  logInPage,
  login,
  dashboard,
  // profilePage,
  // profile,
  // changePasswordPage,
  // changePassword,
  logout,
} = require("../controllers/agentAuthController");

const {
  usersPage,
  usersDetailsPage,
  usersUniversitiesPage,
  usersList,
  universitiesList,
  usersChatPage,
  insertUsersChat,
  usersAddCustomDoc,
  deleteAChat
} = require("../controllers/agentUserController");


router.get("/login", logInPage);
router.post("/login", login);
router.get("/", verifyToken, dashboard);
// router.get("/profile", verifyToken, profilePage);
// router.post("/profile", verifyToken, profile);
// router.get('/change-password', verifyToken, changePasswordPage);
// router.post('/change-password', verifyToken, changePassword);
router.get('/logout', verifyToken, logout);

// USERS

router.get('/users', verifyToken, usersPage);
router.get('/users/id', verifyToken, usersDetailsPage);
router.get('/users/details/:id', verifyToken, usersDetailsPage);
router.post('/users/details/:id', verifyToken, usersAddCustomDoc);
router.get('/users/universities/:id', verifyToken, usersUniversitiesPage);
router.get('/users/chat/:id', verifyToken, usersChatPage);
router.post('/users/chat/:id', verifyToken, insertUsersChat);
router.get('/users/chat-delete/:chatId/:userId', verifyToken, deleteAChat);
router.get('/users-list', verifyToken, usersList);
router.get('/universities-list', verifyToken, universitiesList);

module.exports = router;
