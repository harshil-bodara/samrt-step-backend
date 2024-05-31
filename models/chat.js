const mongoose = require("mongoose");

const { Schema } = mongoose;

const ChatSchema = new Schema(
	{
		message: {
			type: String,
			trim: true,
			required: true,
		},
		agentId: {
			type: String,
			trim: true,
			required: true,
		},
		userId: {
			type: String,
			trim: true,
			lowercase: true,
			required: true,
		},
		sender: {
			type: String,
			trim: true,
		},
	}
);

module.exports = mongoose.model("Chat", ChatSchema);
