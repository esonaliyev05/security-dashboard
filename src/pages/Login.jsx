import React, { useState } from "react";
import { Lock, User2 } from "lucide-react";
import { api } from "../shared/api.js";
import { save_auth } from "../shared/auth_store.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [username_or_email, set_username_or_email] = useState("");
  const [password, set_password] = useState("");
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState("");

  const on_submit = async (e) => {
    e.preventDefault();
    set_error("");
    set_loading(true);
    try {
      const res = await api.post("/api/auth/login", { username_or_email, password });
      save_auth(res.data);
      nav("/");
    } catch (e2) {
      set_error(e2?.response?.data?.message || e2?.message || "Login error");
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 cyber_grid opacity-60" />
      <div className="absolute inset-0 scanline" />
      <div className="relative max-w-md mx-auto px-4 py-14">
        <div className="rounded-3xl bg-white/5 border border-white/10 shadow-glow p-6">
          <div className="text-2xl font-extrabold tracking-wide">ACCESS TERMINAL</div>
          <div className="text-xs text-white/60 mt-1">Login to view your site audit logs.</div>

          <form className="mt-6 space-y-4" onSubmit={on_submit}>
            <div>
              <label className="text-xs font-semibold text-white/70">Username or Email</label>
              <div className="mt-2 flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-3 h-11">
                <User2 className="w-4 h-4 text-cyan-300" />
                <input
                  className="bg-transparent outline-none flex-1 text-sm"
                  value={username_or_email}
                  onChange={(e) => set_username_or_email(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70">Password</label>
              <div className="mt-2 flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-3 h-11">
                <Lock className="w-4 h-4 text-cyan-300" />
                <input
                  type="password"
                  className="bg-transparent outline-none flex-1 text-sm"
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error ? <div className="text-xs text-red-300 font-semibold">{error}</div> : null}

            <button
              disabled={loading}
              className="w-full h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 hover:bg-cyan-500/20 transition font-semibold"
            >
              {loading ? "CONNECTING..." : "LOGIN"}
            </button>

            <div className="text-[11px] text-white/60 leading-relaxed">
              First deploy seeds admin using Vercel env vars: <b>ADMIN_SEED_EMAIL</b> / <b>ADMIN_SEED_PASSWORD</b>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
