const mongoose = require("mongoose");

const userUniversityCheckSchema = new mongoose.Schema(
  {
    university: [{ type: mongoose.Schema.Types.ObjectId, ref: 'University' }],
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    result: {
      min_degree: Boolean,
      min_experience: Boolean,
      average_grade: Boolean,
      english_level: Boolean,
      tuition_budget: Boolean,
      living_cost_budget: Boolean,
      discipline_match:Boolean
    },
    userEnteredData:{
        institute_attended:String,
        institute_location:String,
        discipline:String,
        min_degree:String,
        min_experience:String,
        average_grade:String,
        english_level:{
            title: String,
            score: Number
          },
        tuition_budget: Number,
        living_cost_budget: Number,

    }
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "UserUniversityCheck",
  userUniversityCheckSchema
);
