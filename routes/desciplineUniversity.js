// For testing

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");


const {   insertUniversity,
    getUniversities,
    insertDesciplines,
    getDesciplines,
    getFilteredUniversities,
    getUniversitiesByDisciplineIds,
    getUniversityBySlug,
    matchScore,
    updateScore,
    getUserUniversityChecks
 } = require("../controllers/desciplineUniversity");

router.get("/getUniversities", getUniversities);
router.post("/insertUniversity", insertUniversity);
router.post("/insertDesciplines", insertDesciplines);
router.get("/getDesciplines", getDesciplines);
router.post("/getUniversitiesByDisciplineIds",getUniversitiesByDisciplineIds)
router.post("/getFilteredUniversities",getFilteredUniversities)
router.post("/getUniversityBySlug",getUniversityBySlug)
router.post("/matchScore",authenticateToken,matchScore)
router.post("/updateScore",authenticateToken,updateScore)
router.get("/getUserUniversityChecks",authenticateToken,getUserUniversityChecks)




module.exports = router;
