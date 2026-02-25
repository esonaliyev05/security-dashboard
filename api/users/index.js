\
const { connect_db } = require("../_db");
const { User } = require("../_models");
const { json } = require("../_utils");
const { require_auth, require_admin } = require("../_auth");
const { seed_admin_if_needed } = require("../_seed_admin");
const { log_event } = require("../_audit");

module.exports = async (req, res) => {
  await connect_db();
  await seed_admin_if_needed();

  const auth = await require_auth(req);
  if (!auth.ok) return json(res, auth.status, { message: auth.message });
  if (!require_admin(auth.user)) return json(res, 403, { message: "Forbidden" });

  const users = await User.find({}, { password_hash: 0 }).sort({ createdAt: -1 }).limit(200).lean();
  await log_event({ req, user: auth.user, event: "USERS_LIST", status_code: 200 });
  return json(res, 200, { results: users });
};
