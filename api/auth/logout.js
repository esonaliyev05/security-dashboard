\
const bcrypt = require("bcryptjs");
const { connect_db } = require("../_db");
const { User, RefreshToken } = require("../_models");
const { json, read_json } = require("../_utils");
const { verify_refresh } = require("../_jwt");
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
    return json(res, 200, { message: "Logged out" });
  }

  const user = await User.findById(decoded.sub);
  if (!user) return json(res, 200, { message: "Logged out" });

  const tokens = await RefreshToken.find({ user_id: user._id, revoked_at: null }).sort({ createdAt: -1 }).limit(50);
  for (const t of tokens) {
    if (await bcrypt.compare(refresh_token, t.token_hash)) {
      t.revoked_at = new Date();
      await t.save();
      break;
    }
  }

  await log_event({ req, user: { id: String(user._id), username: user.username }, event: "LOGOUT", status_code: 200 });
  return json(res, 200, { message: "Logged out" });
};
