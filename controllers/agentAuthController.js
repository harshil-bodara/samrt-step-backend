const User = require("../models/userModel");
const Admin = require("../models/admin");
const Agent = require("../models/agent");
const { Discipline } = require("../models/desciplineUniversity");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require('fs');

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
    return res.redirect("/agent/login");
  }
  return res.render("agent-panel/login");
};

const login = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  const { email, password } = req.body;
  const agent = await Agent.findOne({ email, isDeleted: false });

  if (!agent) {
    req.flash("error", "Invalid credentials");
    return res.redirect("/agent/login");
  }
  if (agent.isSuspended) {
    req.flash("error", "your account is suspended");
    return res.redirect("/agent/login");
  }

  if (
    agent.failedLoginAttempts >=
    parseInt(process.env.ALLOWED_FAILED_LOGIN_ATTEMPTS || 3, 10)
  ) {
    const difference = agent.preventLoginTill - utcDateTime().valueOf();
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
      return res.redirect("/agent/login");
    }
  }

  const passwordMatched = await agent.comparePassword(password);
  if (!passwordMatched) {
    agent.failedLoginAttempts += 1;
    agent.preventLoginTill = utcDateTime(
      utcDateTime().valueOf() +
        parseInt(process.env.PREVENT_LOGIN_ON_FAILED_ATTEMPTS_TILL || 5, 10) *
          60000
    ).valueOf();
    await agent.save();
    const chanceLeft =
      parseInt(process.env.ALLOWED_FAILED_LOGIN_ATTEMPTS || 3, 10) -
      agent.failedLoginAttempts;
    req.flash(
      "error",
      ("INVALID_CREDENTIALS_LIMIT",
      `${
        chanceLeft <= 0
          ? `${"login disable"}`
          : `${"you have only"} ${chanceLeft} ${"chance left"}`
      }`)
    );
    return res.redirect("/agent/login");
  }

  agent.authTokenIssuedAt = utcDateTime().valueOf();
  agent.failedLoginAttempts = 0;
  agent.preventLoginTill = 0;
  await agent.save();

  const agentJson = agent.toJSON();
  const token = signToken(agent);

  ["password", "authTokenIssuedAt", "__v"].forEach(
    (key) => delete agentJson[key]
  );

  req.session.user = agentJson;
  req.session.token = token;
  req.flash("success", "LOGIN_SUCCESS");
  return res.redirect("/agent/users");
};

const dashboard = async (req, res) => {
  return res.render("agent-panel/index");
};

const profilePage = async (req, res) => {
  const user = await Agent.findOne({ _id: req.user._id });
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
  return res.redirect("/agent/login");
};

const desciplinesPage = async (req, res) => {
  console.log(await Discipline.find({}));
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

      let actions = `<a href="/admin/descipline-edit/${category._id}" title="Edit"> <i class="fas fa-edit"></i> </a>`;

      return {
        0: srNo,
        1: category.name,

        2: category.icon
          ? `<img src="${process.env.SITE_URL}/${category.icon}" alt="Girl in a jacket" width="100" height="100">`
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
        console.log("dsfsd",err);
      }
    });

    discipline.icon = `images/desc/${fileName}`;
  }

  discipline.name = name;
  await discipline.save();

  return res.redirect("/admin/descipline");
};

// async forgotPasswordPage(req, res) {
//   if (req.session.user) {
//       return res.redirect('/');
//   }
//   return res.render('forgot-password');
// }

// async forgotPassword(req, res) {
//   if (req.session.user) {
//       return res.redirect('/');
//   }
//   const { email } = req.body;

//   const admin = await Admin.findOne({
//       email,
//       isDeleted: false,
//   });

//   if (!admin) {
//       req.flash('error', req.__('USER_NOT_FOUND'));
//       return res.redirect('/auth/forgot-password');
//   }

//   if (admin.isSuspended) {
//       req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
//       return res.redirect('/auth/forgot-password');
//   }

//   admin.resetToken = generateResetToken();
//   await admin.save();

//   req.flash('success', req.__('FORGOT_PASSWORD_MAIL_SUCCESS'));
//   res.redirect(`/auth/reset-password?email=${email}`);

//   sendMail('admin-forgot-password', req.__('EMAIL_RESET_PASSWORD'), email, {
//       verification_code: admin.resetToken,
//       resetLink: `${process.env.SITE_URL}/auth/reset-password?email=${email}`,
//   }).catch(error => {
//       logError(`Failed to send password reset link to ${email}`);
//       logError(error);
//   });
// }

// async resetPasswordPage(req, res) {
//   if (req.session.user) {
//       return res.redirect('/');
//   }
//   const { email } = req.query;

//   if (!email) {
//       req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
//       return res.redirect('/auth/forgot-password');
//   }

//   const admin = await Admin.findOne({
//       email,
//       isDeleted: false,
//   });

//   if (!admin || !admin.resetToken) {
//       req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
//       return res.redirect('/auth/forgot-password');
//   }

//   if (admin.isSuspended) {
//       req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
//       return res.redirect('/auth/forgot-password');
//   }

//   return res.render('reset-password');
// }

// async resetPassword(req, res) {
//   if (req.session.user) {
//       return res.redirect('/');
//   }
//   const { email } = req.query;
//   const { otp, newPassword } = req.body;

