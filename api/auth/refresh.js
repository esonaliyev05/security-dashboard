\
const bcrypt = require("bcryptjs");
const { connect_db } = require("../_db");
const { User, RefreshToken } = require("../_models");
const { json, read_json } = require("../_utils");
const { verify_refresh, sign_access } = require("../_jwt");
const { seed_admin_if_needed } = require("../_seed_admin");
const { log_event } = require("../_audit");

module.exports = async (req, res) => {
  await connect_db();
  await seed_admin_if_needed();

  if (req.method !== "POST") return json(res, 405, { message: "Method not allowed" });

  const body = await read_json(req);
  const refresh_token = String(body.refresh_token || "");
  if (refresh_token.length < 10) return json(res, 400, { message: "refresh_token required" });

  let decoded;
  try {
    decoded = verify_refresh(refresh_token);
  } catch {
    return json(res, 401, { message: "Invalid refresh token" });
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.is_active) return json(res, 401, { message: "Unauthorized" });

  const tokens = await RefreshToken.find({ user_id: user._id, revoked_at: null, expires_at: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .limit(25);

  let found = false;
  for (const t of tokens) {
    if (await bcrypt.compare(refresh_token, t.token_hash)) { found = true; break; }
  }
  if (!found) return json(res, 401, { message: "Invalid refresh token" });

  const access_token = sign_access({ sub: String(user._id), role: user.role });
  await log_event({ req, user: { id: String(user._id), username: user.username }, event: "TOKEN_REFRESH", status_code: 200 });

  return json(res, 200, { access_token });
};
