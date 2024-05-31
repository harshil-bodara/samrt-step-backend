const jwt = require("jsonwebtoken");
const Admin = require('../models/admin');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(err, "err");
      return res.sendStatus(403);
    }

    //req.user = user;
    req.userId = decoded.userId;

    next();
  });
};

const verifyToken = (req, res, next) =>
    jwt.verify(req.session.token, process.env.JWT_SECRET, async (err, decoded) => {
        res.setHeader('authorized', false);
        if (err || !decoded || !decoded.sub) {
            req.session.user = null;
            req.session.token = null;
            req.flash('error', 'Unauthorized access');
            return res.redirect('/admin/login');
        }
        const admin = await Admin.findOne({
            _id: decoded.sub,
            isDeleted: false,
            authTokenIssuedAt: decoded.iat,
        });
        if (!admin) {
            req.session.user = null;
            req.session.token = null;
            req.flash('error','Unauthorized access');
            return res.redirect('/admin/login');
        }
        if (admin.isSuspended) {
            req.session.user = null;
            req.session.token = null;
            req.flash('error', req.__('your account is suspended'));
            return res.redirect('/admin/login');
        }
        const adminJson = admin.toJSON();
        ['password', 'authTokenIssuedAt', '__v'].forEach(key => delete adminJson[key]);
        req.user = admin;
        res.user = adminJson;
        req.session.user = adminJson;
        next();
    });

module.exports = { authenticateToken, verifyToken };
