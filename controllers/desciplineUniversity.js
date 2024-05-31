// Only for testing
const express = require("express");

const { University, Discipline } = require("../models/desciplineUniversity");
const UserUniversityCheck = require("../models/userUniversityCheck");

const {
  minQualifications,
  experiencePriorities,
  gradePriorities,
} = require("../constant");

// const insertUniversity =  async (req, res) => {
//     try {
//       const universityData = req.body;
//       const university = await University.create(universityData);
//       res.status(201).json(university);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: error.message });
//     }
//   }

const insertUniversity = async (req, res) => {
  try {
    // Get university data from the request body
    const universityData = req.body;

    // Fetch disciplines based on the provided IDs
    const disciplines = await Discipline.find({
      _id: { $in: universityData.disciplines },
    });

    // Replace discipline IDs with the full discipline objects
    universityData.disciplines = disciplines;

    // Create the university with the modified data
    const university = await University.create(universityData);
    university.disciplines = await Discipline.find({});

    // Save the university with disciplines inserted
    await university.save();

    // Send the response with the created university
    res.status(201).json(university);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getUniversities = async (req, res) => {
  try {
    const universities = await University.find({isActive: true}).populate("disciplines");
    res.status(200).json(universities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getUniversityBySlug = async (req, res) => {
  const { slug } = req.body; // Extracting slug from request body
  try {
    const university = await University.findOne({ slug, isActive: true }).populate(
      "disciplines"
    );
    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }
    res.status(200).json(university);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getFilteredUniversities = async (req, res) => {
  try {
    let query = {isActive: true};

    // Get parameters from the request body
    const {
      location,
      disciplineSlug,
      minTuitionFees,
      maxTuitionFees,
      durationYears,
      format,
      page,
      limit,
    } = req.body;

    // Filter by location
    if (location) {
      query.location = location;
    }

    // Filter by discipline slug
    let disciplineIds = [];
    if (disciplineSlug) {
      const disciplines = await Discipline.find({
        slug: { $in: disciplineSlug },
      });
      disciplineIds = disciplines.map((discipline) => discipline._id);
    }

    // Filter by discipline IDs
    if (disciplineIds.length > 0) {
      query.disciplines = { $in: disciplineIds };
    }

    // Filter by tuition fees range
    if (minTuitionFees || maxTuitionFees) {
      query.tuition_fees = {};
      if (minTuitionFees) {
        query.tuition_fees.$gte = parseInt(minTuitionFees);
      }
      if (maxTuitionFees) {
        query.tuition_fees.$lte = parseInt(maxTuitionFees);
      }
    }

    // Filter by duration
    // if (durationYears) {
    //   query.durationYears = parseInt(durationYears);
    // }
    if (durationYears) {
      const [operator, value] = durationYears.split(" "); // Split the range into operator and value
      if (operator === "less") {
        query["duration.full_time_months"] = { $lt: parseInt(value) };
      } else if (operator === "greater") {
        query["duration.full_time_months"] = { $gt: parseInt(value) };
      } else {
        query["duration.full_time_months"] = parseInt(durationYears);
      }
    }

    // Filter by format
    if (format) {
      query.format = format;
    }

    const totalCount = await University.countDocuments(query);

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const universities = await University.find(query)
      .populate("disciplines")
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({ universities, totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getUniversitiesByDisciplineIds = async (req, res) => {
  try {
    const { disciplineIds } = req.body;

    // Check if disciplineIds is provided in the request body
    if (
      !disciplineIds ||
      !Array.isArray(disciplineIds) ||
      disciplineIds.length === 0
    ) {
      return res.status(400).json({
        error: "Invalid or missing disciplineIds in the request body",
      });
    }

    // Find universities that have the provided discipline IDs in their disciplines array
    const universities = await University.find({
      disciplines: { $in: disciplineIds },
    });

    res.status(200).json(universities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const insertDesciplines = async (req, res) => {
  try {
    const disciplineData = req.body;
    const discipline = await Discipline.create(disciplineData);
    res.status(201).json(discipline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getDesciplines = async (req, res) => {
  try {
    const disciplines = await Discipline.find();
    res.status(200).json(disciplines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const matchScore = async (req, res) => {
  const result = {
    min_degree: false,
    min_experience: false,
    average_grade: false,
    english_level: false,
    tuition_budget: false,
    living_cost_budget: false,
    discipline_match:false
  };

  try {
    const {
      university_id,
      institute_attended,
      institute_location,
      discipline,
      min_degree,
      min_experience,
      average_grade,
      english_level: languageTestPriorities,
      tuition_budget: tuition_fees,
      living_cost_budget: living_costs,
    } = req.body;

    const userId = req.userId;

    const university = await University.findById(university_id).populate('disciplines').lean();
    //console.log(university,"populate")
    const matchingDiscipline = university.disciplines.find(d => d.name === discipline);
    result.discipline_match = !!matchingDiscipline;

    const userMinDegreePriority = minQualifications.find(
      (degree) => degree.degree == min_degree
    );
    const universityMinDegreePriority = minQualifications.find(
      (degree) => degree.degree == university.min_degree
    );

    //Min - Degree
    if (
      userMinDegreePriority.priority >= universityMinDegreePriority.priority
    ) {
      result.min_degree = true;
    }

    const userMinExpPriority = experiencePriorities.find(
      (experience) => experience.experience == min_experience
    );
    const universityMinExpPriority = experiencePriorities.find(
      (experience) => experience.experience == university.min_experience
    );

    // Min - Exp
    if (userMinExpPriority.priority >= universityMinExpPriority.priority) {
      result.min_experience = true;
    }

    const userGradePriority = gradePriorities.find(
      (grade) => grade.grade === average_grade
    );
    const universityGradePriority = gradePriorities.find(
      (grade) => grade.grade === university.min_grade
    );

    //Min - Grade
    if (userGradePriority.priority >= universityGradePriority.priority) {
      result.average_grade = true;
    }

    //English Check
    // let testFlag = 1;
    // university?.english_requirements.forEach((universityTest) => {
    //   languageTestPriorities.forEach((userTest) => {
    //     if (universityTest.title === userTest.title) {
    //       if (!(universityTest.score <= userTest.score)) {
    //         testFlag = 0;
    //       }
    //     }
    //   });
    // });

    // result.english_level = testFlag ? true : false;
    //English Check
//English Check
let testFlag = 1;
if (university?.english_requirements) {
    const universityEnglishTest = university.english_requirements.find(test => test.title === languageTestPriorities.title);
    if (universityEnglishTest && universityEnglishTest.score <= languageTestPriorities.score) {
        testFlag = 0;
    }
}
result.english_level = testFlag ? true : false;



    //Tuition Budget Check
    if (tuition_fees >= university.tuition_fees) {
      result.tuition_budget = true;
    }

    //Tuition Budget Check
    if (living_costs >= university.living_costs) {
      result.living_cost_budget = true;
    }

    const userEnteredData = {
      institute_attended,
      institute_location,
      discipline,
      min_degree,
      min_experience,
      average_grade,
      english_level: languageTestPriorities,
      tuition_budget: tuition_fees,
      living_cost_budget: living_costs,
    };

    const newUserUniversityCheck = new UserUniversityCheck({
      university: university_id,
      user: userId,
      result,
      userEnteredData,
    });
    // Save the document to the database
    await newUserUniversityCheck.save();

    return res.send({ result, newUserUniversityCheck });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateScore = async (req, res) => {
  try {
    const {
      userUniversityCheckId,
      university_id,
      institute_attended,
      institute_location,
      discipline,
      min_degree,
      min_experience,
      average_grade,
      english_level: languageTestPriorities,
      tuition_budget: tuition_fees,
      living_cost_budget: living_costs,
    } = req.body;

    const userId = req.userId;

    const university = await University.findById(university_id).populate('disciplines').lean();
    const matchingDiscipline = university.disciplines.find(d => d.name === discipline);
    const discipline_match = !!matchingDiscipline;

    const userMinDegreePriority = minQualifications.find(
      (degree) => degree.degree == min_degree
    );
    const universityMinDegreePriority = minQualifications.find(
      (degree) => degree.degree == university.min_degree
    );

    //Min - Degree
    const minDegreeResult =
      userMinDegreePriority.priority >= universityMinDegreePriority.priority;

    const userMinExpPriority = experiencePriorities.find(
      (experience) => experience.experience == min_experience
    );
    const universityMinExpPriority = experiencePriorities.find(
      (experience) => experience.experience == university.min_experience
    );

    // Min - Exp
    const minExperienceResult =
      userMinExpPriority.priority >= universityMinExpPriority.priority;

    const userGradePriority = gradePriorities.find(
      (grade) => grade.grade === average_grade
    );
    const universityGradePriority = gradePriorities.find(
      (grade) => grade.grade === university.min_grade
    );

    //Min - Grade
    const averageGradeResult =
      userGradePriority.priority >= universityGradePriority.priority;

    //English Check
    let testFlag = 1;
    university?.english_requirements.forEach((universityTest) => {
      languageTestPriorities.forEach((userTest) => {
        if (universityTest.title === userTest.title) {
          if (!(universityTest.score <= userTest.score)) {
            testFlag = 0;
          }
        }
      });
    });

    const englishLevelResult = testFlag ? true : false;

    //Tuition Budget Check
    const tuitionBudgetResult = tuition_fees >= university.tuition_fees;

    //Living Cost Budget Check
    const livingCostBudgetResult = living_costs >= university.living_costs;

    // Update existing document
    const updatedUserUniversityCheck =
      await UserUniversityCheck.findByIdAndUpdate(
        userUniversityCheckId,
        {
          university: university_id,
          user: userId,
          result: {
            min_degree: minDegreeResult,
            min_experience: minExperienceResult,
            average_grade: averageGradeResult,
            english_level: englishLevelResult,
            tuition_budget: tuitionBudgetResult,
            living_cost_budget: livingCostBudgetResult,
            discipline_match
          },
          userEnteredData: {
            institute_attended,
            institute_location,
            discipline,
            min_degree,
            min_experience,
            average_grade,
            english_level: languageTestPriorities,
            tuition_budget: tuition_fees,
            living_cost_budget: living_costs,
          },
        },
        { new: true }
      );

    return res.json({
      message: "User University Check updated successfully",
      data: updatedUserUniversityCheck,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUserUniversityChecks = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all UserUniversityCheck documents associated with the given user ID
    const userUniversityChecks = await UserUniversityCheck.find({ user: userId }).populate('university');

    res.json({data:userUniversityChecks, total:userUniversityChecks.length});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertUniversity,
  getUniversities,
  insertDesciplines,
  getDesciplines,
  getFilteredUniversities,
  getUniversitiesByDisciplineIds,
  getUniversityBySlug,
  matchScore,
  updateScore,
  getUserUniversityChecks
};
