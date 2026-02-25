\
const { connect_db } = require("./_db");
const { json } = require("./_utils");
const { seed_admin_if_needed } = require("./_seed_admin");

module.exports = async (req, res) => {
  await connect_db();
  await seed_admin_if_needed();
  return json(res, 200, { ok: true });
};
