\
const bcrypt = require("bcryptjs");
const { connect_db } = require("../_db");
const { User, RefreshToken } = require("../_models");
const { json, read_json, get_ip, get_user_agent } = require("../_utils");
const { sign_access, sign_refresh } = require("../_jwt");
const { seed_admin_if_needed } = require("../_seed_admin");
const { log_event } = require("../_audit");

module.exports = async (req, res) => {
  await connect_db();
  await seed_admin_if_needed();

  if (req.method !== "POST") return json(res, 405, { message: "Method not allowed" });

  const body = await read_json(req);
  const username_or_email = String(body.username_or_email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (username_or_email.length < 3) return json(res, 400, { message: "username_or_email required" });
  if (password.length < 6) return json(res, 400, { message: "password min 6 chars" });

  const user = await User.findOne({ $or: [{ username: username_or_email }, { email: username_or_email }] });
  if (!user) {
    await log_event({ req, user: null, event: "LOGIN_FAIL", status_code: 401, meta: { reason: "not_found" } });
    return json(res, 401, { message: "Invalid credentials" });
  }
  if (!user.is_active) {
    await log_event({ req, user: { id: String(user._id), username: user.username }, event: "LOGIN_FAIL", status_code: 403, meta: { reason: "inactive" } });
    return json(res, 403, { message: "Account disabled" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    await log_event({ req, user: { id: String(user._id), username: user.username }, event: "LOGIN_FAIL", status_code: 401, meta: { reason: "bad_password" } });
    return json(res, 401, { message: "Invalid credentials" });
  }

  user.last_login_at = new Date();
  await user.save();

  const access_token = sign_access({ sub: String(user._id), role: user.role });
  const refresh_token = sign_refresh({ sub: String(user._id), role: user.role });

  const token_hash = await bcrypt.hash(refresh_token, 10);
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user_id: user._id,
    token_hash,
    ip: get_ip(req),
    user_agent: get_user_agent(req),
    expires_at
  });

  await log_event({ req, user: { id: String(user._id), username: user.username }, event: "LOGIN_SUCCESS", status_code: 200 });

  return json(res, 200, {
    access_token,
    refresh_token,
    user: { id: String(user._id), username: user.username, email: user.email, role: user.role }
  });
};
