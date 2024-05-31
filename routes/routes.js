// For testing

const express = require("express");
const router = express.Router();

const { helloWorld } = require("../controllers/controller");

router.get("/helloWorld", helloWorld);

module.exports = router;
