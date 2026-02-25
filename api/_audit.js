\
const { AuditLog } = require("./_models");
const { get_ip, get_user_agent } = require("./_utils");

async function log_event({ req, user, event, status_code, meta = {} }) {
  try {
    await AuditLog.create({
      user_id: user ? user.id : null,
      username: user ? user.username : "",
      event,
      method: req.method,
      path: req.url,
      status_code,
      ip: get_ip(req),
      user_agent: get_user_agent(req),
      meta
    });
  } catch {}
}

module.exports = { log_event };
