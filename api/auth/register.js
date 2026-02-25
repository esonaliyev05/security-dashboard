\
const bcrypt = require("bcryptjs");
const { connect_db } = require("../_db");
const { User } = require("../_models");
const { json, read_json } = require("../_utils");
const { seed_admin_if_needed } = require("../_seed_admin");
const { log_event } = require("../_audit");

module.exports = async (req, res) => {
  await connect_db();
  await seed_admin_if_needed();

  if (req.method !== "POST") return json(res, 405, { message: "Method not allowed" });

  const body = await read_json(req);
  const username = String(body.username || "").trim().toLowerCase();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (username.length < 3) return json(res, 400, { message: "Username min 3 chars" });
  if (!email.includes("@")) return json(res, 400, { message: "Invalid email" });
  if (password.length < 6) return json(res, 400, { message: "Password min 6 chars" });

  const exists = await User.findOne({ $or: [{ username }, { email }] }).lean();
  if (exists) return json(res, 409, { message: "User already exists" });

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password_hash, role: "user" });

  await log_event({ req, user: { id: String(user._id), username: user.username }, event: "REGISTER", status_code: 201 });
  return json(res, 201, { message: "Registered" });
};
