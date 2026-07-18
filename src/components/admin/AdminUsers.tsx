import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Trash2, 
  Key, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  UserCheck, 
  Lock, 
  X, 
  Edit3, 
  Activity, 
  Clock, 
  Plus, 
  Sliders, 
  Eye, 
  EyeOff, 
  UserMinus, 
  Ban, 
  Settings 
} from "lucide-react";

interface AdminUsersProps {
  token: string;
  currentUserEmail: string;
}

interface UserItem {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: "active" | "deactivated" | "blocked";
  createdAt: string;
  lastLogin: string | null;
  lastActivity: string | null;
  permissions?: Record<string, Record<string, boolean>> | null;
}

interface RoleItem {
  name: string;
  isSystem: boolean;
  permissions: Record<string, Record<string, boolean>>;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ token, currentUserEmail }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<Record<string, RoleItem>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  // User form states
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("editor");
  const [status, setStatus] = useState<"active" | "deactivated" | "blocked">("active");
  const [userPermissions, setUserPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [customPermissionsEnabled, setCustomPermissionsEnabled] = useState(false);

  // Role form states
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [roleKey, setRoleKey] = useState("");
  const [roleName, setRoleName] = useState("");
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({});

  // Password change state
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const SECTIONS = [
    "Pages", "Blog", "Gallery", "Media", "Forms", 
    "Users", "SEO", "Reviews", "Translations", "Settings", 
    "Developer", "Publish", "Delete", "Export", "Import"
  ];
  
  const ACTIONS = ["read", "create", "update", "delete", "publish"];

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/cms/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/cms/roles", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (!uRes.ok || !rRes.ok) throw new Error("Kļūda ielādējot datus");
      const uData = await uRes.json();
      const rData = await rRes.json();
      setUsers(uData);
      setRoles(rData);
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās ielādēt lietotāju vai lomu sarakstu." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, [token]);

  // Set default empty permissions grid
  const createEmptyPermissions = () => {
    const grid: Record<string, Record<string, boolean>> = {};
    SECTIONS.forEach(s => {
      grid[s] = {};
      ACTIONS.forEach(a => {
        grid[s][a] = false;
      });
    });
    return grid;
  };

  useEffect(() => {
    setUserPermissions(createEmptyPermissions());
    setRolePermissions(createEmptyPermissions());
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      setMessage({ type: "error", text: "Lūdzu, aizpildiet e-pastu, paroli un lomu." });
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
          firstName,
          lastName,
          email,
          password,
          role,
          status,
          permissions: customPermissionsEnabled ? userPermissions : null
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create user");

      setMessage({ type: "success", text: `Lietotājs "${email}" veiksmīgi reģistrēts!` });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("editor");
      setStatus("active");
      setCustomPermissionsEnabled(false);
      setUserPermissions(createEmptyPermissions());
      setIsCreateOpen(false);
      await fetchUsersAndRoles();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Neizdevās izveidot lietotāju." });
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      const res = await fetch(`/api/cms/users/${editUser.email}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: editUser.firstName,
          lastName: editUser.lastName,
          email: editUser.email,
          role: editUser.role,
          status: editUser.status,
          permissions: customPermissionsEnabled ? userPermissions : null
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update user");

      setMessage({ type: "success", text: `Lietotāja "${editUser.email}" profils sekmīgi atjaunināts!` });
      setEditUser(null);
      await fetchUsersAndRoles();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Neizdevās rediģēt lietotāju." });
    }
  };

  const toggleUserStatus = async (user: UserItem, newStatus: "active" | "deactivated" | "blocked") => {
    if (user.email.toLowerCase() === currentUserEmail.toLowerCase()) {
      setMessage({ type: "error", text: "Savu statusu nevar mainīt." });
      return;
    }

    try {
      const res = await fetch(`/api/cms/users/${user.email}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to change status");

      setMessage({ type: "success", text: `Lietotāja "${user.email}" statuss nomainīts uz: ${newStatus === "active" ? "Aktīvs" : newStatus === "deactivated" ? "Deaktivizēts" : "Bloķēts"}` });
      await fetchUsersAndRoles();
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās nomainīt lietotāja statusu." });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !newPassword) return;

    try {
      const res = await fetch(`/api/cms/users/${resetEmail}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (!res.ok) throw new Error("Reset failed");

      setMessage({ type: "success", text: `Lietotājam "${resetEmail}" veiksmīgi nomainīta parole.` });
      setResetEmail(null);
      setNewPassword("");
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
      await fetchUsersAndRoles();
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās izdzēst lietotāju." });
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleKey || !roleName) {
      setMessage({ type: "error", text: "Lūdzu, ievadiet lomas atslēgu un nosaukumu." });
      return;
    }

    try {
      const res = await fetch("/api/cms/roles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: roleKey,
          name: roleName,
          permissions: rolePermissions
        })
      });

      if (!res.ok) throw new Error("Role creation failed");

      setMessage({ type: "success", text: `Loma "${roleName}" veiksmīgi saglabāta!` });
      setRoleKey("");
      setRoleName("");
      setRolePermissions(createEmptyPermissions());
      setIsCreateRoleOpen(false);
      await fetchUsersAndRoles();
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās saglabāt custom lomu." });
    }
  };

  const handleDeleteRole = async (key: string) => {
    if (!window.confirm(`Vai tiešām vēlaties dzēst lomu "${key}"?`)) return;

    try {
      const res = await fetch(`/api/cms/roles/${key}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Delete failed");

      setMessage({ type: "success", text: `Loma "${key}" veiksmīgi dzēsta.` });
      await fetchUsersAndRoles();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Neizdevās dzēst lomu." });
    }
  };

  const togglePermission = (section: string, action: string, type: "user" | "role") => {
    if (type === "user") {
      setUserPermissions(prev => {
        const next = { ...prev };
        if (!next[section]) next[section] = {};
        next[section][action] = !next[section][action];
        return next;
      });
    } else {
      setRolePermissions(prev => {
        const next = { ...prev };
        if (!next[section]) next[section] = {};
        next[section][action] = !next[section][action];
        return next;
      });
    }
  };

  const openEditUserModal = (u: UserItem) => {
    setEditUser({ ...u });
    if (u.permissions) {
      setCustomPermissionsEnabled(true);
      setUserPermissions({ ...createEmptyPermissions(), ...u.permissions });
    } else {
      setCustomPermissionsEnabled(false);
      setUserPermissions(createEmptyPermissions());
    }
  };

  return (
    <div id="admin-user-manager" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-yellow-500" />
            Lietotāju un Lomu Sistēma (User Manager)
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Pilnvērtīga drošības kontrole: lomas, deaktivizēšana, drošības atslēgas un pieslēgšanās audita dati.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsCreateOpen(true);
              setCustomPermissionsEnabled(false);
              setUserPermissions(createEmptyPermissions());
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Jauns Lietotājs
          </button>
          <button
            onClick={() => {
              setIsCreateRoleOpen(true);
              setRolePermissions(createEmptyPermissions());
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Jauna Loma
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-850">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-3 font-bold text-xs transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "users"
              ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Lietotāju Saraksts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-5 py-3 font-bold text-xs transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "roles"
              ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          Tiesības un Lomas ({Object.keys(roles).length})
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400"
              : "bg-red-950/40 border-red-800/60 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-semibold">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-950/20 rounded-3xl border border-zinc-900">
          <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-sans">Ielādē drošības un tiesību moduļus...</p>
        </div>
      ) : activeTab === "users" ? (
        <div className="bg-zinc-950/20 border border-zinc-900 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/60 border-b border-zinc-900 text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                  <th className="p-4">Lietotājs (Vārds / Uzvārds)</th>
                  <th className="p-4">E-pasts</th>
                  <th className="p-4">Loma</th>
                  <th className="p-4">Statuss</th>
                  <th className="p-4">Pēdējā aktivitāte</th>
                  <th className="p-4 text-right">Darbības</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                {users.map(user => {
                  const isCurrent = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                  return (
                    <tr key={user.email} className="hover:bg-zinc-900/20 transition-all">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-400 font-bold uppercase border border-zinc-850">
                          {user.firstName ? user.firstName[0] : user.email[0]}
                        </div>
                        <div>
                          <span>{user.firstName || "-"} {user.lastName || ""}</span>
                          {user.permissions && (
                            <span className="block text-[8px] text-amber-500 font-bold uppercase tracking-wider">Pielāgotas tiesības</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-zinc-400">
                        {user.email}
                        {isCurrent && (
                          <span className="ml-2 text-[8px] bg-yellow-500/15 border border-yellow-500/35 text-yellow-500 px-1.5 py-0.5 rounded font-black font-mono">
                            TU
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 font-mono uppercase bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded-lg leading-none">
                          <Shield className="w-3 h-3 text-sky-400" />
                          {roles[user.role]?.name || user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.status === "active" ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Aktīvs
                          </span>
                        ) : user.status === "deactivated" ? (
                          <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit">
                            <UserMinus className="w-3 h-3" /> Deaktivizēts
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit animate-pulse">
                            <Ban className="w-3 h-3" /> Bloķēts
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-zinc-500 font-mono text-[10px] space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Piesl.: {user.lastLogin ? new Date(user.lastLogin).toLocaleString("lv-LV") : "Nekad"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Akt.: {user.lastActivity ? new Date(user.lastActivity).toLocaleString("lv-LV") : "Nekad"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Activate/Deactivate Toggle */}
                          {!isCurrent && (
                            <>
                              {user.status === "active" ? (
                                <button
                                  onClick={() => toggleUserStatus(user, "deactivated")}
                                  className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition"
                                  title="Deaktivizēt"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleUserStatus(user, "active")}
                                  className="p-1.5 bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-400 border border-emerald-900/20 rounded-lg transition"
                                  title="Aktivizēt"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              
                              {user.status !== "blocked" ? (
                                <button
                                  onClick={() => toggleUserStatus(user, "blocked")}
                                  className="p-1.5 bg-red-950/20 hover:bg-red-950/50 text-red-400 border border-red-900/10 rounded-lg transition"
                                  title="Bloķēt lietotāju"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleUserStatus(user, "active")}
                                  className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition"
                                  title="Atbloķēt"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => openEditUserModal(user)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg transition"
                            title="Labot datus & tiesības"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setResetEmail(user.email)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition"
                            title="Nomainīt paroli"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(user.email)}
                              className="p-1.5 bg-red-950/30 hover:bg-red-900/45 text-red-400 hover:text-red-300 border border-red-900/20 rounded-lg transition"
                              title="Dzēst kontu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ROLES TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2.5xl space-y-4">
              <h3 className="text-sm font-bold text-white font-sans border-b border-zinc-850 pb-2">Esošās Lomas</h3>
              <div className="space-y-2">
                {Object.entries(roles).map(([key, item]) => (
                  <div key={key} className="p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-850 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{item.name}</p>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">{key} {item.isSystem ? "• Sistēmas loma" : "• Pielāgota loma"}</span>
                    </div>
                    {!item.isSystem && (
                      <button
                        onClick={() => handleDeleteRole(key)}
                        className="p-1.5 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-900/10 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-zinc-900/30 border border-zinc-850 p-5 rounded-2.5xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-yellow-500" />
              Sistēmas un Pielāgoto Lomu tiesību Matrica
            </h3>
            <p className="text-[11px] text-zinc-500 font-sans leading-normal">
              Sistēmas un pielāgoto lomu funkciju pieejamība katrai CMS sadaļai. Sistēmas lomas tiesības ir definētas un fiksētas dzinējā, pielāgotās lomas var tikt brīvi rediģētas.
            </p>

            <div className="overflow-x-auto border border-zinc-850 rounded-2xl bg-zinc-950/30">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-850 text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                    <th className="p-3">Sadaļa</th>
                    {Object.keys(roles).map(rk => (
                      <th key={rk} className="p-3 text-center">{roles[rk].name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50 text-[11px] text-zinc-300">
                  {SECTIONS.map(sec => (
                    <tr key={sec} className="hover:bg-zinc-900/10">
                      <td className="p-3 font-bold text-zinc-400 font-mono">{sec}</td>
                      {Object.keys(roles).map(rk => {
                        const perm = roles[rk].permissions[sec] || { read: false, create: false, update: false, delete: false, publish: false };
                        const score = Object.values(perm).filter(Boolean).length;
                        return (
                          <td key={rk} className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              score === 5 ? "bg-emerald-500/15 text-emerald-400" :
                              score > 0 ? "bg-sky-500/15 text-sky-400" :
                              "bg-zinc-900 text-zinc-600"
                            }`}>
                              {score === 5 ? "Viss" : `${score}/5`}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 
        =========================================
        MODALS & SLIDE-OVER PANELS
        =========================================
      */}

      {/* CREATE USER DIALOG */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl p-6 relative z-10 max-h-[90vh] overflow-y-auto flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-yellow-500" />
                Reģistrēt Jaunu CMS Kontu
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 bg-zinc-950/60 text-zinc-400 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Core properties */}
              <div className="md:col-span-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Vārds</label>
                    <input
                      type="text"
                      required
                      placeholder="Jānis"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Uzvārds</label>
                    <input
                      type="text"
                      required
                      placeholder="Bērziņš"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">E-pasta adrese</label>
                  <input
                    type="email"
                    required
                    placeholder="berzins@avenuegroup.lv"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Sākotnējā Parole</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Loma</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none px-3 py-2.5 rounded-xl text-xs text-white font-sans"
                    >
                      {Object.keys(roles).map(rk => (
                        <option key={rk} value={rk}>{roles[rk].name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Statuss</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none px-3 py-2.5 rounded-xl text-xs text-white font-sans"
                    >
                      <option value="active">Aktīvs</option>
                      <option value="deactivated">Deaktivizēts</option>
                      <option value="blocked">Bloķēts</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-850">
                  <input
                    type="checkbox"
                    id="custom-user-perm-toggle"
                    checked={customPermissionsEnabled}
                    onChange={(e) => setCustomPermissionsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-yellow-500 cursor-pointer"
                  />
                  <label htmlFor="custom-user-perm-toggle" className="text-xs font-bold text-zinc-300 cursor-pointer">
                    Aizstāt lomas noklusētās tiesības
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 rounded-xl transition text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-yellow-500/10"
                >
                  <UserPlus className="w-4 h-4" />
                  Saglabāt un Reģistrēt Lietotāju
                </button>
              </div>

              {/* Right Column: Custom section by section override permissions matrix */}
              <div className="md:col-span-7 bg-zinc-950/30 border border-zinc-850 p-4 rounded-2.5xl space-y-4 flex flex-col max-h-[500px]">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white font-sans">Pielāgots tiesību režģis lietotājam</h4>
                  <p className="text-[10px] text-zinc-500">
                    {customPermissionsEnabled 
                      ? "Aizpildiet individuālas tiesības, kas aizstās izvēlētās lomas tiesības."
                      : "Izvēlieties 'Aizstāt lomas tiesības' kreisajā pusē, lai konfigurētu šo režģi."
                    }
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto border border-zinc-850 rounded-xl divide-y divide-zinc-850">
                  {SECTIONS.map(sec => (
                    <div key={sec} className={`p-2 grid grid-cols-12 items-center gap-2 ${!customPermissionsEnabled ? "opacity-30 pointer-events-none" : ""}`}>
                      <span className="col-span-4 text-[10px] font-bold text-zinc-300 font-mono">{sec}</span>
                      <div className="col-span-8 flex flex-wrap gap-1.5">
                        {ACTIONS.map(act => {
                          const active = userPermissions[sec]?.[act] || false;
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => togglePermission(sec, act, "user")}
                              className={`text-[9px] font-bold px-2 py-1 rounded transition border ${
                                active 
                                  ? "bg-amber-500/15 border-amber-500/35 text-amber-500" 
                                  : "bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-400"
                              }`}
                            >
                              {act}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER DIALOG */}
      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditUser(null)} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl p-6 relative z-10 max-h-[90vh] overflow-y-auto flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-5 h-5 text-yellow-500" />
                Rediģēt CMS Kontu: {editUser.email}
              </h3>
              <button onClick={() => setEditUser(null)} className="p-1.5 bg-zinc-950/60 text-zinc-400 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left column */}
              <div className="md:col-span-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Vārds</label>
                    <input
                      type="text"
                      required
                      value={editUser.firstName}
                      onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Uzvārds</label>
                    <input
                      type="text"
                      required
                      value={editUser.lastName}
                      onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">E-pasta adrese</label>
                  <input
                    type="email"
                    required
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Loma</label>
                    <select
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none px-3 py-2.5 rounded-xl text-xs text-white font-sans"
                    >
                      {Object.keys(roles).map(rk => (
                        <option key={rk} value={rk}>{roles[rk].name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Statuss</label>
                    <select
                      value={editUser.status}
                      onChange={(e) => setEditUser({ ...editUser, status: e.target.value as any })}
                      disabled={editUser.email.toLowerCase() === currentUserEmail.toLowerCase()}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none px-3 py-2.5 rounded-xl text-xs text-white font-sans disabled:opacity-50"
                    >
                      <option value="active">Aktīvs</option>
                      <option value="deactivated">Deaktivizēts</option>
                      <option value="blocked">Bloķēts</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-850">
                  <input
                    type="checkbox"
                    id="edit-user-perm-toggle"
                    checked={customPermissionsEnabled}
                    onChange={(e) => setCustomPermissionsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-yellow-500 cursor-pointer"
                  />
                  <label htmlFor="edit-user-perm-toggle" className="text-xs font-bold text-zinc-300 cursor-pointer">
                    Aizstāt lomas noklusētās tiesības
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 rounded-xl transition text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-yellow-500/10"
                >
                  <CheckCircle className="w-4 h-4" />
                  Saglabāt lietotāja izmaiņas
                </button>
              </div>

              {/* Right column */}
              <div className="md:col-span-7 bg-zinc-950/30 border border-zinc-850 p-4 rounded-2.5xl space-y-4 flex flex-col max-h-[500px]">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white font-sans">Pielāgots tiesību režģis lietotājam</h4>
                  <p className="text-[10px] text-zinc-500">
                    {customPermissionsEnabled 
                      ? "Aizpildiet individuālas tiesības, kas aizstās izvēlētās lomas tiesības."
                      : "Izvēlieties 'Aizstāt lomas tiesības' kreisajā pusē, lai konfigurētu šo režģi."
                    }
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto border border-zinc-850 rounded-xl divide-y divide-zinc-850">
                  {SECTIONS.map(sec => (
                    <div key={sec} className={`p-2 grid grid-cols-12 items-center gap-2 ${!customPermissionsEnabled ? "opacity-30 pointer-events-none" : ""}`}>
                      <span className="col-span-4 text-[10px] font-bold text-zinc-300 font-mono">{sec}</span>
                      <div className="col-span-8 flex flex-wrap gap-1.5">
                        {ACTIONS.map(act => {
                          const active = userPermissions[sec]?.[act] || false;
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => togglePermission(sec, act, "user")}
                              className={`text-[9px] font-bold px-2 py-1 rounded transition border ${
                                active 
                                  ? "bg-amber-500/15 border-amber-500/35 text-amber-500" 
                                  : "bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-400"
                              }`}
                            >
                              {act}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM ROLE DIALOG */}
      {isCreateRoleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCreateRoleOpen(false)} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl p-6 relative z-10 max-h-[90vh] overflow-y-auto flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-yellow-500" />
                Definēt jaunu Pielāgotu Loma (Custom Role)
              </h3>
              <button onClick={() => setIsCreateRoleOpen(false)} className="p-1.5 bg-zinc-950/60 text-zinc-400 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Role Details */}
              <div className="md:col-span-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Unikāla Atslēga (Role Key)</label>
                  <input
                    type="text"
                    required
                    placeholder="piem. manager"
                    value={roleKey}
                    onChange={(e) => setRoleKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Publiskais Nosaukums (Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="piem. Satura Redaktors"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 rounded-xl transition text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-yellow-500/10"
                >
                  <CheckCircle className="w-4 h-4" />
                  Izveidot un Saglabāt Lomu
                </button>
              </div>

              {/* Right Column: Permissions Matrix */}
              <div className="md:col-span-7 bg-zinc-950/30 border border-zinc-850 p-4 rounded-2.5xl space-y-4 flex flex-col max-h-[500px]">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white font-sans">Lomas funkciju tiesības</h4>
                  <p className="text-[10px] text-zinc-500">Iezīmējiet atļautās darbības katrā CMS sadaļā šai lomai.</p>
                </div>

                <div className="flex-1 overflow-y-auto border border-zinc-850 rounded-xl divide-y divide-zinc-850">
                  {SECTIONS.map(sec => (
                    <div key={sec} className="p-2 grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 text-[10px] font-bold text-zinc-300 font-mono">{sec}</span>
                      <div className="col-span-8 flex flex-wrap gap-1.5">
                        {ACTIONS.map(act => {
                          const active = rolePermissions[sec]?.[act] || false;
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => togglePermission(sec, act, "role")}
                              className={`text-[9px] font-bold px-2 py-1 rounded transition border ${
                                active 
                                  ? "bg-amber-500/15 border-amber-500/35 text-amber-500" 
                                  : "bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-zinc-400"
                              }`}
                            >
                              {act}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET DIALOG */}
      {resetEmail && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setResetEmail(null)} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Key className="w-5 h-5 text-yellow-500" />
                Nomainīt Lietotāja Paroli
              </h3>
              <button onClick={() => setResetEmail(null)} className="p-1.5 bg-zinc-950/60 text-zinc-400 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Ievadiet jaunu drošu paroli lietotājam <strong className="text-zinc-200">{resetEmail}</strong>:
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Jaunā parole</label>
                <input
                  type="password"
                  required
                  placeholder="Ievadiet jauno paroli"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Apstiprināt Jauno Paroli
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
