\
const crypto = require("crypto");

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function read_json(req) {
  // Vercel sometimes parses body, but not always; handle both.
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function get_ip(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return req.socket?.remoteAddress ? String(req.socket.remoteAddress) : "";
}

function get_user_agent(req) {
  return String(req.headers["user-agent"] || "");
}

function random_id() {
  return crypto.randomBytes(12).toString("hex");
}

module.exports = { json, read_json, get_ip, get_user_agent, random_id };
