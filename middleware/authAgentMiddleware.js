const jwt = require("jsonwebtoken");
const Agent = require('../models/agent');

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
            return res.redirect('/agent/login');
        }
        const agent = await Agent.findOne({
            _id: decoded.sub,
            isDeleted: false,
            authTokenIssuedAt: decoded.iat,
        });
        if (!agent) {
            req.session.user = null;
            req.session.token = null;
            req.flash('error','Unauthorized access');
            return res.redirect('/agent/login');
        }
        if (agent.isSuspended) {
            req.session.user = null;
            req.session.token = null;
            req.flash('error', req.__('your account is suspended'));
            return res.redirect('/agent/login');
        }
        const agentJson = agent.toJSON();
        ['password', 'authTokenIssuedAt', '__v'].forEach(key => delete agentJson[key]);
        req.user = agent;
        res.user = agentJson;
        req.session.user = agentJson;
        next();
    });

module.exports = { authenticateToken, verifyToken };
