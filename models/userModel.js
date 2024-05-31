const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    agent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Agent" }],

    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
    },
    nationality: {
      type: String,
      trim: true,
    },
    academicBackground: {
      highestEducation: {
        type: String,
        enum: ["High School", "Bachelor's", "Master's", "Doctorate", "Other"],
      },
      currentInstitution: String,
      fieldOfStudy: String,
      graduationYear: String,
    },
    studyPreferences: {
      intendedLevelOfStudy: {
        type: String,
        enum: ["Undergraduate", "Postgraduate", "Research", "Other"],
      },
      preferredFieldOfStudy: String,
      desiredCourseDuration: String,
      preferredStudyLocation: {
        city: String,
        stateCountry: String,
      },
      languageProficiency: String,
      // desiredReputationOfUniversity: {
      //   type: String,
      //   enum: ["Highly Ranked", "Affordable", "Balanced"],
      // },
      // universitiesOfInterest: [String],
      // preferredLearningEnvironment: {
      //   type: String,
      //   enum: ["Urban", "Rural", "Suburban"],
      // },
      // availabilityOfScholarships: {
      //   type: String,
      //   enum: ["Yes", "No", "Not Sure"],
      // },
    },
    universityPreferences: {
      desiredReputationOfUniversity: {
        type: String,
        enum: ["Highly Ranked", "Affordable", "Balanced"],
      },
      universitiesOfInterest: [String],
      preferredLearningEnvironment: {
        type: String,
        enum: ["Urban", "Rural", "Suburban"],
      },
      availabilityOfScholarships: {
        type: String,
        enum: ["Yes", "No", "Not Sure"],
      },
    },
    studyGoalsAndCareerAspirations: {
      shortTermStudyGoals: String,
      longTermCareerAspirations: String,
      studyAbroadExpectations: String,
    },
    additionalInformation: {
      specialRequirements: String,
      previousStudyAbroadExperience: String,
      otherComments: String,
    },
    consentAndAgreement: {
      consentToUsePersonalInformation: {
        type: Boolean,
        default: null,
      },
      termsAndConditionsAgreement: {
        type: Boolean,
        default: null,
      },
    },
    uploadedDocuments: [
      {
        filename: String,
        path: String,
      },
    ],
    passport: {
      type: String,
    },
    secondary: {
      type: String,
    },
    senior: {
      type: String,
    },
    bachelor: {
      type: String,
    },
    customDocuments: [{ name: String, path: String }],
  },

  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Hash password before saving
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
