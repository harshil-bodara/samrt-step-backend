const User = require("../models/userModel");
const Admin = require("../models/admin");
const { Discipline, University } = require("../models/desciplineUniversity");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require('fs');

const ENGLISH_REQ = {
    english1: "IELTS",
    english2: "PTE Academic",
    english3: "TOEFL (paper based)",
    english4: "TOEFL (internet based)"
}

const LOCATION = ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Northern Territory"];

const universityPage = async (req, res) => {
    return res.render("university/list");
};

const universityAddPage = async (req, res) => {

    const disciplines = await Discipline.find();

    return res.render("university/add", { disciplines, LOCATION });
};

const universitiesList = async (req, res) => {
    const reqData = req.query;
    const columnNo = parseInt(reqData.order[0].column, 10);
    const sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    const query = {isActive: true};

    if (reqData.search.value) {
        const searchValue = new RegExp(
            reqData.search.value
                .split(" ")
                .filter((val) => val)
                .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
                .join(" "),
            "i"
        );

        query.$or = [{ university_name: searchValue }];
    }

    let sortCond;
    const response = {};
    switch (columnNo) {
        case 1:
            sortCond = {
                university_name: sortOrder,
            };
            break;
        default:
            sortCond = { created: sortOrder };
            break;
    }

    const count = await University.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
        response.draw = parseInt(reqData.draw, 10) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    const skip = parseInt(reqData.start, 10);
    const limit = parseInt(reqData.length, 10);
    let university = await University.find(query)
        .sort(sortCond)
        .skip(skip)
        .limit(limit);
    let srNo = skip;
    if (university.length) {
        university = university.map((uni) => {
            srNo += 1;

            let actions = `<a href="/admin/university-edit/${uni._id}" title="Edit"> <i class="fas fa-edit"></i> </a>&nbsp;<a class="text-danger" onclick="return confirm('Are you sure?')" href="/admin/university-delete/${uni._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;

            return {
                0: srNo,
                1: uni.university_name,

                2: uni.tuition_fees,
                3: uni.apply_date,
                4:
                    actions ||
                    '<span class="badge label-table badge-secondary">N/A</span>',
            };
        });
    }
    response.data = university;
    return res.send(response);
};

const insertUniversity = async (req, res) => {
    const {
        university_name,
        full_time_months,
        part_time_months,
        tags,
        discipline,
        location,
        tuition_fees,
        living_costs,
        apply_date,
        start_date,
        language,
        about_short_content,
        overview,
        course_include,
        academic_requirements,
        student_insurance,
        other_requirements,
        scholarships_information,
        work_permits,
        min_degree,
        min_experience,
        min_grade,
        english1,
        english2,
        english3,
        english4
    } = req.body;

    const englishReqArr = [];

    english1 && englishReqArr.push({ title: ENGLISH_REQ["english1"], score: english1 });
    english2 && englishReqArr.push({ title: ENGLISH_REQ["english2"], score: english2 });
    english3 && englishReqArr.push({ title: ENGLISH_REQ["english3"], score: english3 });
    english4 && englishReqArr.push({ title: ENGLISH_REQ["english4"], score: english4 });

    const university = new University({
        university_name: university_name,
        duration: {
            full_time_months: full_time_months,
            part_time_months: part_time_months,
        },
        tags: tags.split(","),
        disciplines: discipline,
        location: location,
        tuition_fees: tuition_fees,
        living_costs: living_costs,
        apply_date: apply_date,
        start_date: start_date,
        language: language,
        english_requirements: englishReqArr,
        about_short_content: about_short_content,
        overview: overview,
        course_include: course_include,
        academic_requirements: academic_requirements,
        student_insurance: student_insurance,
        other_requirements: other_requirements,
        scholarships_information: scholarships_information,
        work_permits: work_permits,
        min_degree: min_degree,
        min_experience: min_experience,
        min_grade: min_grade,
    });

    await university.save();

    return res.redirect("/admin/university");
};

const universityEditPage = async (req, res) => {
    const { id } = req.params;
    const university = await University.findOne({ _id: id, isActive: true }).populate("disciplines");
    if (!university) {
        return res.redirect("/admin/university", "University not exist");
    }
    const disciplines = await Discipline.find();

    return res.render("university/edit", { university, disciplines, LOCATION });
};

const updateUniversity = async (req, res) => {
    const {
        university_name,
        full_time_months,
        part_time_months,
        tags,
        discipline,
        location,
        tuition_fees,
        living_costs,
        apply_date,
        start_date,
        language,
        about_short_content,
        overview,
        course_include,
        academic_requirements,
        student_insurance,
        other_requirements,
        scholarships_information,
        work_permits,
        min_degree,
        min_experience,
        min_grade,
        english1,
        english2,
        english3,
        english4
    } = req.body;
    const { id } = req.params;
    const university = await University.findOne({ _id: id });

    if (!university) {
        return res.redirect("/admin/university", "University not exist");
    }

    const englishReqArr = [];

    english1 && englishReqArr.push({ title: ENGLISH_REQ["english1"], score: english1 });
    english2 && englishReqArr.push({ title: ENGLISH_REQ["english2"], score: english2 });
    english3 && englishReqArr.push({ title: ENGLISH_REQ["english3"], score: english3 });
    english4 && englishReqArr.push({ title: ENGLISH_REQ["english4"], score: english4 });

    university.university_name = university_name;
    university.duration = {
        full_time_months: full_time_months,
        part_time_months: part_time_months,
    };
    university.tags = tags.split(",");
    university.discipline = discipline;
    university.location = location;
    university.tuition_fees = tuition_fees;
    university.living_costs = living_costs;
    university.apply_date = apply_date;
    university.start_date = start_date;
    university.language = language;
    university.english_requirements = englishReqArr;
    university.about_short_content = about_short_content;
    university.overview = overview;
    university.course_include = course_include;
    university.academic_requirements = academic_requirements;
    university.student_insurance = student_insurance;
    university.other_requirements = other_requirements;
    university.scholarships_information = scholarships_information;
    university.work_permits = work_permits;
    university.work_permits = work_permits;
    university.min_degree = min_degree;
    university.min_experience = min_experience;
    university.min_grade = min_grade;

    await university.save();

    return res.redirect("/admin/university");
};

const deleteUniversity = async (req, res) => {
    const { id } = req.params;

    const university = await University.findOne({ _id: id })

    university.isActive = false;

    university.save();

    req.flash("success", "Deleted successfully");
    return res.redirect("/admin/university");
}

module.exports = {
    universityPage,
    universityAddPage,
    insertUniversity,
    universitiesList,
    universityEditPage,
    updateUniversity,
    deleteUniversity
};
