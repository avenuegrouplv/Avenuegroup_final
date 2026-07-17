import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const USERS_FILE = path.join(DATA_DIR, "cms-users.json");
const DRAFTS_FILE = path.join(DATA_DIR, "cms-drafts.json");
const CONFIG_FILE = path.join(DATA_DIR, "cms-config.json");
const LOGS_FILE = path.join(DATA_DIR, "cms-logs.json");

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

  // Bootstrap users
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        email: "admin@avenuegroup.lv",
        passwordHash: hashPassword("AvenueAdmin2026!"),
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        email: "client@avenuegroup.lv",
        passwordHash: hashPassword("AvenueClient2026!"),
        role: "client",
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf8");
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
}

// Log action helper
function addLog(email: string, action: string, details: string) {
  try {
    const logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf8"));
    logs.unshift({
      timestamp: new Date().toISOString(),
      email,
      action,
      details
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
const sessions = new Map<string, { email: string; role: string; expiresAt: number }>();

export function setupCMS(app: express.Express) {
  initializeCMS();

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

    // Refresh expiry on activity
    session.expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
    (req as any).user = session;
    next();
  }

  // Middleware to check for Admin role
  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = (req as any).user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }
    next();
  }

  // Auth routes
  app.post("/api/cms/login", express.json(), (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ error: "Nepareizs e-pasts vai parole" });
      }

      // Generate secure session token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 30 * 60 * 1000; // 30 mins
      sessions.set(token, { email: user.email, role: user.role, expiresAt });

      addLog(user.email, "Login", "Lietotājs veiksmīgi pieslēdzās sistēmai.");

      res.json({
        token,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/cms/logout", authenticateToken, (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
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
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to read users" });
    }
  });

  app.post("/api/cms/users", authenticateToken, requireAdmin, express.json(), (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: "Visi lauki ir obligāti" });
    }

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: "Lietotājs ar šādu e-pastu jau eksistē" });
      }

      users.push({
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role,
        createdAt: new Date().toISOString()
      });

      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      addLog((req as any).user.email, "Create User", `Izveidots lietotājs: ${email} (${role})`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/cms/users/:email", authenticateToken, requireAdmin, express.json(), (req, res) => {
    const targetEmail = req.params.email;
    const { password, role } = req.body;

    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === targetEmail.toLowerCase());

      if (userIndex === -1) {
        return res.status(404).json({ error: "Lietotājs nav atrasts" });
      }

      if (password) {
        users[userIndex].passwordHash = hashPassword(password);
      }
      if (role) {
        users[userIndex].role = role;
      }

      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      addLog((req as any).user.email, "Update User", `Atjaunināts lietotājs: ${targetEmail}`);
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

      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
      addLog((req as any).user.email, "Delete User", `Dzēsts lietotājs: ${targetEmail}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
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

  // Publish - merges drafts to original files and pushes to GitHub
  app.post("/api/cms/publish", authenticateToken, express.json(), async (req, res) => {
    const { githubToken, githubRepo, githubBranch } = req.body;

    try {
      const draftsData = JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf8"));
      const draftFiles = Object.keys(draftsData.drafts || {});

      if (draftFiles.length === 0) {
        return res.status(400).json({ error: "Nav neviena aktīva melnraksta, ko publicēt." });
      }

      // 1. Save all drafts to original files locally first
      for (const filename of draftFiles) {
        const filePath = path.join(DATA_DIR, filename);
        const draftContent = draftsData.drafts[filename];
        fs.writeFileSync(filePath, JSON.stringify(draftContent, null, 2), "utf8");
      }

      // 2. Commit to GitHub if configuration is present
      const token = githubToken || process.env.CMS_GITHUB_TOKEN;
      const repo = githubRepo || process.env.CMS_GITHUB_REPO;
      const branch = githubBranch || process.env.CMS_GITHUB_BRANCH || "main";

      let githubSuccess = false;
      let githubMessage = "";

      if (token && repo) {
        try {
          // Push files to GitHub using Octokit-like fetch operations
          const [owner, repoName] = repo.split("/");
          
          for (const filename of draftFiles) {
            const relativePath = `src/data/${filename}`;
            const fileContent = fs.readFileSync(path.join(DATA_DIR, filename), "utf8");
            const base64Content = Buffer.from(fileContent).toString("base64");

            // Get current file SHA from GitHub to update correctly
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

            // Write to GitHub
            const putUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${relativePath}`;
            const putRes = await fetch(putUrl, {
              method: "PUT",
              headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                message: `CMS Update: ${filename}`,
                content: base64Content,
                sha: sha || undefined,
                branch: branch
              })
            });

            if (!putRes.ok) {
              const errBody = await putRes.text();
              throw new Error(`Failed to commit ${filename} to GitHub: ${errBody}`);
            }
          }
          githubSuccess = true;
          githubMessage = "Mājaslapa tiks atjaunināta tuvāko 1–2 minūšu laikā (Netlify redeploy).";
        } catch (gitErr: any) {
          console.error("GitHub deployment failed:", gitErr);
          githubMessage = `Lokālie dati saglabāti, bet GitHub sinhronizācija neizdevās: ${gitErr.message || gitErr}`;
        }
      } else {
        githubMessage = "Dati saglabāti lokāli. GitHub konfigurācija nav atrasta, izmaiņas netika nosūtītas uz mākoņkrātuvi.";
      }

      // 3. Clear drafts after successful merge
      draftsData.drafts = {};
      fs.writeFileSync(DRAFTS_FILE, JSON.stringify(draftsData, null, 2), "utf8");

      addLog((req as any).user.email, "Publish", `Veiksmīgi publicētas izmaiņas failiem: ${draftFiles.join(", ")}`);

      res.json({
        success: true,
        githubSuccess,
        message: githubMessage,
        files: draftFiles
      });
    } catch (error: any) {
      console.error("Publish error:", error);
      res.status(500).json({ error: error.message || "Failed to publish content" });
    }
  });
}
