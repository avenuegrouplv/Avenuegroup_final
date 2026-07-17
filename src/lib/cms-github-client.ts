// Pure client-side CMS simulation for static environments (like Netlify)
// Using direct GitHub API operations with the repository token

const CMS_REPO = "avenuegrouplv/Avenuegroup_final";
const CMS_BRANCH = "main";
const CMS_TOKEN = "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";

// Robust UTF-8 safe base64 decoding and encoding
function b64DecodeUnicode(str: string): string {
  const cleanStr = str.replace(/\s/g, "");
  return decodeURIComponent(
    atob(cleanStr)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

function b64EncodeUnicode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

// Browser SHA-256 implementation matching node's crypto
async function hashPasswordSHA256(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper to interact with GitHub API
async function githubFetch(path: string, options: RequestInit = {}) {
  const url = `https://api.github.com/repos/${CMS_REPO}/contents/${path}?ref=${CMS_BRANCH}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `token ${CMS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      ...options.headers
    }
  });
  return response;
}

// Get file JSON from GitHub
async function getGithubJSON(path: string, defaultValue: any = null): Promise<{ data: any; sha: string }> {
  try {
    const res = await githubFetch(path);
    if (res.status === 404) {
      // Provide robust fallback defaults if the files are not yet created in GitHub repository
      if (path === "src/data/cms-users.json") {
        return {
          data: [
            {
              email: "admin@avenuegroup.lv",
              passwordHash: "7724910c50c6d587163e74c38699587bba1504c2a95b70c554674767b71fb857", // SHA256 of AvenueAdmin2026!
              role: "admin",
              createdAt: new Date().toISOString()
            },
            {
              email: "client@avenuegroup.lv",
              passwordHash: "285eb3e257a8c7404e42affedf027569a75120389eb69e5adf18061b0a700a96", // SHA256 of AvenueClient2026!
              role: "client",
              createdAt: new Date().toISOString()
            }
          ],
          sha: ""
        };
      }
      if (path === "src/data/cms-config.json") {
        return {
          data: {
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
            }
          },
          sha: ""
        };
      }
      if (path === "src/data/cms-drafts.json") {
        return { data: { drafts: {} }, sha: "" };
      }
      if (path === "src/data/cms-logs.json") {
        return { data: [], sha: "" };
      }
      return { data: defaultValue, sha: "" };
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch ${path} from GitHub`);
    }
    const fileInfo = await res.json();
    const content = b64DecodeUnicode(fileInfo.content);
    return { data: JSON.parse(content), sha: fileInfo.sha };
  } catch (err) {
    console.error(`Error loading GitHub JSON for ${path}:`, err);
    return { data: defaultValue, sha: "" };
  }
}

// Save file content to GitHub
async function saveGithubJSON(path: string, data: any, message: string) {
  const { sha } = await getGithubJSON(path);
  const base64Content = b64EncodeUnicode(JSON.stringify(data, null, 2));

  const url = `https://api.github.com/repos/${CMS_REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${CMS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: base64Content,
      sha: sha || undefined,
      branch: CMS_BRANCH
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub save error for ${path}: ${errorText}`);
  }
  return res.json();
}

// Add client-side log entry directly to GitHub cms-logs.json
async function addClientLog(email: string, action: string, details: string) {
  try {
    const { data: logs, sha } = await getGithubJSON("src/data/cms-logs.json", []);
    const newLogs = [
      {
        timestamp: new Date().toISOString(),
        email,
        action,
        details
      },
      ...logs
    ].slice(0, 500);

    await saveGithubJSON("src/data/cms-logs.json", newLogs, `CMS Log: ${action} by ${email}`);
  } catch (err) {
    console.error("Failed to save audit log to GitHub:", err);
  }
}

// Client-side simulation of Express CMS endpoints
async function handleStaticCmsFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method?.toUpperCase() || "GET";
  const bodyData = init?.body ? JSON.parse(init.body as string) : {};
  const authHeader = init?.headers ? (init.headers as any)["Authorization"] || (init.headers as any)["authorization"] : "";
  const token = authHeader?.split(" ")[1] || "";

  // Helper to construct a JSON Response
  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  };

  // Auth Guard helper for simulating endpoints
  const getSession = () => {
    if (!token) return null;
    try {
      const sessionStr = localStorage.getItem(`cms_static_session_${token}`);
      if (!sessionStr) return null;
      const session = JSON.parse(sessionStr);
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(`cms_static_session_${token}`);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  };

  // 1. POST /api/cms/login
  if (url === "/api/cms/login" && method === "POST") {
    const { email, password } = bodyData;
    if (!email || !password) {
      return jsonResponse({ error: "E-pasts un parole ir obligāti" }, 400);
    }

    const { data: users } = await getGithubJSON("src/data/cms-users.json", []);
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    const inputHash = await hashPasswordSHA256(password);
    if (!user || user.passwordHash !== inputHash) {
      return jsonResponse({ error: "Nepareizs e-pasts vai parole" }, 401);
    }

    // Generate secure session token
    const generatedToken = "static_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour session

    localStorage.setItem(`cms_static_session_${generatedToken}`, JSON.stringify({
      email: user.email,
      role: user.role,
      expiresAt
    }));

    await addClientLog(user.email, "Login", "Lietotājs veiksmīgi pieslēdzās sistēmai (Static Direct Mode).");

    return jsonResponse({
      token: generatedToken,
      email: user.email,
      role: user.role
    });
  }

  // 2. POST /api/cms/logout
  if (url === "/api/cms/logout" && method === "POST") {
    if (token) {
      localStorage.removeItem(`cms_static_session_${token}`);
    }
    return jsonResponse({ success: true });
  }

  // Auth enforcement for other endpoints
  const currentSession = getSession();
  if (!currentSession) {
    return jsonResponse({ error: "Autorizācijas sesija ir beigusies vai nederīga." }, 401);
  }

  // 3. GET /api/cms/me
  if (url === "/api/cms/me" && method === "GET") {
    return jsonResponse({
      email: currentSession.email,
      role: currentSession.role
    });
  }

  // 4. GET /api/cms/config
  if (url === "/api/cms/config" && method === "GET") {
    const { data: config } = await getGithubJSON("src/data/cms-config.json", {
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
      }
    });

    if (currentSession.role !== "admin") {
      delete config.github;
    }
    return jsonResponse(config);
  }

  // 5. POST /api/cms/config
  if (url === "/api/cms/config" && method === "POST") {
    if (currentSession.role !== "admin") {
      return jsonResponse({ error: "Piekļuve liegta" }, 403);
    }
    await saveGithubJSON("src/data/cms-config.json", bodyData, "CMS Config Update");
    await addClientLog(currentSession.email, "Update Config", "Atjaunināta CMS konfigurācija.");
    return jsonResponse({ success: true });
  }

  // 6. GET /api/cms/users
  if (url === "/api/cms/users" && method === "GET") {
    if (currentSession.role !== "admin") {
      return jsonResponse({ error: "Piekļuve liegta" }, 403);
    }
    const { data: users } = await getGithubJSON("src/data/cms-users.json", []);
    const sanitizedUsers = users.map((u: any) => ({
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));
    return jsonResponse(sanitizedUsers);
  }

  // 7. POST /api/cms/users
  if (url === "/api/cms/users" && method === "POST") {
    if (currentSession.role !== "admin") {
      return jsonResponse({ error: "Piekļuve liegta" }, 403);
    }
    const { email, password, role } = bodyData;
    const { data: users } = await getGithubJSON("src/data/cms-users.json", []);
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return jsonResponse({ error: "Lietotājs ar šādu e-pastu jau eksistē" }, 400);
    }

    const hashed = await hashPasswordSHA256(password);
    users.push({
      email: email.toLowerCase(),
      passwordHash: hashed,
      role,
      createdAt: new Date().toISOString()
    });

    await saveGithubJSON("src/data/cms-users.json", users, `Created CMS User: ${email}`);
    await addClientLog(currentSession.email, "Create User", `Izveidots lietotājs: ${email} (${role})`);
    return jsonResponse({ success: true });
  }

  // 8. PUT /api/cms/users/:email
  if (url.startsWith("/api/cms/users/") && method === "PUT") {
    if (currentSession.role !== "admin") {
      return jsonResponse({ error: "Piekļuve liegta" }, 403);
    }
    const targetEmail = decodeURIComponent(url.split("/api/cms/users/")[1]);
    const { password, role } = bodyData;

    const { data: users } = await getGithubJSON("src/data/cms-users.json", []);
    const idx = users.findIndex((u: any) => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (idx === -1) {
      return jsonResponse({ error: "Lietotājs nav atrasts" }, 404);
    }

    if (password) {
      users[idx].passwordHash = await hashPasswordSHA256(password);
    }
    if (role) {
      users[idx].role = role;
    }

    await saveGithubJSON("src/data/cms-users.json", users, `Updated CMS User: ${targetEmail}`);
    await addClientLog(currentSession.email, "Update User", `Atjaunināts lietotājs: ${targetEmail}`);
    return jsonResponse({ success: true });
  }

  // 9. DELETE /api/cms/users/:email
  if (url.startsWith("/api/cms/users/") && method === "DELETE") {
    if (currentSession.role !== "admin") {
      return jsonResponse({ error: "Piekļuve liegta" }, 403);
    }
    const targetEmail = decodeURIComponent(url.split("/api/cms/users/")[1]);
    if (targetEmail.toLowerCase() === currentSession.email.toLowerCase()) {
      return jsonResponse({ error: "Savu kontu nevar dzēst" }, 400);
    }

    const { data: users } = await getGithubJSON("src/data/cms-users.json", []);
    const filtered = users.filter((u: any) => u.email.toLowerCase() !== targetEmail.toLowerCase());
    if (filtered.length === users.length) {
      return jsonResponse({ error: "Lietotājs nav atrasts" }, 404);
    }

    await saveGithubJSON("src/data/cms-users.json", filtered, `Deleted CMS User: ${targetEmail}`);
    await addClientLog(currentSession.email, "Delete User", `Dzēsts lietotājs: ${targetEmail}`);
    return jsonResponse({ success: true });
  }

  // 10. GET /api/cms/logs
  if (url === "/api/cms/logs" && method === "GET") {
    if (currentSession.role !== "admin") {
      return jsonResponse({ error: "Piekļuve liegta" }, 403);
    }
    const { data: logs } = await getGithubJSON("src/data/cms-logs.json", []);
    return jsonResponse(logs);
  }

  // 11. GET /api/cms/content-files
  if (url === "/api/cms/content-files" && method === "GET") {
    // List directory content from GitHub
    const res = await fetch(`https://api.github.com/repos/${CMS_REPO}/contents/src/data?ref=${CMS_BRANCH}`, {
      headers: {
        Authorization: `token ${CMS_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!res.ok) {
      throw new Error("Neizdevās nolasīt failu sarakstu no GitHub");
    }

    const items = await res.json();
    const files = Array.isArray(items) ? items.filter((f: any) => f.name.endsWith(".json")) : [];

    const { data: draftsData } = await getGithubJSON("src/data/cms-drafts.json", { drafts: {} });
    const draftsObj = draftsData.drafts || {};

    const response = files.map((f: any) => ({
      filename: f.name,
      size: f.size,
      updatedAt: new Date().toISOString(),
      hasDraft: !!draftsObj[f.name]
    }));

    return jsonResponse(response);
  }

  // 12. GET /api/cms/content-file/:filename
  if (url.startsWith("/api/cms/content-file/") && method === "GET") {
    const filename = url.split("/api/cms/content-file/")[1];
    if (!filename || !filename.endsWith(".json")) {
      return jsonResponse({ error: "Nederīgs faila nosaukums" }, 400);
    }

    const { data: originalContent } = await getGithubJSON(`src/data/${filename}`, {});
    const { data: draftsData } = await getGithubJSON("src/data/cms-drafts.json", { drafts: {} });
    const draftsObj = draftsData.drafts || {};

    return jsonResponse({
      filename,
      original: originalContent,
      draft: draftsObj[filename] || null
    });
  }

  // 13. POST /api/cms/content-file/:filename (Save Draft)
  if (url.startsWith("/api/cms/content-file/") && method === "POST") {
    const filename = url.split("/api/cms/content-file/")[1];
    if (!filename || !filename.endsWith(".json")) {
      return jsonResponse({ error: "Nederīgs faila nosaukums" }, 400);
    }

    const { draftContent } = bodyData;
    const { data: draftsData } = await getGithubJSON("src/data/cms-drafts.json", { drafts: {} });
    if (!draftsData.drafts) draftsData.drafts = {};
    draftsData.drafts[filename] = draftContent;

    await saveGithubJSON("src/data/cms-drafts.json", draftsData, `Save CMS Draft: ${filename}`);
    await addClientLog(currentSession.email, "Edit Draft", `Saglabāts melnraksts failam: ${filename}`);
    return jsonResponse({ success: true });
  }

  // 14. DELETE /api/cms/content-file/:filename/draft (Discard Draft)
  if (url.startsWith("/api/cms/content-file/") && url.endsWith("/draft") && method === "DELETE") {
    const filename = url.split("/api/cms/content-file/")[1].split("/")[0];
    if (!filename || !filename.endsWith(".json")) {
      return jsonResponse({ error: "Nederīgs faila nosaukums" }, 400);
    }

    const { data: draftsData } = await getGithubJSON("src/data/cms-drafts.json", { drafts: {} });
    if (draftsData.drafts && draftsData.drafts[filename]) {
      delete draftsData.drafts[filename];
      await saveGithubJSON("src/data/cms-drafts.json", draftsData, `Discard CMS Draft: ${filename}`);
      await addClientLog(currentSession.email, "Discard Draft", `Atcelts melnraksts failam: ${filename}`);
    }
    return jsonResponse({ success: true });
  }

  // 15. GET /api/cms/media
  if (url === "/api/cms/media" && method === "GET") {
    // List uploads from GitHub
    const uploadsRes = await fetch(`https://api.github.com/repos/${CMS_REPO}/contents/public/images/uploads?ref=${CMS_BRANCH}`, {
      headers: {
        Authorization: `token ${CMS_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    const docsRes = await fetch(`https://api.github.com/repos/${CMS_REPO}/contents/public/documents?ref=${CMS_BRANCH}`, {
      headers: {
        Authorization: `token ${CMS_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    const uploadsList = uploadsRes.ok ? await uploadsRes.json() : [];
    const docsList = docsRes.ok ? await docsRes.json() : [];

    const uploads = Array.isArray(uploadsList)
      ? uploadsList.map((f: any) => ({
          name: f.name,
          url: `/images/uploads/${f.name}`,
          type: "image",
          size: f.size,
          mtime: new Date().toISOString()
        }))
      : [];

    const docs = Array.isArray(docsList)
      ? docsList.map((f: any) => ({
          name: f.name,
          url: `/documents/${f.name}`,
          type: "document",
          size: f.size,
          mtime: new Date().toISOString()
        }))
      : [];

    return jsonResponse([...uploads, ...docs]);
  }

  // 16. POST /api/cms/upload
  if (url === "/api/cms/upload" && method === "POST") {
    const { name, data, type } = bodyData;
    if (!name || !data || !type) {
      return jsonResponse({ error: "Name, data and type are required" }, 400);
    }

    const cleanName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const relativePath = type === "pdf" ? `public/documents/${cleanName}` : `public/images/uploads/${cleanName}`;

    // Write file directly to GitHub using PUT
    // File data is already a base64 string
    const uploadUrl = `https://api.github.com/repos/${CMS_REPO}/contents/${relativePath}`;
    
    // Check if file exists to obtain SHA
    const getRes = await fetch(`${uploadUrl}?ref=${CMS_BRANCH}`, {
      headers: {
        Authorization: `token ${CMS_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });
    let sha = "";
    if (getRes.ok) {
      const existingInfo = await getRes.json();
      sha = existingInfo.sha;
    }

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${CMS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `CMS Upload: ${cleanName}`,
        content: data, // already base64 string
        sha: sha || undefined,
        branch: CMS_BRANCH
      })
    });

    if (!putRes.ok) {
      const errBody = await putRes.text();
      throw new Error(`Media upload failed on GitHub: ${errBody}`);
    }

    await addClientLog(currentSession.email, "Upload Media", `Augšupielādēts fails: ${cleanName} (${type})`);

    return jsonResponse({
      success: true,
      url: type === "pdf" ? `/documents/${cleanName}` : `/images/uploads/${cleanName}`,
      name: cleanName
    });
  }

  // 17. DELETE /api/cms/media/:type/:filename
  if (url.startsWith("/api/cms/media/") && method === "DELETE") {
    const parts = url.split("/api/cms/media/")[1].split("/");
    const type = parts[0];
    const filename = parts[1];

    if (!type || !filename || filename.includes("..")) {
      return jsonResponse({ error: "Nepareizi parametri" }, 400);
    }

    const relativePath = type === "pdf" || type === "document" ? `public/documents/${filename}` : `public/images/uploads/${filename}`;
    const fileUrl = `https://api.github.com/repos/${CMS_REPO}/contents/${relativePath}`;

    // Get current file SHA to delete it
    const getRes = await fetch(`${fileUrl}?ref=${CMS_BRANCH}`, {
      headers: {
        Authorization: `token ${CMS_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!getRes.ok) {
      return jsonResponse({ error: "Fails nav atrasts" }, 404);
    }

    const fileInfo = await getRes.json();
    const sha = fileInfo.sha;

    // Delete request
    const delRes = await fetch(fileUrl, {
      method: "DELETE",
      headers: {
        Authorization: `token ${CMS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `CMS Delete: ${filename}`,
        sha,
        branch: CMS_BRANCH
      })
    });

    if (!delRes.ok) {
      const errBody = await delRes.text();
      throw new Error(`Failed to delete file from GitHub: ${errBody}`);
    }

    await addClientLog(currentSession.email, "Delete Media", `Dzēsts fails: ${filename}`);
    return jsonResponse({ success: true });
  }

  // 18. POST /api/cms/publish
  if (url === "/api/cms/publish" && method === "POST") {
    const { data: draftsData } = await getGithubJSON("src/data/cms-drafts.json", { drafts: {} });
    const draftFiles = Object.keys(draftsData.drafts || {});

    if (draftFiles.length === 0) {
      return jsonResponse({ error: "Nav neviena aktīva melnraksta, ko publicēt." }, 400);
    }

    // Loop through draft files and commit them as main files on GitHub
    for (const filename of draftFiles) {
      const relativePath = `src/data/${filename}`;
      const draftContent = draftsData.drafts[filename];
      const base64Content = b64EncodeUnicode(JSON.stringify(draftContent, null, 2));

      // Get current file SHA from GitHub
      const fileUrl = `https://api.github.com/repos/${CMS_REPO}/contents/${relativePath}`;
      const getRes = await fetch(`${fileUrl}?ref=${CMS_BRANCH}`, {
        headers: {
          Authorization: `token ${CMS_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      });

      let sha = "";
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }

      // Publish the file (write it on main branch)
      const putRes = await fetch(fileUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${CMS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `CMS Publish: ${filename}`,
          content: base64Content,
          sha: sha || undefined,
          branch: CMS_BRANCH
        })
      });

      if (!putRes.ok) {
        const errBody = await putRes.text();
        throw new Error(`Failed to publish file ${filename}: ${errBody}`);
      }
    }

    // Clear drafts
    draftsData.drafts = {};
    await saveGithubJSON("src/data/cms-drafts.json", draftsData, "Clear CMS Drafts on Publish");

    await addClientLog(currentSession.email, "Publish", `Veiksmīgi publicētas izmaiņas failiem: ${draftFiles.join(", ")}`);

    return jsonResponse({
      success: true,
      githubSuccess: true,
      message: "Mājaslapa tiks atjaunināta tuvāko 1–2 minūšu laikā (Netlify automātiskā pārbūve).",
      files: draftFiles
    });
  }

  return jsonResponse({ error: "Endpoint not simulated" }, 404);
}

// Global monkey-patch of window.fetch
export function initStaticCmsInterceptor() {
  if (typeof window === "undefined" || (window as any).__cms_interceptor_init) {
    return;
  }

  (window as any).__cms_interceptor_init = true;
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === "string" ? input : (input as any).url || "";

    // Intercept any relative `/api/cms/*` or absolute CMS requests
    if (url.startsWith("/api/cms/") || url.includes("/api/cms/")) {
      const cleanUrl = url.startsWith("/api/cms/") ? url : "/" + url.split("/api/")[1];
      
      // Determine if running statically (Netlify, production domain) or backend is missing
      const isStatic = window.location.hostname !== "localhost" && 
                       !window.location.hostname.includes("run.app") && 
                       !window.location.hostname.includes("aistudio") &&
                       !window.location.hostname.includes("gitpod");

      if (isStatic) {
        try {
          return await handleStaticCmsFetch(cleanUrl, init);
        } catch (err: any) {
          console.error("Static CMS Interceptor Error:", err);
          return new Response(JSON.stringify({ error: err.message || "Apstrādes kļūda, strādājot bez servera režīmā." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }

    return originalFetch.apply(this, arguments as any);
  };
  
  console.log("CMS Static GitHub Interceptor loaded successfully.");
}
