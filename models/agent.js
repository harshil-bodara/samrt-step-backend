const mongoose = require("mongoose");

const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const AgentSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    preventLoginTill: {
      type: Number,
      default: 0,
    },
    resetToken: {
      type: String,
      trim: true,
    },
    authTokenIssuedAt: Number,
  },
  {
    timestamps: {
      createdAt: "created",
      updatedAt: "updated",
    },
    id: false,
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
  }
);

AgentSchema.pre("save", async function(next) {
  const agent = this;
  if (!agent.isModified("password")) return next();
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ITERATIONS, 10) || 10;
    agent.password = await bcrypt.hash(agent.password, saltRounds);
    next();
  } catch (e) {
    next(e);
  }
});

AgentSchema.methods.comparePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (e) {
    return false;
  }
};

module.exports = mongoose.model("Agent", AgentSchema);
