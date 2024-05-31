const mongoose = require("mongoose");

const userAgentSchema = new mongoose.Schema({
agent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Agent" }],
user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
university: [{ type: mongoose.Schema.Types.ObjectId, ref: "University" }],

})

module.exports = mongoose.model("UserAgentSchema", userAgentSchema);
