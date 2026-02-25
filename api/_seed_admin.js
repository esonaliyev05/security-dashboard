\
const bcrypt = require("bcryptjs");
const { User } = require("./_models");

async function seed_admin_if_needed() {
  const email = String(process.env.ADMIN_SEED_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_SEED_PASSWORD || "");
  if (!email || !password) return;

  const exists = await User.findOne({ email }).lean();
  if (exists) return;

  const username = (email.split("@")[0] || "admin").replace(/[^a-z0-9_]/gi, "").toLowerCase();
  const password_hash = await bcrypt.hash(password, 10);
  await User.create({ username, email, password_hash, role: "admin" });
}

module.exports = { seed_admin_if_needed };
