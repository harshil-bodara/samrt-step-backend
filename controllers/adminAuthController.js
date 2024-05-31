const User = require("../models/userModel");
const Admin = require("../models/admin");
const { Discipline, University } = require("../models/desciplineUniversity");
const UserAgentSchema = require("../models/userAgentModel");
const Agent = require('../models/agent')
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require('fs');
const mongoose = require('mongoose');

const signToken = (user) => {
  const payload = {
    sub: user._id,
    iat: user.authTokenIssuedAt,
  };
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const utcDate = (date = new Date()) => {
  date = new Date(date);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0
    )
  );
};

const utcDateTime = (date = new Date()) => {
  date = new Date(date);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
};

const generateResetToken = (length = 4) =>
  Math.floor(
    10 ** (length - 1) + Math.random() * (10 ** length - 10 ** (length - 1) - 1)
  );

const logInPage = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/admin/");
  }
  return res.render("login");
};

const login = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email, isDeleted: false });

  if (!admin) {
    req.flash("error", "Invalid credentials");
    return res.redirect("/admin/login");
  }
  if (admin.isSuspended) {
    req.flash("error", "your account is suspended");
    return res.redirect("/admin/login");
  }

  if (
    admin.failedLoginAttempts >=
    parseInt(process.env.ALLOWED_FAILED_LOGIN_ATTEMPTS || 3, 10)
  ) {
    const difference = admin.preventLoginTill - utcDateTime().valueOf();
    if (difference > 0) {
      let differenceInSec = Math.abs(difference) / 1000;
      differenceInSec -= Math.floor(differenceInSec / 86400) * 86400;
      differenceInSec -= (Math.floor(differenceInSec / 3600) % 24) * 3600;
      const minutes = Math.floor(differenceInSec / 60) % 60;
      differenceInSec -= minutes * 60;
      const seconds = differenceInSec % 60;
      req.flash(
        "error",
        ("login disable",
          `${minutes ? `${minutes} ${"minute"} ` : ""}${seconds} ${"seconds"}`)
      );
      return res.redirect("/admin/login");
    }
  }

  const passwordMatched = await admin.comparePassword(password);
  if (!passwordMatched) {
    admin.failedLoginAttempts += 1;
    admin.preventLoginTill = utcDateTime(
      utcDateTime().valueOf() +
      parseInt(process.env.PREVENT_LOGIN_ON_FAILED_ATTEMPTS_TILL || 5, 10) *
      60000
    ).valueOf();
    await admin.save();
    const chanceLeft =
      parseInt(process.env.ALLOWED_FAILED_LOGIN_ATTEMPTS || 3, 10) -
      admin.failedLoginAttempts;
    req.flash(
      "error",
      ("INVALID_CREDENTIALS_LIMIT",
        `${chanceLeft <= 0
          ? `${"login disable"}`
          : `${"you have only"} ${chanceLeft} ${"chance left"}`
        }`)
    );
    return res.redirect("/admin/login");
  }

  admin.authTokenIssuedAt = utcDateTime().valueOf();
  admin.failedLoginAttempts = 0;
  admin.preventLoginTill = 0;
  await admin.save();

  const adminJson = admin.toJSON();
  const token = signToken(admin);

  ["password", "authTokenIssuedAt", "__v"].forEach(
    (key) => delete adminJson[key]
  );

  req.session.user = adminJson;
  req.session.token = token;
  req.flash("success", "LOGIN_SUCCESS");
  return res.redirect("/admin/");
};

const dashboard = async (req, res) => {

  const totalUsers = await User.countDocuments();
  const totalUniversities = await University.countDocuments();
  const totalAgents = await Agent.countDocuments();

  const thisMonthUsers = await User.find({
    "createdAt": {
      "$gte": new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "$lt": new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    }
  }).count();

  return res.render("index", { totalUsers, totalUniversities, totalAgents, thisMonthUsers });
};

const profilePage = async (req, res) => {
  const user = await Admin.findOne({ _id: req.user._id });
  return res.render("profile", {
    user,
  });
};

const profile = async (req, res) => {
  const { user } = req;
  const { firstName, lastName, email, countryCode, contactNumber } = req.body;
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.countryCode = countryCode;
  user.contactNumber = contactNumber;
  await user.save();
  req.flash("success", "PROFILE_UPDATED");
  return res.redirect("/admin/profile");
};

const changePasswordPage = async (req, res) => {
  return res.render("change-password");
};

const changePassword = async (req, res) => {
  const { user } = req;
  const { currentPassword, newPassword } = req.body;

  const passwordMatched = await user.comparePassword(currentPassword);
  if (!passwordMatched) {
    req.flash("error", "Password not matched");
    return res.redirect("/admin/change-password");
  }

  user.password = newPassword;
  await user.save();

  req.flash("success", "Password changed successfully");
  return res.redirect("/admin/change-password");
};