//   if (!email) {
//       req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
//       return res.redirect('/auth/forgot-password');
//   }

//   const admin = await Admin.findOne({
//       email,
//       isDeleted: false,
//   });

//   if (!admin) {
//       req.flash('error', req.__('USER_NOT_FOUND'));
//       return res.redirect('/auth/forgot-password');
//   }

//   if (admin.isSuspended) {
//       req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
//       return res.redirect('/auth/forgot-password');
//   }

//   if (!(admin.resetToken === otp)) {
//       req.flash('error', req.__('INVALID_OTP'));
//       return res.redirect(req.headers.referer);
//   }

//   admin.password = newPassword;
//   admin.resetToken = null;
//   await admin.save();

//   req.flash('success', req.__('PASSWORD_CHANGED'));
//   return res.redirect('/auth/log-in');
// }

// async isEmailExists(req, res) {
//   const { email, id } = req.body;
//   const matchCond = {
//       isDeleted: false,
//       email,
//   };
//   if (id) {
//       matchCond._id = {
//           $ne: id,
//       };
//   }
//   const count = await Admin.countDocuments(matchCond);

//   return res.send(count === 0);
// }

// async settingsPage(req, res) {
//   const settings = await AdminSettings.findOne({}).lean();

//   return res.render('setting', {
//       settings,
//   });
// }

// async updateSettings(req, res) {
//   const {
//       androidAppVersion,
//       androidForceUpdate,
//       iosAppVersion,
//       iosForceUpdate,
//       maintenance,
//       numberOfCoins,
//       jackpotChances,
//       minimumWithdrawalAmount,
//       joiningBonus,
//       referralBonus,
//       applyProbability,
//   } = req.body;

//   const data = {};
//   const spinSetting = [];
//   data.numberOfCoins = numberOfCoins;
//   data.jackpotChances = jackpotChances;
//   data.minimumWithdrawalAmount = minimumWithdrawalAmount;
//   data.joiningBonus = joiningBonus;
//   data.referralBonus = referralBonus;
//   data.applyProbability = applyProbability;
//   spinSetting[0] = data;
//   await AdminSettings.updateMany(
//       {},
//       {
//           $set: {
//               androidAppVersion,
//               androidForceUpdate,
//               iosAppVersion,
//               iosForceUpdate,
//               maintenance,
//               spinSetting,
//           },
//       },
//       {
//           upsert: true,
//       }
//   );

//   req.flash('success', req.__('SETTINGS_UPDATE_SUCCESS'));
//   return res.redirect('/');
// }

// async verifyUser(req, res) {
//   const { email, code } = req.params;
//   const user = await User.findOne({
//       email,
//       otp: code,
//       emailVerify: false,
//       isDeleted: false,
//       otpType: 'signUp',
//   });

//   user.otp = null;
//   user.otpType = null;
//   if (!user) {
//       user.validTill = null;
//       user.save();
//       return res.render('expire_page.ejs', { title: 'oops!', msg: 'Unauthorized url please check.' });
//   }

//   const currentdate = utcDateTime().valueOf();
//   const validtill = utcDateTime(user.validTill).valueOf();

//   if (validtill < currentdate) {
//       user.validTill = null;
//       user.save();
//       return res.render('expire_page.ejs', { title: 'oops!', msg: 'Your Link has Expired. !' });
//   }

//   user.validTill = null;
//   user.emailVerify = true;
//   user.save();
//   return res.render('expire_page.ejs', {
//       title: 'success',
//       msg: 'Your Account has verified.! Thank you.',
//   });
// }

// async newPasswordPage(req, res) {
//   const { email, code } = req.params;
//   const user = await User.findOne({
//       email,
//       otp: code,
//       emailVerify: true,
//       isDeleted: false,
//       otpType: 'forgotPassword',
//   });

//   if (!user) {
//       return res.render('expire_page.ejs', { title: 'oops!', msg: 'Unauthorized url please check.' });
//   }
//   const currentDate = utcDateTime().valueOf();
//   const validTill = utcDateTime(user.validTill).valueOf();

//   if (validTill < currentDate) {
//       return res.render('expire_page.ejs', { title: 'oops!', msg: 'Your Link has Expired. !' });
//   }
//   return res.render('user-new-password', {});
// }

// async newPasswordInsert(req, res) {
//   const { email, code } = req.params;
//   const { password } = req.body;
//   const user = await User.findOne({
//       email,
//       otp: code,
//       emailVerify: true,
//       isDeleted: false,
//       otpType: 'forgotPassword',
//   });

//   user.otp = null;
//   user.otpType = null;
//   if (!user) {
//       user.validTill = null;
//       user.save();
//       return res.render('expire_page.ejs', { title: 'oops!', msg: 'Unauthorized url please check.' });
//   }
//   const currentDate = utcDateTime().valueOf();
//   const validTill = utcDateTime(user.validTill).valueOf();

//   if (validTill < currentDate) {
//       user.validTill = null;
//       user.save();
//       return res.render('expire_page.ejs', { title: 'oops!', msg: 'Your Link has Expired. !' });
//   }
//   user.password = password;
//   user.validTill = null;
//   user.save();
//   return res.render('expire_page.ejs', {
//       title: 'success',
//       msg: 'Password changed Successfully.',
//   });
// }

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
};
