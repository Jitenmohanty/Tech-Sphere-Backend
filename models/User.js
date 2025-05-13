const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePicture: {
    type: String,
    default:
      "data:image/png;base64,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"
  },
  bio: {
    type: String,
    default: "",
    maxlength: 500,
  },
  socialLinks: {
    twitter: String,
    github: String,
    linkedin: String,
    website: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
