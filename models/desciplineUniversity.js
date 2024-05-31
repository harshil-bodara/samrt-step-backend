// Import mongoose
const mongoose = require("mongoose");
const slugify = require("slugify");

// Define University Schema
const universitySchema = new mongoose.Schema({
  university_name: { type: String, required: true },
  disciplines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Discipline" }],
  tags: [String],
  duration: {
    full_time_months: Number,
    part_time_months: Number,
  },
  language: String,
  tuition_fees: Number,
  living_costs: Number,
  apply_date: String,
  start_date: String,
  about_short_content: String,
  overview: String,
  course_include: String,
  academic_requirements: String,
  english_requirements: [
    {
      title: String,
      score: Number,
    },
  ],
  student_insurance: String,
  other_requirements: String,
  scholarships_information: String,
  work_permits: String,
  work_while_studying: String,
  slug: { type: String, unique: true },
  location: String,
  min_degree: String,
  min_experience: String,
  min_grade: String,
  currency: String,
  isActive: {
    type: Boolean,
    enum: [true, false],
    default: true,
  }
});

// Pre-save middleware to generate slug from university_name
universitySchema.pre("save", function (next) {
  if (!this.isModified("university_name")) {
    return next();
  }
  this.slug = slugify(this.university_name, { lower: true });
  next();
});

// Define Discipline Schema
// const disciplineSchema = new mongoose.Schema({
//   discipline_id: { type: String },
//   discipline_name: { type: String },
//   university_name: { type: String },
//   tags: [String],
//   duration: {
//     full_time_months: Number,
//     part_time_months: Number
//   },
//   language: String,
//   tuition_fees: String,
//   living_costs: String,
//   apply_date: String,
//   start_date: String,
//   about_short_content: String,
//   overview: String,
//   course_include: String,
//   academic_requirements: String,
//   english_requirements: {
//     heading: String,
//     subheading: String,
//     score: Number
//   },
//   student_insurance: String,
//   other_requirements: String,
//   scholarships_information: String,
//   work_permits: String,
//   work_while_studying: String
// });

const disciplineSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  icon: { type: String }, // Assuming the icon is stored as a URL or file path
  slug: { type: String, unique: true },
});

disciplineSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    return next();
  }
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Create University Model
const University = mongoose.model("University", universitySchema);

// Create Discipline Model
const Discipline = mongoose.model("Discipline", disciplineSchema);

// Export models
module.exports = { University, Discipline };
