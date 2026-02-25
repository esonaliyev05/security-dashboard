\
const { connect_db } = require("../_db");
const { AuditLog } = require("../_models");
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

  const url = new URL(req.url, "http://localhost");
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 500);
  const q = String(url.searchParams.get("q") || "").trim();

  const filter = q
    ? {
        $or: [
          { username: { $regex: q, $options: "i" } },
          { event: { $regex: q, $options: "i" } },
          { path: { $regex: q, $options: "i" } },
          { ip: { $regex: q, $options: "i" } },
          { user_agent: { $regex: q, $options: "i" } }
        ]
      }
    : {};

  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  await log_event({ req, user: auth.user, event: "AUDIT_LOGS_VIEW", status_code: 200, meta: { q, limit } });
  return json(res, 200, { results: logs });
};
