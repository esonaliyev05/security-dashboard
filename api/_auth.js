\
const { verify_access } = require("./_jwt");
const { User } = require("./_models");

async function require_auth(req) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, status: 401, message: "Unauthorized" };

  try {
    const decoded = verify_access(token);
    const user = await User.findById(decoded.sub).lean();
    if (!user || !user.is_active) return { ok: false, status: 401, message: "Unauthorized" };
    return { ok: true, user: { id: String(user._id), username: user.username, role: user.role } };
  } catch {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
}

function require_admin(user) {
  return user?.role === "admin";
}

module.exports = { require_auth, require_admin };
