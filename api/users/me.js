\
const { connect_db } = require("../_db");
const { json } = require("../_utils");
const { require_auth } = require("../_auth");
const { seed_admin_if_needed } = require("../_seed_admin");
const { log_event } = require("../_audit");

module.exports = async (req, res) => {
  await connect_db();
  await seed_admin_if_needed();

  const auth = await require_auth(req);
  if (!auth.ok) return json(res, auth.status, { message: auth.message });

  await log_event({ req, user: auth.user, event: "API_ACCESS_ME", status_code: 200 });
  return json(res, 200, { user: auth.user });
};
