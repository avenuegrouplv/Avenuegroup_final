import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Key, Users, CheckCircle, AlertCircle, Shield, UserCheck } from "lucide-react";

interface AdminUsersProps {
  token: string;
  currentUserEmail: string;
}

interface UserItem {
  email: string;
  role: "admin" | "client";
  createdAt: string;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ token, currentUserEmail }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "client">("client");

  // Reset password state
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās ielādēt lietotāju sarakstu." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newRole) {
      setMessage({ type: "error", text: "Lūdzu, aizpildiet visus laukus." });
      return;
    }

    try {
      const res = await fetch("/api/cms/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: newRole
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create user");

      setMessage({ type: "success", text: `Lietotājs "${newEmail}" veiksmīgi izveidots!` });
      setNewEmail("");
      setNewPassword("");
      setNewRole("client");
      await fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Neizdevās izveidot lietotāju." });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetPassword) return;

    try {
      const res = await fetch(`/api/cms/users/${resetEmail}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: resetPassword })
      });

      if (!res.ok) throw new Error("Reset failed");

      setMessage({ type: "success", text: `Lietotājam "${resetEmail}" veiksmīgi nomainīta parole.` });
      setResetEmail(null);
      setResetPassword("");
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās nomainīt paroli." });
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      setMessage({ type: "error", text: "Savu kontu nevar dzēst." });
      return;
    }

    if (!window.confirm(`Vai tiešām vēlaties neatgriezeniski dzēst lietotāju "${email}"?`)) return;

    try {
      const res = await fetch(`/api/cms/users/${email}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Delete failed");

      setMessage({ type: "success", text: `Lietotājs "${email}" veiksmīgi dzēsts.` });
      await fetchUsers();
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās izdzēst lietotāju." });
    }
  };

  return (
    <div id="admin-user-manager" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
          <Users className="w-5.5 h-5.5 text-yellow-500" />
          CMS Lietotāju Pārvaldība
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Izveidojiet jaunus lietotājus, nomainiet paroles un piešķiriet sistēmas tiesības (Klients vai Administrators).
        </p>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
              : "bg-red-950/40 border-red-800 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 align-top">
        {/* Users List Column */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-800 pb-3">
            Sistēmas Lietotāji
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-10 text-zinc-500">
              <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Ielādē lietotājus...</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {users.map((user) => (
                <div key={user.email} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100 break-all">{user.email}</span>
                      {user.email.toLowerCase() === currentUserEmail.toLowerCase() && (
                        <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-bold font-mono">
                          TU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Shield className={`w-3 h-3 ${user.role === "admin" ? "text-yellow-500" : "text-sky-500"}`} />
                        {user.role === "admin" ? "Administrators" : "Klients"}
                      </span>
                      <span>•</span>
                      <span>Izveidots: {new Date(user.createdAt).toLocaleDateString("lv-LV")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setResetEmail(user.email)}
                      className="p-2 bg-zinc-950/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg border border-zinc-850 transition"
                      title="Nomainīt paroli"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      disabled={user.email.toLowerCase() === currentUserEmail.toLowerCase()}
                      className="p-2 bg-red-950/30 hover:bg-red-900 disabled:opacity-30 text-red-400 hover:text-red-300 rounded-lg border border-red-900/30 transition"
                      title="Dzēst lietotāju"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Creation & Action Panels */}
        <div className="space-y-6">
          {/* Create User Form */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5 border-b border-zinc-800 pb-3">
              <UserPlus className="w-4.5 h-4.5 text-yellow-500" />
              Izveidot Lietotāju
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-zinc-400">E-pasts</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="lietotajs@avenuegroup.lv"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-100 font-sans transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-zinc-400">Parole</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-100 font-sans transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold text-zinc-400">Loma</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none px-3 py-2.5 rounded-xl text-xs text-zinc-100 font-sans cursor-pointer"
                >
                  <option value="client">Klients (tikai saturs)</option>
                  <option value="admin">Administrators (pilna piekļuve)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 py-2.5 rounded-xl transition text-xs font-bold"
              >
                Pievienot Lietotāju
              </button>
            </form>
          </div>

          {/* Reset Password Overlay-Form */}
          {resetEmail && (
            <div className="bg-zinc-900 rounded-2xl border border-yellow-500/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                  <Key className="w-4.5 h-4.5 text-yellow-500" />
                  Mainīt Paroli
                </h3>
                <button
                  onClick={() => setResetEmail(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Atcelt
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Ievadiet jaunu paroli lietotājam <strong className="text-zinc-300">{resetEmail}</strong>:
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Jaunā parole"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-zinc-100 font-sans transition"
                />
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-zinc-950 py-2.5 rounded-xl transition text-xs font-bold"
                >
                  Apstiprināt Jauno Paroli
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
