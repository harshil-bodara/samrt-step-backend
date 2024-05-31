const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const {
    authenticateToken,
} = require("../middleware/authMiddleware");
const {
    randomAgentAssigned,
    getUniversityData,
    sendMessageAgent,
    getAllMessages,
    withdrawAppliedRequest
} = require('../controllers/userAgentController.js')

router.post("/randomAgentAssigned", authenticateToken, randomAgentAssigned);
router.get("/getUniversityData", authenticateToken, getUniversityData);
router.post("/sendMessageToAgent", authenticateToken, sendMessageAgent);
router.get("/getAllMessages", authenticateToken, getAllMessages);
router.post("/withdrawAppliedRequest", authenticateToken, withdrawAppliedRequest);

module.exports = router;