\
const jwt = require("jsonwebtoken");

function sign_access(payload) {
  const secret = process.env.JWT_ACCESS_SECRET || "change_me_access";
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  return jwt.sign(payload, secret, { expiresIn });
}

function sign_refresh(payload) {
  const secret = process.env.JWT_REFRESH_SECRET || "change_me_refresh";
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  return jwt.sign(payload, secret, { expiresIn });
}

function verify_access(token) {
  const secret = process.env.JWT_ACCESS_SECRET || "change_me_access";
  return jwt.verify(token, secret);
}

function verify_refresh(token) {
  const secret = process.env.JWT_REFRESH_SECRET || "change_me_refresh";
  return jwt.verify(token, secret);
}

module.exports = { sign_access, sign_refresh, verify_access, verify_refresh };
