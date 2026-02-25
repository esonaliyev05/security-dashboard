import React, { useEffect, useState } from "react";
import { api } from "../shared/api.js";

export default function Users() {
  const [users, set_users] = useState([]);
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState("");

  const fetch_users = async () => {
    set_loading(true);
    set_error("");
    try {
      const res = await api.get("/api/users");
      set_users(Array.isArray(res.data?.results) ? res.data.results : []);
    } catch (e) {
      set_error(e?.response?.data?.message || e?.message || "Failed to load users (admin only)");
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => { fetch_users(); }, []);

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 shadow-glow overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10">
        <div className="text-xl font-extrabold tracking-wide">USERS</div>
        <div className="text-xs text-white/60 mt-1">Admin-only list of your app users.</div>
        {error ? <div className="mt-2 text-xs text-red-300 font-semibold">{error}</div> : null}
      </div>

      <div className="px-5 py-3 text-xs text-white/60">
        {loading ? "Loading..." : `Total: ${users.length}`}
      </div>

      <div className="divide-y divide-white/10">
        {users.map((u) => (
          <div key={u._id} className="p-5 hover:bg-white/[0.03] transition">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{u.username}</span>
              <span className="text-xs text-white/60">{u.email}</span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10">
                {u.role}
              </span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10">
                {u.is_active ? "active" : "disabled"}
              </span>
            </div>
            <div className="mt-2 text-xs text-white/60">
              created: {new Date(u.createdAt).toLocaleString()} • last_login: {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
