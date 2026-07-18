import React, { useState, useEffect } from "react";
import { 
  User, 
  Key, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Camera, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Globe 
} from "lucide-react";

interface AdminProfileProps {
  token: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  photo: string | null;
  theme: "light" | "dark";
  language: "lv" | "en" | "de";
  notifications: {
    email: boolean;
    push: boolean;
    backup: boolean;
    security: boolean;
  };
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ token }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās ielādēt lietotāja profilu." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: "Paroles nesakrīt!" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const body: any = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        photo: profile.photo,
        theme: profile.theme,
        language: profile.language,
        notifications: profile.notifications
      };

      if (password) {
        body.password = password;
      }

      const res = await fetch("/api/cms/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Failed to save profile");

      setMessage({ type: "success", text: "Profila iestatījumi atjaunināti sekmīgi!" });
      setPassword("");
      setConfirmPassword("");
      await fetchProfile();
    } catch (err) {
      setMessage({ type: "error", text: "Neizdevās saglabāt profila izmaiņas." });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-950/20 rounded-3xl border border-zinc-900">
        <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Ielādē Jūsu profila paneli...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div id="admin-user-profile" className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl flex items-center gap-4">
        <div className="relative shrink-0">
          {profile.photo ? (
            <img src={profile.photo} referrerPolicy="no-referrer" className="w-14 h-14 rounded-2xl object-cover border border-zinc-800" alt="Avatar" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-lg text-yellow-500 uppercase">
              {profile.firstName ? profile.firstName[0] : profile.email[0]}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 p-1 bg-yellow-500 rounded-lg text-zinc-950 border border-zinc-900 cursor-pointer hover:bg-yellow-600 transition">
            <Camera className="w-3 h-3" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-1.5">
            Labdien, {profile.firstName || "Lietotāj"}!
          </h2>
          <div className="flex items-center gap-2.5 text-xs text-zinc-400 mt-1 font-sans">
            <span className="font-mono">{profile.email}</span>
            <span>•</span>
            <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-bold font-mono uppercase">{profile.role}</span>
          </div>
        </div>
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
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Personal details */}
        <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-3">
            <User className="w-4 h-4 text-yellow-500" />
            Personīgie dati
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Vārds</label>
              <input
                type="text"
                required
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Uzvārds</label>
              <input
                type="text"
                required
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Avatar bildes URL</label>
            <input
              type="text"
              value={profile.photo || ""}
              onChange={(e) => setProfile({ ...profile, photo: e.target.value || null })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Saskarnes tēma</label>
              <select
                value={profile.theme}
                onChange={(e) => setProfile({ ...profile, theme: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white cursor-pointer"
              >
                <option value="light">Gaišā tēma</option>
                <option value="dark">Tumšā tēma (Cosmic)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Saskarnes Valoda</label>
              <select
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white cursor-pointer"
              >
                <option value="lv">Latviešu (LV)</option>
                <option value="en">English (EN)</option>
                <option value="de">Deutsch (DE)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Security and Notifications */}
        <div className="space-y-6">
          {/* Password Change */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-3">
              <Key className="w-4 h-4 text-yellow-500" />
              Mainīt Paroli
            </h3>

            <div className="space-y-3">
              <div className="space-y-1 relative">
                <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Jaunā Parole</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Atstājiet tukšu, lai nemainītu"
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-sans pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-9.5 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Apstiprināt Jauno Paroli</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Atkārtojiet jauno paroli"
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-yellow-500 focus:outline-none p-2.5 rounded-xl text-xs text-white font-sans"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notifications config */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-6 rounded-2.5xl space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-zinc-850 pb-3">
              <Bell className="w-4 h-4 text-yellow-500" />
              E-pasta Paziņojumi
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-200">Sistēmas drošība</p>
                  <span className="text-[9px] text-zinc-500 block">Paziņojumi par bloķētiem IP, jaunām pieslēgšanām</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notifications.security}
                  onChange={(e) => setProfile({
                    ...profile,
                    notifications: { ...profile.notifications, security: e.target.checked }
                  })}
                  className="w-4.5 h-4.5 accent-yellow-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-200">Dublēšanas panākumi</p>
                  <span className="text-[9px] text-zinc-500 block">Nedēļas kopsavilkums par backup statusu</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notifications.backup}
                  onChange={(e) => setProfile({
                    ...profile,
                    notifications: { ...profile.notifications, backup: e.target.checked }
                  })}
                  className="w-4.5 h-4.5 accent-yellow-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-200">Pieteikumu veidlapas</p>
                  <span className="text-[9px] text-zinc-500 block">Katra jauna klienta pieteikuma e-pasts</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notifications.email}
                  onChange={(e) => setProfile({
                    ...profile,
                    notifications: { ...profile.notifications, email: e.target.checked }
                  })}
                  className="w-4.5 h-4.5 accent-yellow-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saglabā..." : "Saglabāt Profila Datus"}
          </button>
        </div>
      </form>
    </div>
  );
};
