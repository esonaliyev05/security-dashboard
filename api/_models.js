\
const { mongoose } = require("./_db");

const user_schema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 32 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    is_active: { type: Boolean, default: true },
    last_login_at: { type: Date, default: null }
  },
  { timestamps: true }
);

const refresh_schema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token_hash: { type: String, required: true },
    ip: { type: String, default: "" },
    user_agent: { type: String, default: "" },
    expires_at: { type: Date, required: true },
    revoked_at: { type: Date, default: null }
  },
  { timestamps: true }
);

const audit_schema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    username: { type: String, default: "" },
    event: { type: String, required: true },
    method: { type: String, default: "" },
    path: { type: String, default: "" },
    status_code: { type: Number, default: 0 },
    ip: { type: String, default: "" },
    user_agent: { type: String, default: "" },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

audit_schema.index({ createdAt: -1 });

const User = mongoose.models.User || mongoose.model("User", user_schema);
const RefreshToken = mongoose.models.RefreshToken || mongoose.model("RefreshToken", refresh_schema);
const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", audit_schema);

module.exports = { User, RefreshToken, AuditLog };
