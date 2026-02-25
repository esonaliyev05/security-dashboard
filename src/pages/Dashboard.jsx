import React, { useEffect, useMemo, useState } from "react";
import { Search, ListChecks } from "lucide-react";
import { api } from "../shared/api.js";

function fmt(d) {
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}

export default function Dashboard() {
  const [q, set_q] = useState("");
  const [logs, set_logs] = useState([]);
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState("");

  const fetch_logs = async () => {
    set_loading(true);
    set_error("");
    try {
      const res = await api.get("/api/audit/logs", { params: { q: q || "", limit: 200 } });
      set_logs(Array.isArray(res.data?.results) ? res.data.results : []);
    } catch (e) {
      set_error(e?.response?.data?.message || e?.message || "Failed to load logs (admin only)");
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => { fetch_logs(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return logs;
    const s = q.trim().toLowerCase();
    return logs.filter((x) =>
      String(x?.username || "").toLowerCase().includes(s) ||
      String(x?.event || "").toLowerCase().includes(s) ||
      String(x?.path || "").toLowerCase().includes(s) ||
      String(x?.ip || "").toLowerCase().includes(s) ||
      String(x?.user_agent || "").toLowerCase().includes(s)
    );
  }, [logs, q]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white/5 border border-white/10 shadow-glow p-5">
        <div className="text-xl font-extrabold tracking-wide flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-cyan-300" />
          AUDIT LOGS
        </div>
        <div className="text-xs text-white/60 mt-1">
          Login attempts + API access logs for your app users (admin-only view).
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 bg-black/40 border border-white/10 rounded-2xl px-3 h-11">
            <Search className="w-4 h-4 text-cyan-300" />
            <input
              value={q}
              onChange={(e) => set_q(e.target.value)}
              placeholder="Search username / event / path / ip / device..."
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
          <button
            onClick={fetch_logs}
            className="h-11 px-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 hover:bg-cyan-500/20 transition font-semibold"
          >
            Refresh
          </button>
        </div>

        {error ? <div className="mt-3 text-xs text-red-300 font-semibold">{error}</div> : null}
      </div>

      <div className="rounded-3xl bg-white/5 border border-white/10 shadow-glow overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 text-xs text-white/60">
          Showing {filtered.length} logs {loading ? " • loading..." : ""}
        </div>

        <div className="divide-y divide-white/10">
          {filtered.length === 0 ? (
            <div className="p-5 text-sm text-white/70">No logs.</div>
          ) : (
            filtered.map((x) => (
              <div key={x._id} className="p-5 hover:bg-white/[0.03] transition">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-200 font-semibold">
                    {x.event}
                  </span>
                  <span className="text-xs font-semibold">{x.username || "anonymous"}</span>
                  <span className="text-xs text-white/60">{x.method} {x.path}</span>
                  <span className="text-xs text-white/40">•</span>
                  <span className="text-xs text-white/60">{fmt(x.createdAt)}</span>
                  <span className="text-xs text-white/40">•</span>
                  <span className="text-xs text-white/60">status {x.status_code}</span>
                </div>

                <div className="mt-2 text-[12px] text-white/70 break-words">
                  <span className="text-white/50">IP:</span> {x.ip || "-"}{" "}
                  <span className="text-white/50">Device:</span> {x.user_agent || "-"}
                </div>

                {x?.meta && Object.keys(x.meta).length ? (
                  <pre className="mt-2 text-[11px] text-white/60 bg-black/40 border border-white/10 rounded-2xl p-3 overflow-auto">
{JSON.stringify(x.meta, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
