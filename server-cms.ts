import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const USERS_FILE = path.join(DATA_DIR, "cms-users.json");
const DRAFTS_FILE = path.join(DATA_DIR, "cms-drafts.json");
const CONFIG_FILE = path.join(DATA_DIR, "cms-config.json");
const LOGS_FILE = path.join(DATA_DIR, "cms-logs.json");
const HISTORY_FILE = path.join(DATA_DIR, "cms-publish-history.json");
const ROLES_FILE = path.join(DATA_DIR, "cms-roles.json");
const SYSTEM_SETTINGS_FILE = path.join(DATA_DIR, "cms-system-settings.json");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");

const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "images", "uploads");
const PUBLIC_DOCS_DIR = path.join(process.cwd(), "public", "documents");

// Helper to hash password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Ensure directories and initial files exist
function initializeCMS() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_DOCS_DIR)) {
    fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  // Bootstrap roles
  if (!fs.existsSync(ROLES_FILE)) {
    const defaultPermissions = (isFull: boolean) => ({
      Pages: { read: true, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Blog: { read: true, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Gallery: { read: true, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Media: { read: true, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Forms: { read: true, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Users: { read: isFull, create: isFull, update: isFull, delete: isFull, publish: isFull },
      SEO: { read: true, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Reviews: { read: true, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Translations: { read: true, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Settings: { read: isFull, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Developer: { read: isFull, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Publish: { read: isFull, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Delete: { read: isFull, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Export: { read: isFull, create: isFull, update: isFull, delete: isFull, publish: isFull },
      Import: { read: isFull, create: isFull, update: isFull, delete: isFull, publish: isFull },
    });

    const roles = {
      admin: { name: "Administrator", isSystem: true, permissions: defaultPermissions(true) },
      editor: { name: "Editor", isSystem: true, permissions: {
        ...defaultPermissions(false),
        Pages: { read: true, create: true, update: true, delete: false, publish: true },
        Blog: { read: true, create: true, update: true, delete: true, publish: true },
        Gallery: { read: true, create: true, update: true, delete: true, publish: true },
        Media: { read: true, create: true, update: true, delete: true, publish: true },
        Reviews: { read: true, create: true, update: true, delete: true, publish: true },
        SEO: { read: true, create: true, update: true, delete: false, publish: true },
        Translations: { read: true, create: true, update: true, delete: false, publish: true }
      } },
      client: { name: "Client", isSystem: true, permissions: {
        ...defaultPermissions(false),
        Pages: { read: true, create: false, update: true, delete: false, publish: false },
        Blog: { read: true, create: true, update: true, delete: false, publish: true },
        Reviews: { read: true, create: true, update: true, delete: false, publish: true },
      } },
      viewer: { name: "Viewer", isSystem: true, permissions: defaultPermissions(false) }
    };
    fs.writeFileSync(ROLES_FILE, JSON.stringify(roles, null, 2), "utf8");
  }

  // Bootstrap system settings
  if (!fs.existsSync(SYSTEM_SETTINGS_FILE)) {
    const defaultSettings = {
      cmsName: "Avenue Group CMS",
      logo: "/images/logo.png",
      favicon: "/favicon.png",
      adminEmail: "services@avenuegroup.lv",
      defaultLanguage: "lv",
      timezone: "Europe/Riga",
      dateFormat: "DD.MM.YYYY HH:mm",
      maxFileSizeMb: 10,
      allowedFileTypes: [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".docx", ".xlsx", ".zip"]
    };
    fs.writeFileSync(SYSTEM_SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), "utf8");
  }

  // Bootstrap users
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        firstName: "Sistēmas",
        lastName: "Administrators",
        email: "admin@avenuegroup.lv",
        passwordHash: hashPassword("AvenueAdmin2026!"),
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        lastActivity: null
      },
      {
        firstName: "Avenue",
        lastName: "Klients",
        email: "client@avenuegroup.lv",
        passwordHash: hashPassword("AvenueClient2026!"),
        role: "client",
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        lastActivity: null
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf8");
  } else {
    // Schema migration for existing users
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      let migrated = false;
      users.forEach((u: any) => {
        if (u.firstName === undefined) { u.firstName = u.email.split("@")[0]; migrated = true; }
        if (u.lastName === undefined) { u.lastName = "Lietotājs"; migrated = true; }
        if (u.status === undefined) { u.status = "active"; migrated = true; }
        if (u.lastLogin === undefined) { u.lastLogin = null; migrated = true; }
        if (u.lastActivity === undefined) { u.lastActivity = null; migrated = true; }
      });
      if (migrated) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      }
    } catch (e) {
      console.error("Failed to migrate users schema:", e);
    }
  }

  // Bootstrap drafts
  if (!fs.existsSync(DRAFTS_FILE)) {
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify({ drafts: {} }, null, 2), "utf8");
  }

  // Bootstrap config
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = {
      sections: {
        texts: true,
        destinations: true,
        blogs: true,
        reviews: true,
        galleries: true,
        seo: true,
        contacts: true,
        menus: true,
        footer: true,
        allJson: true
      },
      github: {
        repo: process.env.CMS_GITHUB_REPO || "",
        branch: process.env.CMS_GITHUB_BRANCH || "main"
      }
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), "utf8");
  }

  // Bootstrap logs
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), "utf8");
  }

  // Bootstrap publish history
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

// Log action helper
function addLog(email: string, action: string, details: string, ip = "127.0.0.1", objectName = "System", result = "Success") {
  try {
    const logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf8"));
    logs.unshift({
      timestamp: new Date().toISOString(),
      email,
      action,
      details,
      ip,
      object: objectName,
      result
    });
    // Keep last 1000 logs
    if (logs.length > 1000) {
      logs.length = 1000;
    }
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to audit log:", err);
  }
}

// In-memory active sessions (simple token map)
const sessions = new Map<string, { id: string; email: string; role: string; expiresAt: number; ip: string; userAgent: string; lastActivity: number }>();

// Brute force protection tracker
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

// Simple XSS sanitizer helper
function sanitizeString(str: string): string {
  if (!str || typeof str !== "string") return str;
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

export function setupCMS(app: express.Express) {
  initializeCMS();

  // Middleware for basic security headers (CSRF & XSS protection)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Content-Security-Policy", "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; media-src 'self' data: https:;");
    next();
  });

  // Middleware to authenticate CMS API calls
  function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const session = sessions.get(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (Date.now() > session.expiresAt) {
      sessions.delete(token);
      return res.status(401).json({ error: "Session expired" });
    }

    // Account block check
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const user = users.find((u: any) => u.email.toLowerCase() === session.email.toLowerCase());
      if (user) {
        if (user.status === "deactivated") {
          sessions.delete(token);
          return res.status(403).json({ error: "Lietotājs ir deaktivizēts." });
        }
        if (user.status === "blocked") {
          sessions.delete(token);
          return res.status(403).json({ error: "Lietotājs ir bloķēts." });
        }

        // Update last activity
        user.lastActivity = new Date().toISOString();
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      }
    } catch (e) {
      console.error("User validation check failed:", e);
    }

    // Refresh expiry on activity
    session.expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
    session.lastActivity = Date.now();
    (req as any).user = session;
    next();
  }

  // Middleware to check for Admin role
  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Piekļuve liegta. Nepieciešamas administratora tiesības." });
    }
    next();
  }

  // Auth routes
  app.post("/api/cms/login", express.json(), (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-pasts un parole ir obligāti" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "Unknown Browser";

    // Brute force check
    const attempts = loginAttempts.get(cleanEmail);
    if (attempts && attempts.lockUntil > Date.now()) {
      const waitMins = Math.ceil((attempts.lockUntil - Date.now()) / 60000);
      addLog(cleanEmail, "Brute Force Warning", `Bloķēts pieslēgšanās mēģinājums dēļ brutālas spēka uzbrukuma aizsardzības.`, ip, "Auth", "Failed (Locked)");
      return res.status(429).json({ error: `Pārlieku daudz nepareizu mēģinājumu. Konts uz laiku nobloķēts uz vēl ${waitMins} min.` });
    }

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const user = users.find((u: any) => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        // Increment attempts on fail
        const count = attempts ? attempts.count + 1 : 1;
        const lockUntil = count >= 5 ? Date.now() + 5 * 60 * 1000 : 0; // 5 mins lock
        loginAttempts.set(cleanEmail, { count, lockUntil });

        addLog(cleanEmail, "Login Fail", `Pieslēgšanās neizdevās: lietotājs nav atrasts.`, ip, "Auth", "Failed");
        return res.status(401).json({ error: "Nepareizs e-pasts vai parole" });
      }

      // Check status
      if (user.status === "deactivated") {
        return res.status(403).json({ error: "Jūsu konts ir deaktivizēts. Sazinieties ar administratoru." });
      }
      if (user.status === "blocked") {
        return res.status(403).json({ error: "Jūsu konts ir bloķēts dēļ drošības apsvērumiem." });
      }

      if (user.passwordHash !== hashPassword(password)) {
        // Increment attempts on fail
        const count = attempts ? attempts.count + 1 : 1;
        const lockUntil = count >= 5 ? Date.now() + 5 * 60 * 1000 : 0; // 5 mins lock
        loginAttempts.set(cleanEmail, { count, lockUntil });

        addLog(cleanEmail, "Login Fail", `Pieslēgšanās neizdevās: nepareiza parole.`, ip, "Auth", "Failed");
        return res.status(401).json({ error: "Nepareizs e-pasts vai parole" });
      }

      // Reset login attempts on success
      loginAttempts.delete(cleanEmail);

      // Generate secure session token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 30 * 60 * 1000; // 30 mins
      const sessionId = crypto.randomBytes(8).toString("hex");

      sessions.set(token, {
        id: sessionId,
        email: user.email,
        role: user.role,
        expiresAt,
        ip,
        userAgent,
        lastActivity: Date.now()
      });

      // Update last login on user item
      user.lastLogin = new Date().toISOString();
      user.lastActivity = new Date().toISOString();
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");

      addLog(user.email, "Login", "Lietotājs veiksmīgi pieslēdzās sistēmai.", ip, "Auth", "Success");

      res.json({
        token,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/cms/logout", authenticateToken, (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    if (token) {
      const session = sessions.get(token);
      if (session) {
        addLog(session.email, "Logout", "Lietotājs izrakstījās no sistēmas.", ip, "Auth", "Success");
      }
      sessions.delete(token);
    }
    res.json({ success: true });
  });

  app.get("/api/cms/me", authenticateToken, (req, res) => {
    res.json({
      email: (req as any).user.email,
      role: (req as any).user.role
    });
  });

  // User Manager (Admin only)
  app.get("/api/cms/users", authenticateToken, requireAdmin, (req, res) => {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const sanitizedUsers = users.map((u: any) => ({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email,
        role: u.role,
        status: u.status || "active",
        createdAt: u.createdAt,
        lastLogin: u.lastLogin || null,
        lastActivity: u.lastActivity || null,
        permissions: u.permissions || null
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to read users" });
    }
  });

  app.post("/api/cms/users", authenticateToken, requireAdmin, express.json(), (req, res) => {
    const { firstName, lastName, email, password, role, status, permissions } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: "E-pasts, parole un loma ir obligāti lauki" });
    }

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: "Lietotājs ar šādu e-pastu jau eksistē" });
      }

      const newUser = {
        firstName: sanitizeString(firstName || ""),
        lastName: sanitizeString(lastName || ""),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        role,
        status: status || "active",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        lastActivity: null,
        permissions: permissions || null
      };

      users.push(newUser);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      addLog((req as any).user.email, "Create User", `Izveidots lietotājs: ${email} (${role})`, req.ip, "Users", "Success");
      res.json({ success: true, user: { email: newUser.email, role: newUser.role } });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/cms/users/:email", authenticateToken, requireAdmin, express.json(), (req, res) => {
    const targetEmail = req.params.email;
    const { firstName, lastName, email: newEmail, password, role, status, permissions } = req.body;

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === targetEmail.toLowerCase());

      if (userIndex === -1) {
        return res.status(404).json({ error: "Lietotājs nav atrasts" });
      }

      const existingUser = users[userIndex];

      // If email is changing, check uniqueness
      if (newEmail && newEmail.toLowerCase().trim() !== targetEmail.toLowerCase()) {
        const emailExists = users.some((u: any) => u.email.toLowerCase() === newEmail.toLowerCase().trim());
        if (emailExists) {
          return res.status(400).json({ error: "E-pasts jau ir aizņemts" });
        }
        existingUser.email = newEmail.toLowerCase().trim();

        // Expire target's current session since email changed
        for (const [t, s] of sessions.entries()) {
          if (s.email.toLowerCase() === targetEmail.toLowerCase()) {
            sessions.delete(t);
          }
        }
      }

      if (firstName !== undefined) existingUser.firstName = sanitizeString(firstName);
      if (lastName !== undefined) existingUser.lastName = sanitizeString(lastName);
      if (password) existingUser.passwordHash = hashPassword(password);
      if (role) existingUser.role = role;
      
      if (status) {
        existingUser.status = status;
        // Expire sessions if deactivated or blocked
        if (status === "deactivated" || status === "blocked") {
          for (const [t, s] of sessions.entries()) {
            if (s.email.toLowerCase() === targetEmail.toLowerCase()) {
              sessions.delete(t);
            }
          }
        }
      }

      if (permissions !== undefined) existingUser.permissions = permissions;

      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      addLog((req as any).user.email, "Update User", `Atjaunināts lietotājs: ${targetEmail}`, req.ip, "Users", "Success");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/cms/users/:email", authenticateToken, requireAdmin, (req, res) => {
    const targetEmail = req.params.email;
    if (targetEmail.toLowerCase() === (req as any).user.email.toLowerCase()) {
      return res.status(400).json({ error: "Savu kontu nevar dzēst" });
    }

    try {
      let users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const lengthBefore = users.length;
      users = users.filter((u: any) => u.email.toLowerCase() !== targetEmail.toLowerCase());

      if (users.length === lengthBefore) {
        return res.status(404).json({ error: "Lietotājs nav atrasts" });
      }

      // Evict active sessions for deleted user
      for (const [t, s] of sessions.entries()) {
        if (s.email.toLowerCase() === targetEmail.toLowerCase()) {
          sessions.delete(t);
        }
      }

      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      addLog((req as any).user.email, "Delete User", `Dzēsts lietotājs: ${targetEmail}`, req.ip, "Users", "Success");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ROLES ENDPOINTS
  app.get("/api/cms/roles", authenticateToken, (req, res) => {
    try {
      const roles = JSON.parse(fs.readFileSync(ROLES_FILE, "utf8"));
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to read roles" });
    }
  });

  app.post("/api/cms/roles", authenticateToken, requireAdmin, express.json(), (req, res) => {
    const { key, name, permissions } = req.body;
    if (!key || !name || !permissions) {
      return res.status(400).json({ error: "Trūkst lomas atslēga, nosaukums vai tiesības" });
    }

    try {
      const roles = JSON.parse(fs.readFileSync(ROLES_FILE, "utf8"));
      roles[key.toLowerCase().trim()] = {
        name: sanitizeString(name),
        isSystem: false,
        permissions
      };
      fs.writeFileSync(ROLES_FILE, JSON.stringify(roles, null, 2), "utf8");
      addLog((req as any).user.email, "Create/Update Role", `Loma izveidota/atjaunināta: ${key}`, req.ip, "Roles", "Success");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save custom role" });
    }
  });

  app.delete("/api/cms/roles/:key", authenticateToken, requireAdmin, (req, res) => {
    const key = req.params.key.toLowerCase().trim();
    if (["admin", "editor", "client", "viewer"].includes(key)) {
      return res.status(400).json({ error: "Sistēmas lomas nevar dzēst" });
    }

    try {
      const roles = JSON.parse(fs.readFileSync(ROLES_FILE, "utf8"));
      if (!roles[key]) {
        return res.status(404).json({ error: "Loma nav atrasta" });
      }

      delete roles[key];
      fs.writeFileSync(ROLES_FILE, JSON.stringify(roles, null, 2), "utf8");
      addLog((req as any).user.email, "Delete Role", `Dzēsta loma: ${key}`, req.ip, "Roles", "Success");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  });

  // PROFILE SETTINGS
  app.get("/api/cms/profile", authenticateToken, (req, res) => {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const user = users.find((u: any) => u.email.toLowerCase() === (req as any).user.email.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "Lietotājs nav atrasts" });
      }
      res.json({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        role: user.role,
        status: user.status || "active",
        photo: user.photo || null,
        theme: user.theme || "light",
        language: user.language || "lv",
        notifications: user.notifications || { email: true, push: false, backup: true, security: true }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to read profile" });
    }
  });

  app.put("/api/cms/profile", authenticateToken, express.json(), (req, res) => {
    const { firstName, lastName, password, photo, theme, language, notifications } = req.body;
    const email = (req as any).user.email;

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "Profils nav atrasts" });
      }

      if (firstName !== undefined) user.firstName = sanitizeString(firstName);
      if (lastName !== undefined) user.lastName = sanitizeString(lastName);
      if (password) user.passwordHash = hashPassword(password);
      if (photo !== undefined) user.photo = photo;
      if (theme !== undefined) user.theme = theme;
      if (language !== undefined) user.language = language;
      if (notifications !== undefined) user.notifications = notifications;

      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      addLog(email, "Update Profile", "Lietotājs atjaunināja sava profila iestatījumus.", req.ip, "Profile", "Success");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // SESSION MANAGEMENT
  app.get("/api/cms/sessions", authenticateToken, requireAdmin, (req, res) => {
    const list = Array.from(sessions.entries()).map(([token, s]) => ({
      id: s.id,
      email: s.email,
      role: s.role,
      ip: s.ip,
      userAgent: s.userAgent,
      lastActivity: new Date(s.lastActivity).toISOString(),
      isCurrent: token === req.headers["authorization"]?.split(" ")[1]
    }));
    res.json(list);
  });

  app.delete("/api/cms/sessions/:id", authenticateToken, requireAdmin, (req, res) => {
    const sessionId = req.params.id;
    let found = false;
    for (const [token, s] of sessions.entries()) {
      if (s.id === sessionId) {
        sessions.delete(token);
        found = true;
        addLog((req as any).user.email, "Kill Session", `Piespiedu kārtā atslēgta sesija: ${s.email} (IP: ${s.ip})`, req.ip, "Sessions", "Success");
        break;
      }
    }
    if (found) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Sesija nav atrasta" });
    }
  });

  // SYSTEM SETTINGS
  app.get("/api/cms/system-settings", authenticateToken, requireAdmin, (req, res) => {
    try {
      const settings = JSON.parse(fs.readFileSync(SYSTEM_SETTINGS_FILE, "utf8"));
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to read system settings" });
    }
  });

  app.put("/api/cms/system-settings", authenticateToken, requireAdmin, express.json(), (req, res) => {
    try {
      const current = JSON.parse(fs.readFileSync(SYSTEM_SETTINGS_FILE, "utf8"));
      const updated = { ...current, ...req.body };
      fs.writeFileSync(SYSTEM_SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf8");
      addLog((req as any).user.email, "Update System Settings", "Atjaunināti globālie sistēmas iestatījumi.", req.ip, "Settings", "Success");
      res.json({ success: true, settings: updated });
    } catch (error) {
      res.status(500).json({ error: "Failed to write system settings" });
    }
  });

  // BACKUP MANAGER
  app.get("/api/cms/backups", authenticateToken, requireAdmin, (req, res) => {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }
      const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith(".zip"));
      const list = files.map(file => {
        const stats = fs.statSync(path.join(BACKUPS_DIR, file));
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.mtime.toISOString()
        };
      }).sort((a,b) => b.createdAt.localeCompare(a.createdAt));

      // Get auto backup settings
      const sys = JSON.parse(fs.readFileSync(SYSTEM_SETTINGS_FILE, "utf8"));
      res.json({
        backups: list,
        autoBackup: sys.autoBackup || { enabled: false, frequency: "daily", maxBackups: 10 }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to list backups" });
    }
  });

  app.post("/api/cms/backups", authenticateToken, requireAdmin, (req, res) => {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }

      // Zip the DATA_DIR excluding backups subfolder
      const zip = new AdmZip();
      const files = fs.readdirSync(DATA_DIR);
      for (const file of files) {
        if (file === "backups") continue; // skip backups folder itself
        const fullPath = path.join(DATA_DIR, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          zip.addLocalFolder(fullPath, file);
        } else if (stats.isFile()) {
          zip.addLocalFile(fullPath);
        }
      }

      const timestamp = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
      const filename = `backup_${timestamp}.zip`;
      zip.writeZip(path.join(BACKUPS_DIR, filename));

      addLog((req as any).user.email, "Create Backup", `Izveidots sistēmas dublējums: ${filename}`, req.ip, "Backup", "Success");
      res.json({ success: true, filename });
    } catch (error: any) {
      console.error("Backup creation error:", error);
      res.status(500).json({ error: error.message || "Failed to create backup" });
    }
  });

  app.post("/api/cms/backups/:filename/restore", authenticateToken, requireAdmin, (req, res) => {
    const filename = req.params.filename;
    const backupPath = path.join(BACKUPS_DIR, filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: "Backup file not found" });
    }

    try {
      const zip = new AdmZip(backupPath);
      // Clean target files in data folder except backup itself
      const currentFiles = fs.readdirSync(DATA_DIR);
      for (const file of currentFiles) {
        if (file === "backups") continue;
        const fullPath = path.join(DATA_DIR, file);
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
      }

      // Extract backup contents
      zip.extractAllTo(DATA_DIR, true);

      addLog((req as any).user.email, "Restore Backup", `Atjaunots sistēmas stāvoklis no dublējuma: ${filename}`, req.ip, "Backup", "Success");
      res.json({ success: true });
    } catch (error: any) {
      console.error("Restore backup error:", error);
      res.status(500).json({ error: error.message || "Failed to restore backup" });
    }
  });

  app.delete("/api/cms/backups/:filename", authenticateToken, requireAdmin, (req, res) => {
    const filename = req.params.filename;
    const backupPath = path.join(BACKUPS_DIR, filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: "Backup file not found" });
    }

    try {
      fs.unlinkSync(backupPath);
      addLog((req as any).user.email, "Delete Backup", `Dzēsts dublējuma fails: ${filename}`, req.ip, "Backup", "Success");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete backup" });
    }
  });

  app.get("/api/cms/backups/:filename/download", (req, res) => {
    // Basic auth check using query parameter because browser opens download links directly
    const token = req.query.token as string;
    if (!token || !sessions.has(token)) {
      return res.status(401).send("Unauthorized download");
    }

    const filename = req.params.filename;
    const backupPath = path.join(BACKUPS_DIR, filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).send("Backup file not found");
    }

    res.download(backupPath, filename);
  });

  app.put("/api/cms/backups/auto", authenticateToken, requireAdmin, express.json(), (req, res) => {
    try {
      const settings = JSON.parse(fs.readFileSync(SYSTEM_SETTINGS_FILE, "utf8"));
      settings.autoBackup = req.body;
      fs.writeFileSync(SYSTEM_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
      addLog((req as any).user.email, "Update Auto-Backup Config", "Atjaunināti automātisko dublējumu iestatījumi.", req.ip, "Backup", "Success");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update backup configuration" });
    }
  });

  // DEVELOPER SETTINGS
  app.get("/api/cms/developer-settings", authenticateToken, requireAdmin, (req, res) => {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      res.json({
        github: {
          repo: config.github?.repo || process.env.CMS_GITHUB_REPO || "",
          branch: config.github?.branch || process.env.CMS_GITHUB_BRANCH || "main",
          token: config.github?.token ? "••••••••••••••••" : (process.env.CMS_GITHUB_TOKEN ? "•••••••••••••••• (ENV)" : "")
        },
        netlify: {
          buildHook: config.netlify?.buildHook || process.env.NETLIFY_BUILD_HOOK || "",
          siteId: config.netlify?.siteId || process.env.NETLIFY_SITE_ID || ""
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to read developer settings" });
    }
  });

  app.put("/api/cms/developer-settings", authenticateToken, requireAdmin, express.json(), (req, res) => {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      const { github, netlify } = req.body;

      if (!config.github) config.github = {};
      if (github) {
        if (github.repo !== undefined) config.github.repo = github.repo;
        if (github.branch !== undefined) config.github.branch = github.branch;
        if (github.token && github.token !== "••••••••••••••••" && !github.token.includes("(ENV)")) {
          config.github.token = github.token;
        }
      }

      if (!config.netlify) config.netlify = {};
      if (netlify) {
        if (netlify.buildHook !== undefined) config.netlify.buildHook = netlify.buildHook;
        if (netlify.siteId !== undefined) config.netlify.siteId = netlify.siteId;
      }

      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
      addLog((req as any).user.email, "Update Developer Settings", "Atjaunināti izstrādātāju uzstādījumi (GitHub/Netlify).", req.ip, "Developer", "Success");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save developer settings" });
    }
  });

  // REAL-TIME SYSTEM STATUS & METRICS
  app.get("/api/cms/status-metrics", authenticateToken, (req, res) => {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      
      let mediaCount = 0;
      let mediaBytes = 0;
      if (fs.existsSync(PUBLIC_UPLOADS_DIR)) {
        const scanDir = (dirPath: string) => {
          const items = fs.readdirSync(dirPath);
          for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const s = fs.statSync(fullPath);
            if (s.isDirectory()) {
              scanDir(fullPath);
            } else if (s.isFile()) {
              mediaCount++;
              mediaBytes += s.size;
            }
          }
        };
        scanDir(PUBLIC_UPLOADS_DIR);
      }

      let backupCount = 0;
      let lastBackup = null;
      if (fs.existsSync(BACKUPS_DIR)) {
        const bFiles = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith(".zip"));
        backupCount = bFiles.length;
        if (backupCount > 0) {
          const times = bFiles.map(f => fs.statSync(path.join(BACKUPS_DIR, f)).mtime);
          lastBackup = new Date(Math.max(...times.map(t => t.getTime()))).toISOString();
        }
      }

      const activeUsersCount = Array.from(sessions.values())
        .map(s => s.email)
        .filter((val, idx, self) => self.indexOf(val) === idx).length;

      const mem = process.memoryUsage();
      
      res.json({
        version: "1.2.0",
        github: {
          connected: !!(config.github?.repo && (config.github?.token || process.env.CMS_GITHUB_TOKEN)),
          repo: config.github?.repo || ""
        },
        netlify: {
          connected: !!config.netlify?.buildHook,
          status: "Idle"
        },
        backups: {
          count: backupCount,
          lastBackup
        },
        media: {
          count: mediaCount,
          sizeMb: parseFloat((mediaBytes / (1024 * 1024)).toFixed(2))
        },
        users: {
          total: users.length,
          active: activeUsersCount
        },
        system: {
          memoryUsageMb: Math.round(mem.rss / (1024 * 1024)),
          uptimeSeconds: Math.round(process.uptime())
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to load metrics" });
    }
  });

  // GLOBAL CMS SEARCH ROUTE
  app.get("/api/cms/search", authenticateToken, (req, res) => {
    const q = (req.query.q as string || "").toLowerCase().trim();
    if (!q) {
      return res.json([]);
    }

    try {
      const results: Array<{ section: string; title: string; subtitle?: string; matchText?: string; sectionKey: string }> = [];

      // Scan pages.json
      const pagesPath = path.join(DATA_DIR, "pages.json");
      if (fs.existsSync(pagesPath)) {
        const pages = JSON.parse(fs.readFileSync(pagesPath, "utf8"));
        Object.entries(pages).forEach(([slug, page]: [string, any]) => {
          const title = page.title || "";
          const content = JSON.stringify(page);
          if (title.toLowerCase().includes(q) || content.toLowerCase().includes(q)) {
            results.push({
              section: "Lapas (Pages)",
              title: title || slug,
              subtitle: `Slug: /${slug}`,
              sectionKey: "Pages"
            });
          }
        });
      }

      // Scan blog.json / blogs.json
      const blogsPath = path.join(DATA_DIR, "blogs.json");
      if (fs.existsSync(blogsPath)) {
        const blogs = JSON.parse(fs.readFileSync(blogsPath, "utf8"));
        const list = Array.isArray(blogs) ? blogs : (blogs.blogs || []);
        list.forEach((b: any) => {
          const title = b.title || "";
          const content = JSON.stringify(b);
          if (title.toLowerCase().includes(q) || content.toLowerCase().includes(q)) {
            results.push({
              section: "Emuāri (Blog)",
              title: title,
              subtitle: b.date || b.category,
              sectionKey: "Blog"
            });
          }
        });
      }

      // Scan destinations.json
      const destPath = path.join(DATA_DIR, "destinations.json");
      if (fs.existsSync(destPath)) {
        const dests = JSON.parse(fs.readFileSync(destPath, "utf8"));
        const list = Array.isArray(dests) ? dests : (dests.destinations || []);
        list.forEach((d: any) => {
          const title = d.title || d.name || "";
          const content = JSON.stringify(d);
          if (title.toLowerCase().includes(q) || content.toLowerCase().includes(q)) {
            results.push({
              section: "Galamērķi (Destinations)",
              title: title,
              subtitle: d.country || d.region,
              sectionKey: "Destinations"
            });
          }
        });
      }

      // Scan faq.json
      const faqPath = path.join(DATA_DIR, "faq.json");
      if (fs.existsSync(faqPath)) {
        const faqs = JSON.parse(fs.readFileSync(faqPath, "utf8"));
        const list = Array.isArray(faqs) ? faqs : (faqs.faqs || []);
        list.forEach((f: any) => {
          const qText = f.question || "";
          const aText = f.answer || "";
          if (qText.toLowerCase().includes(q) || aText.toLowerCase().includes(q)) {
            results.push({
              section: "BUJ (FAQ)",
              title: qText,
              subtitle: aText.substring(0, 60) + "...",
              sectionKey: "FAQ"
            });
          }
        });
      }

      // Scan reviews.json
      const revPath = path.join(DATA_DIR, "reviews.json");
      if (fs.existsSync(revPath)) {
        const revs = JSON.parse(fs.readFileSync(revPath, "utf8"));
        const list = Array.isArray(revs) ? revs : (revs.reviews || []);
        list.forEach((r: any) => {
          const name = r.name || r.author || "";
          const txt = r.text || r.comment || "";
          if (name.toLowerCase().includes(q) || txt.toLowerCase().includes(q)) {
            results.push({
              section: "Atsauksmes (Reviews)",
              title: name,
              subtitle: txt.substring(0, 60) + "...",
              sectionKey: "Reviews"
            });
          }
        });
      }

      // Scan seo.json
      const seoPath = path.join(DATA_DIR, "seo.json");
      if (fs.existsSync(seoPath)) {
        const seoObj = JSON.parse(fs.readFileSync(seoPath, "utf8"));
        Object.entries(seoObj).forEach(([key, val]: [string, any]) => {
          const title = val.title || "";
          const desc = val.description || "";
          if (key.toLowerCase().includes(q) || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
            results.push({
              section: "SEO Optimizācija",
              title: `SEO: ${key}`,
              subtitle: title || desc,
              sectionKey: "SEO"
            });
          }
        });
      }

      // Scan users
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      users.forEach((u: any) => {
        const name = `${u.firstName || ""} ${u.lastName || ""}`;
        if (name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) {
          results.push({
            section: "Lietotāji (Users)",
            title: name.trim() || u.email,
            subtitle: `E-pasts: ${u.email} | Loma: ${u.role}`,
            sectionKey: "Users"
          });
        }
      });

      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // CMS System Configurations (Admin toggle sections & developer values)
  app.get("/api/cms/config", authenticateToken, (req, res) => {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      // Strip GitHub credentials for Client role
      if ((req as any).user.role !== "admin") {
        delete config.github;
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to read configuration" });
    }
  });

  app.post("/api/cms/config", authenticateToken, requireAdmin, express.json(), (req, res) => {
    const newConfig = req.body;
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), "utf8");
      addLog((req as any).user.email, "Update Config", "CMS konfigurācija veiksmīgi atjaunināta.");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  // Audit Logs (Admin only)
  app.get("/api/cms/logs", authenticateToken, requireAdmin, (req, res) => {
    try {
      const logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf8"));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to load audit logs" });
    }
  });

  // Content JSON Files scan & edit
  app.get("/api/cms/content-files", authenticateToken, (req, res) => {
    try {
      const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
      const draftsObj = JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf8")).drafts || {};

      const response = files.map((f) => {
        const stats = fs.statSync(path.join(DATA_DIR, f));
        return {
          filename: f,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
          hasDraft: !!draftsObj[f]
        };
      });

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to scan content files" });
    }
  });

  app.get("/api/cms/content-file/:filename", authenticateToken, (req, res) => {
    const filename = req.params.filename;
    if (!filename.endsWith(".json") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ error: "Invalid content filename" });
    }

    try {
      const filePath = path.join(DATA_DIR, filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const fileContent = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const draftsObj = JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf8")).drafts || {};

      res.json({
        filename,
        original: fileContent,
        draft: draftsObj[filename] || null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load content file" });
    }
  });

  app.post("/api/cms/content-file/:filename", authenticateToken, express.json({ limit: "20mb" }), (req, res) => {
    const filename = req.params.filename;
    const { draftContent } = req.body;

    if (!filename.endsWith(".json") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ error: "Invalid content filename" });
    }

    try {
      const draftsData = JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf8"));
      draftsData.drafts[filename] = draftContent;
      fs.writeFileSync(DRAFTS_FILE, JSON.stringify(draftsData, null, 2), "utf8");

      addLog((req as any).user.email, "Edit Draft", `Saglabātas melnraksta izmaiņas failam: ${filename}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save draft content" });
    }
  });

  app.delete("/api/cms/content-file/:filename/draft", authenticateToken, (req, res) => {
    const filename = req.params.filename;

    try {
      const draftsData = JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf8"));
      if (draftsData.drafts[filename]) {
        delete draftsData.drafts[filename];
        fs.writeFileSync(DRAFTS_FILE, JSON.stringify(draftsData, null, 2), "utf8");
        addLog((req as any).user.email, "Discard Draft", `Atceltas melnraksta izmaiņas failam: ${filename}`);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete draft content" });
    }
  });

  // GET Config
  app.get("/api/cms/config", authenticateToken, (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
        res.json(config);
      } else {
        res.json({});
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to read config" });
    }
  });

  // POST Config
  app.post("/api/cms/config", authenticateToken, express.json(), (req, res) => {
    try {
      const { github, netlify } = req.body;
      let currentConfig = {};
      if (fs.existsSync(CONFIG_FILE)) {
        currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      }

      const updatedConfig = {
        ...currentConfig,
        github: {
          ...(currentConfig as any).github,
          ...github
        },
        netlify: {
          ...(currentConfig as any).netlify,
          ...netlify
        }
      };

      fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), "utf8");
      addLog((req as any).user.email, "Update Config", "Atjaunināta sistēmas integrācijas konfigurācija (GitHub/Netlify)");
      res.json({ success: true, config: updatedConfig });
    } catch (error) {
      res.status(500).json({ error: "Failed to save config" });
    }
  });

  // Media Manager (Files & Uploads)
  app.get("/api/cms/media", authenticateToken, (req, res) => {
    try {
      const imageFiles = fs.existsSync(PUBLIC_UPLOADS_DIR)
        ? fs.readdirSync(PUBLIC_UPLOADS_DIR).map((f) => ({
            name: f,
            url: `/images/uploads/${f}`,
            type: "image",
            size: fs.statSync(path.join(PUBLIC_UPLOADS_DIR, f)).size,
            mtime: fs.statSync(path.join(PUBLIC_UPLOADS_DIR, f)).mtime.toISOString()
          }))
        : [];

      const docFiles = fs.existsSync(PUBLIC_DOCS_DIR)
        ? fs.readdirSync(PUBLIC_DOCS_DIR).map((f) => ({
            name: f,
            url: `/documents/${f}`,
            type: "document",
            size: fs.statSync(path.join(PUBLIC_DOCS_DIR, f)).size,
            mtime: fs.statSync(path.join(PUBLIC_DOCS_DIR, f)).mtime.toISOString()
          }))
        : [];

      res.json([...imageFiles, ...docFiles]);
    } catch (error) {
      res.status(500).json({ error: "Failed to scan media directory" });
    }
  });

  // Base64 robust upload without external dependencies
  app.post("/api/cms/upload", authenticateToken, express.json({ limit: "50mb" }), (req, res) => {
    const { name, data, type } = req.body; // data is base64 string
    if (!name || !data || !type) {
      return res.status(400).json({ error: "Name, data and type are required" });
    }

    try {
      const cleanName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const targetDir = type === "pdf" ? PUBLIC_DOCS_DIR : PUBLIC_UPLOADS_DIR;
      const targetPath = path.join(targetDir, cleanName);

      // Decode base64
      const buffer = Buffer.from(data, "base64");
      fs.writeFileSync(targetPath, buffer);

      addLog((req as any).user.email, "Upload Media", `Augšupielādēts fails: ${cleanName} (${type})`);
      res.json({
        success: true,
        url: type === "pdf" ? `/documents/${cleanName}` : `/images/uploads/${cleanName}`,
        name: cleanName
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload media" });
    }
  });

  app.delete("/api/cms/media/:type/:filename", authenticateToken, (req, res) => {
    const { type, filename } = req.params;
    if (filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    try {
      const targetDir = type === "pdf" || type === "document" ? PUBLIC_DOCS_DIR : PUBLIC_UPLOADS_DIR;
      const targetPath = path.join(targetDir, filename);

      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        addLog((req as any).user.email, "Delete Media", `Dzēsts fails: ${filename}`);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // GET Publish Status
  app.get("/api/cms/publish-status", authenticateToken, (req, res) => {
    try {
      const draftsData = JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf8"));
      const drafts = draftsData.drafts || {};
      const draftFiles = Object.keys(drafts);

      let totalAdded = 0;
      let totalModified = 0;
      let totalDeleted = 0;
      const changedSections: string[] = [];
      const details: Record<string, any> = {};

      const mapFilenameToSection = (fn: string): string => {
        const name = fn.replace(".json", "").toLowerCase();
        if (name === "pages") return "Lapas";
        if (name === "articles") return "Emuāri (Blog)";
        if (name === "faq" || name === "faqs") return "BUJ (FAQ)";
        if (name === "reviews") return "Atsauksmes";
        if (name === "destinations") return "Galamērķi";
        if (name === "gallery") return "Galerija";
        if (name === "services") return "Pakalpojumi";
        if (name === "translations") return "Tulkojumi";
        if (name === "menu") return "Izvēlne";
        if (name === "seo") return "SEO";
        if (name === "settings") return "Iestatījumi";
        return fn;
      };

      for (const filename of draftFiles) {
        const originalPath = path.join(DATA_DIR, filename);
        let originalContent: any = {};
        if (fs.existsSync(originalPath)) {
          try {
            originalContent = JSON.parse(fs.readFileSync(originalPath, "utf8"));
          } catch (e) {}
        }
        
        const draftContent = drafts[filename];
        const sectionName = mapFilenameToSection(filename);
        if (!changedSections.includes(sectionName)) {
          changedSections.push(sectionName);
        }

        // Generic comparison logic
        let added = 0;
        let modified = 0;
        let deleted = 0;

        const getArray = (obj: any): any[] | null => {
          if (!obj) return null;
          if (Array.isArray(obj)) return obj;
          for (const key of Object.keys(obj)) {
            if (Array.isArray(obj[key])) return obj[key];
          }
          return null;
        };

        const origArr = getArray(originalContent);
        const draftArr = getArray(draftContent);

        if (origArr && draftArr) {
          const getKey = (item: any) => item?.id || item?.slug || item?.key || item?.name || JSON.stringify(item);
          const origMap = new Map(origArr.map(item => [getKey(item), item]));
          const draftMap = new Map(draftArr.map(item => [getKey(item), item]));

          for (const [key, dItem] of draftMap.entries()) {
            if (!origMap.has(key)) {
              added++;
            } else {
              const oItem = origMap.get(key);
              if (JSON.stringify(oItem) !== JSON.stringify(dItem)) {
                modified++;
              }
            }
          }
          for (const key of origMap.keys()) {
            if (!draftMap.has(key)) {
              deleted++;
            }
          }
        } else {
          if (JSON.stringify(originalContent) !== JSON.stringify(draftContent)) {
            modified = 1;
          }
        }

        totalAdded += added;
        totalModified += modified;
        totalDeleted += deleted;

        details[filename] = { added, modified, deleted };
      }

      // Get last publish date
      let lastPublishDate = "";
      if (fs.existsSync(HISTORY_FILE)) {
        try {
          const history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
          if (history.length > 0) {
            lastPublishDate = history[0].timestamp;
          }
        } catch (e) {}
      }

      res.json({
        changedCount: totalAdded + totalModified + totalDeleted || draftFiles.length,
        changedSections,
        draftFiles,
        lastPublishDate,
        details
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to fetch publish status" });
    }
  });

  // GET Publish History
  app.get("/api/cms/publish-history", authenticateToken, (req, res) => {
    try {
      if (!fs.existsSync(HISTORY_FILE)) {
        return res.json([]);
      }
      const history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // POST Sync conflicting file from GitHub (Discard draft and load latest GitHub content)
  app.post("/api/cms/sync-file", authenticateToken, express.json(), async (req, res) => {
    const { filename, githubToken, githubRepo, githubBranch } = req.body;
    if (!filename) {
      return res.status(400).json({ error: "Missing filename" });
    }

    try {
      // Load config to fallback credentials
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      const token = githubToken || config.github?.token || process.env.CMS_GITHUB_TOKEN;
      const repo = githubRepo || config.github?.repo || process.env.CMS_GITHUB_REPO;
      const branch = githubBranch || config.github?.branch || "main";

      if (!token || !repo) {
        return res.status(400).json({ error: "GitHub credentials are required to sync." });
      }

      const [owner, repoName] = repo.split("/");
      const relativePath = `src/data/${filename}`;
      const getUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}?ref=${branch}`;

      const getRes = await fetch(getUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      });

      if (!getRes.ok) {
        throw new Error(`Fails nav atrasts GitHub repozitorijā: ${getRes.statusText}`);
      }

      const fileData: any = await getRes.json();
      const decodedContent = Buffer.from(fileData.content, "base64").toString("utf8");

      // Save to local original
      fs.writeFileSync(path.join(DATA_DIR, filename), decodedContent, "utf8");

      // Clear draft for this file
      const draftsData = JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf8"));
      if (draftsData.drafts && draftsData.drafts[filename]) {
        delete draftsData.drafts[filename];
        fs.writeFileSync(DRAFTS_FILE, JSON.stringify(draftsData, null, 2), "utf8");
      }

      addLog((req as any).user.email, "Sync File", `Sinhronizēts fails ar GitHub (Melnraksts atcelts): ${filename}`);
      res.json({ success: true, message: `Fails ${filename} veiksmīgi sinhronizēts.` });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to sync file" });
    }
  });

  // POST Rollback
  app.post("/api/cms/rollback", authenticateToken, express.json(), async (req, res) => {
    if ((req as any).user.role !== "admin") {
      return res.status(403).json({ error: "Tikai administratori var veikt rollback." });
    }

    const { publishId, githubToken, githubRepo, githubBranch } = req.body;
    if (!publishId) {
      return res.status(400).json({ error: "Missing publishId" });
    }

    try {
      const history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
      const record = history.find((h: any) => h.id === publishId);
      if (!record) {
        return res.status(404).json({ error: "Publish record not found" });
      }

      if (!record.snapshot || Object.keys(record.snapshot).length === 0) {
        return res.status(400).json({ error: "Šai publikācijai nav saglabāta rezerves kopija (snapshot)." });
      }

      // Restore files locally
      for (const [filename, content] of Object.entries(record.snapshot)) {
        const filePath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filePath, typeof content === "string" ? content : JSON.stringify(content, null, 2), "utf8");
      }

      // Push to GitHub
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      const token = githubToken || config.github?.token || process.env.CMS_GITHUB_TOKEN;
      const repo = githubRepo || config.github?.repo || process.env.CMS_GITHUB_REPO;
      const branch = githubBranch || config.github?.branch || "main";

      let githubSuccess = false;
      let githubMessage = "";

      if (token && repo) {
        const [owner, repoName] = repo.split("/");
        for (const filename of Object.keys(record.snapshot)) {
          const relativePath = `src/data/${filename}`;
          const fileContent = fs.readFileSync(path.join(DATA_DIR, filename), "utf8");
          const base64Content = Buffer.from(fileContent).toString("base64");

          const getUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}?ref=${branch}`;
          const getRes = await fetch(getUrl, {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json"
            }
          });

          let sha = "";
          if (getRes.ok) {
            const fileData: any = await getRes.json();
            sha = fileData.sha;
          }

          const putUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}`;
          await fetch(putUrl, {
            method: "PUT",
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: `CMS Rollback to version ${publishId} by ${(req as any).user.email}`,
              content: base64Content,
              sha: sha || undefined,
              branch: branch
            })
          });
        }
        githubSuccess = true;
        githubMessage = "Rollback pabeigts un nosūtīts uz GitHub. Netlify pārbūvēs lapu.";
      } else {
        githubMessage = "Rollback veikts lokāli, bet GitHub konfigurācija nav atrasta.";
      }

      // Add a rollback record to history
      const rollbackRecord = {
        id: `pub_rollback_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: (req as any).user.email,
        changedSections: ["Rollback"],
        changedFiles: Object.keys(record.snapshot),
        status: "Rollback",
        comment: `Atgriezts uz publikāciju: ${record.comment || record.id} (${new Date(record.timestamp).toLocaleString("lv-LV")})`
      };

      history.unshift(rollbackRecord);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf8");

      addLog((req as any).user.email, "Rollback", `Atgriezts saturs uz publikāciju ${publishId}`);

      res.json({
        success: true,
        githubSuccess,
        message: githubMessage,
        record: rollbackRecord
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Rollback failed" });
    }
  });

  // POST Publish - Enhanced with backup snapshot, conflict detection, media file upload support, audit logging
  app.post("/api/cms/publish", authenticateToken, express.json(), async (req, res) => {
    const { githubToken, githubRepo, githubBranch, comment, force } = req.body;

    try {
      const draftsData = JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf8"));
      const drafts = draftsData.drafts || {};
      const draftFiles = Object.keys(drafts);

      if (draftFiles.length === 0) {
        return res.status(400).json({ error: "Nav neviena aktīva melnraksta, ko publicēt." });
      }

      // Load server configuration
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      const token = githubToken || config.github?.token || process.env.CMS_GITHUB_TOKEN;
      const repo = githubRepo || config.github?.repo || process.env.CMS_GITHUB_REPO;
      const branch = githubBranch || config.github?.branch || "main";

      // 1. Conflict Check (Skip if force is true)
      if (!force && token && repo) {
        const [owner, repoName] = repo.split("/");
        for (const filename of draftFiles) {
          const relativePath = `src/data/${filename}`;
          const getUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}?ref=${branch}`;

          const getRes = await fetch(getUrl, {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json"
            }
          });

          if (getRes.ok) {
            const fileData: any = await getRes.json();
            const githubContent = Buffer.from(fileData.content, "base64").toString("utf8");
            
            // Read our local original file
            const localOriginalPath = path.join(DATA_DIR, filename);
            if (fs.existsSync(localOriginalPath)) {
              const localOriginalContent = fs.readFileSync(localOriginalPath, "utf8");
              
              try {
                const gitJson = JSON.stringify(JSON.parse(githubContent));
                const localJson = JSON.stringify(JSON.parse(localOriginalContent));
                
                if (gitJson !== localJson) {
                  // Conflict detected!
                  return res.status(409).json({
                    error: "conflict",
                    conflict: true,
                    filename,
                    message: `Konflikts detektēts failā "${filename}". Fails GitHub repozitorijā ir ticis modificēts kopš pēdējā labojuma CMS.`
                  });
                }
              } catch (parseErr) {
                // If parsing fails, fall back to simple string comparison
                if (githubContent.trim() !== localOriginalContent.trim()) {
                  return res.status(409).json({
                    error: "conflict",
                    conflict: true,
                    filename,
                    message: `Konflikts detektēts failā "${filename}".`
                  });
                }
              }
            }
          }
        }
      }

      // 2. Create rollback snapshot before writing
      const snapshot: Record<string, any> = {};
      for (const filename of draftFiles) {
        const filePath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filePath)) {
          snapshot[filename] = fs.readFileSync(filePath, "utf8");
        }
      }

      // 3. Save drafts to local original files
      for (const filename of draftFiles) {
        const filePath = path.join(DATA_DIR, filename);
        const draftContent = drafts[filename];
        fs.writeFileSync(filePath, JSON.stringify(draftContent, null, 2), "utf8");
      }

      // 4. Commit to GitHub
      let githubSuccess = false;
      let githubMessage = "";

      if (token && repo) {
        try {
          const [owner, repoName] = repo.split("/");

          // A. Commit changed data files
          for (const filename of draftFiles) {
            const relativePath = `src/data/${filename}`;
            const fileContent = fs.readFileSync(path.join(DATA_DIR, filename), "utf8");
            const base64Content = Buffer.from(fileContent).toString("base64");

            const getUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}?ref=${branch}`;
            const getRes = await fetch(getUrl, {
              headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github.v3+json"
              }
            });

            let sha = "";
            if (getRes.ok) {
              const fileData: any = await getRes.json();
              sha = fileData.sha;
            }

            const putUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}`;
            const putRes = await fetch(putUrl, {
              method: "PUT",
              headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                message: comment || `CMS Publicējums: ${filename}`,
                content: base64Content,
                sha: sha || undefined,
                branch: branch
              })
            });

            if (!putRes.ok) {
              const errBody = await putRes.text();
              throw new Error(`Kļūda saglabājot ${filename} programmā GitHub: ${errBody}`);
            }
          }

          // B. Scan and Push new images in public/images/uploads/
          if (fs.existsSync(PUBLIC_UPLOADS_DIR)) {
            const files = fs.readdirSync(PUBLIC_UPLOADS_DIR);
            for (const file of files) {
              const filePath = path.join(PUBLIC_UPLOADS_DIR, file);
              const stat = fs.statSync(filePath);
              if (stat.isFile()) {
                const relativePath = `public/images/uploads/${file}`;
                
                // Quick check on GitHub if file already exists
                const getUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}?ref=${branch}`;
                const getRes = await fetch(getUrl, {
                  headers: {
                    Authorization: `token ${token}`,
                    Accept: "application/vnd.github.v3+json"
                  }
                });

                if (!getRes.ok) {
                  // File does not exist on GitHub, push it
                  const fileContent = fs.readFileSync(filePath);
                  const base64Content = fileContent.toString("base64");

                  const putUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}`;
                  await fetch(putUrl, {
                    method: "PUT",
                    headers: {
                      Authorization: `token ${token}`,
                      Accept: "application/vnd.github.v3+json",
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      message: `CMS Augšupielādēts attēls: ${file}`,
                      content: base64Content,
                      branch: branch
                    })
                  });
                }
              }
            }
          }

          // C. Scan and Push new documents in public/documents/
          if (fs.existsSync(PUBLIC_DOCS_DIR)) {
            const files = fs.readdirSync(PUBLIC_DOCS_DIR);
            for (const file of files) {
              const filePath = path.join(PUBLIC_DOCS_DIR, file);
              const stat = fs.statSync(filePath);
              if (stat.isFile()) {
                const relativePath = `public/documents/${file}`;
                
                // Quick check on GitHub
                const getUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}?ref=${branch}`;
                const getRes = await fetch(getUrl, {
                  headers: {
                    Authorization: `token ${token}`,
                    Accept: "application/vnd.github.v3+json"
                  }
                });

                if (!getRes.ok) {
                  // Push document
                  const fileContent = fs.readFileSync(filePath);
                  const base64Content = fileContent.toString("base64");

                  const putUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}`;
                  await fetch(putUrl, {
                    method: "PUT",
                    headers: {
                      Authorization: `token ${token}`,
                      Accept: "application/vnd.github.v3+json",
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      message: `CMS Augšupielādēts dokuments: ${file}`,
                      content: base64Content,
                      branch: branch
                    })
                  });
                }
              }
            }
          }

          githubSuccess = true;
          githubMessage = "Mājaslapas saturs sekmīgi nosūtīts uz GitHub.";
        } catch (gitErr: any) {
          console.error("GitHub deployment failed:", gitErr);
          githubMessage = `Lokālie dati saglabāti, bet GitHub sinhronizācija neizdevās: ${gitErr.message || gitErr}`;
        }
      } else {
        githubMessage = "Dati saglabāti lokāli. Aktīva GitHub konfigurācija netika atrasta.";
      }

      // 5. Clear drafts after successful merge
      draftsData.drafts = {};
      fs.writeFileSync(DRAFTS_FILE, JSON.stringify(draftsData, null, 2), "utf8");

      // 6. Save publication history
      const publishId = `pub_${Date.now()}`;
      const historyRecord = {
        id: publishId,
        timestamp: new Date().toISOString(),
        user: (req as any).user.email,
        changedSections: draftFiles.map(fn => fn.replace(".json", "")),
        changedFiles: draftFiles,
        status: "Success",
        comment: comment || "Manuāla publikācija",
        snapshot
      };

      const history = fs.existsSync(HISTORY_FILE) ? JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8")) : [];
      history.unshift(historyRecord);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf8");

      addLog((req as any).user.email, "Publish", `Veiksmīgi publicētas izmaiņas failiem: ${draftFiles.join(", ")}. Komentārs: ${comment || ""}`);

      // 7. Fire Netlify build hook if configured
      if (config.netlify?.buildHook) {
        try {
          fetch(config.netlify.buildHook, { method: "POST" }).catch(() => {});
        } catch (netErr) {}
      }

      res.json({
        success: true,
        githubSuccess,
        message: githubMessage,
        files: draftFiles,
        record: { ...historyRecord, snapshot: undefined } // hide snapshot from response for speed
      });
    } catch (error: any) {
      console.error("Publish error:", error);
      res.status(500).json({ error: error.message || "Failed to publish content" });
    }
  });
}
