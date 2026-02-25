import React from "react";
import { Navigate, Route, Routes, useNavigate, Link } from "react-router-dom";
import { Shield, LogOut, Users as UsersIcon } from "lucide-react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import { clear_auth, load_auth } from "./shared/auth_store.js";
import { api } from "./shared/api.js";

function Layout({ children }) {
  const nav = useNavigate();
  const auth = load_auth();
  const is_admin = auth?.user?.role === "admin";

  const on_logout = async () => {
    try {
      const refresh_token = auth?.refresh_token;
      if (refresh_token) await api.post("/api/auth/logout", { refresh_token });
    } catch {}
    clear_auth();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 cyber_grid opacity-60" />
      <div className="absolute inset-0 scanline" />
      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 shadow-glow flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-wide">SECURITY DASHBOARD</div>
              <div className="text-xs text-white/60">
                {auth?.user?.username} • role: <span className="text-cyan-300 font-semibold">{auth?.user?.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {is_admin ? (
              <Link
                to="/users"
                className="h-10 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2"
              >
                <UsersIcon className="w-4 h-4" />
                Users
              </Link>
            ) : null}

            <button
              type="button"
              onClick={on_logout}
              className="h-10 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function Protected({ children, admin_only = false }) {
  const auth = load_auth();
  if (!auth?.access_token) return <Navigate to="/login" replace />;
  if (admin_only && auth?.user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/users"
        element={
          <Protected admin_only={true}>
            <Layout>
              <Users />
            </Layout>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