const logout = async (req, res) => {
  req.session.user = null;
  req.session.token = null;
  req.flash("success", "Logout successfully");
  return res.redirect("/admin/login");
};

const desciplinesPage = async (req, res) => {
  return res.render("desciplines/list");
};

const desciplinesList = async (req, res) => {
  const reqData = req.query;
  const columnNo = parseInt(reqData.order[0].column, 10);
  const sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
  const query = {};

  if (reqData.search.value) {
    const searchValue = new RegExp(
      reqData.search.value
        .split(" ")
        .filter((val) => val)
        .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
        .join(" "),
      "i"
    );

    query.$or = [{ title: searchValue }];
  }

  let sortCond;
  const response = {};
  switch (columnNo) {
    case 1:
      sortCond = {
        title: sortOrder,
      };
      break;
    default:
      sortCond = { created: sortOrder };
      break;
  }

  const count = await Discipline.countDocuments(query);
  response.draw = 0;
  if (reqData.draw) {
    response.draw = parseInt(reqData.draw, 10) + 1;
  }
  response.recordsTotal = count;
  response.recordsFiltered = count;
  const skip = parseInt(reqData.start, 10);
  const limit = parseInt(reqData.length, 10);
  let discipline = await Discipline.find(query)
    .sort(sortCond)
    .skip(skip)
    .limit(limit);
  let srNo = skip;
  if (discipline.length) {
    discipline = discipline.map((category) => {
      srNo += 1;

      let actions = `<a href="/admin/descipline-edit/${category._id}" title="Edit"> <i class="fas fa-edit"></i> </a>&nbsp;<a class="text-danger" onClick="return confirm('Are you sure?')" href="/admin/descipline-delete/${category._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;

      return {
        0: srNo,
        1: category.name,

        2: category.icon
          ? `<img src="${process.env.SITE_URL}/${category.icon}" alt="${category.name}" width="100" height="100">`
          : "N/A",
        3:
          actions ||
          '<span class="badge label-table badge-secondary">N/A</span>',
      };
    });
  }
  response.data = discipline;
  return res.send(response);
};

const desciplinesAddPage = async (req, res) => {
  return res.render("desciplines/add");
};

const insertDesciplines = async (req, res) => {
  const { name } = req.body;

  if (!req.files || !req.files.icon) {
    return res.redirect("/admin/descipline", "No file uploaded.");
  }

  const iconFile = req.files.icon;
  const fileName = Date.now() + "_" + iconFile.name;

  iconFile.mv(
    path.join(__dirname + "/../static", "images", "desc/") + fileName,
    (err) => {
      if (err) {
        console.log(err);
        return res.redirect("/admin/descipline", "server error.");
      }
    }
  );

  const discipline = new Discipline({
    name: name,
    icon: `images/desc/${fileName}`,
  });

  await discipline.save();

  return res.redirect("/admin/descipline", "Descipline added successfully");
};

const desciplinesEditPage = async (req, res) => {
  const { id } = req.params;
  const discipline = await Discipline.findOne({ _id: id });
  if (!discipline) {
    return res.redirect("/admin/descipline", "Descipline not exist");
  }
  return res.render("desciplines/edit", { discipline });
};

const updateDesciplines = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  const discipline = await Discipline.findOne({ _id: id });

  if (!discipline) {
    return res.redirect("/admin/descipline", "Descipline not exist");
  }

  if (req.files || req.files?.icon) {
    const iconFile = req.files.icon;
    const fileName = Date.now() + "_" + iconFile.name;

    iconFile.mv(
      path.join(__dirname + "/../static", "images", "desc/") + fileName,
      (err) => {
        if (err) {
          console.log(err);
          return res.redirect("/admin/descipline", "server error.");
        }
      }
    );
    const filePath = path.join(__dirname, "/../static", discipline.icon);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("dsfsd", err);
      }
    });

    discipline.icon = `images/desc/${fileName}`;
  }

  discipline.name = name;
  await discipline.save();

  return res.redirect("/admin/descipline");
};

const deleteDiscipline = async (req, res) => {
  const { id } = req.params;


  const universities = await University.find({
    "disciplines": {
      "$in": [id]
    }
  });

  if(universities.length > 0) {
    req.flash("error", "Universities already exist for this discipline, cannot delete");
  }else{
    await Discipline.deleteOne({
      "_id": id
    })
    req.flash("success", "Deleted successfully");
  }
  return res.redirect("/admin/descipline");

}

module.exports = {
  logInPage,
  login,
  dashboard,
  profilePage,
  profile,
  changePasswordPage,
  changePassword,
  logout,
  desciplinesPage,
  desciplinesList,
  desciplinesAddPage,
  insertDesciplines,
  desciplinesEditPage,
  updateDesciplines,
  deleteDiscipline
};
