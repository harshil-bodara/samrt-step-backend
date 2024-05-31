const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const connectDB = require("./db/index");
connectDB();
const fileUpload = require('express-fileupload');
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const engine = require("ejs-locals");
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "static")));
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", engine);
app.set("view engine", "ejs");
const flash = require("connect-flash");
const moment = require("moment-timezone");
app.use(session({
  secret: '898989hjdsvhfdshfhdsllfh7878', // Change this to a random string
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }
}));

app.use(cors());
app.use(flash());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use((req, res, next) => {
  const currentUser = req.session.user || {};
  const currentTimeZone = req.session.timeZone || null;
  const lang = req.session.lang || "en";
  const [errorFlash] = req.flash("error");
  const [successFlash] = req.flash("success");
  const [infoFlash] = req.flash("info");
 
  res.locals.debugging =  "development";
  res.locals.siteUrl = `${req.protocol}://${req.get("host")}`;
  res.locals.errorFlash = errorFlash;
  res.locals.successFlash = successFlash;
  res.locals.infoFlash = infoFlash;
  res.locals.siteTitle = process.env.SITE_TITLE;
  res.locals.socketUrl = process.env.SOCKET_URL;
  
  res.locals.currentUser = currentUser;
  res.locals.token = req.session.token;
  res.locals.lang = lang;
  res.locals.currentYear = moment().format("YYYY");
  res.locals.sitelogo = res.locals.siteUrl+'/logo.png';
  return next();
});

app.use("/university", require("./routes/authRoute"));
app.use("/university", require("./routes/desciplineUniversity"));
app.use("/university",require("./routes/userAgentRoute"))
app.use("/admin", require("./routes/authAdminRoute"));
app.use("/agent", require("./routes/authAgentRoute"));

app.use("*", (req, res) => {
  res.send("route not found");  
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server Is Running At PORT: ${PORT}`);
  }
});
