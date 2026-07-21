import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { makeGenericAPIRouteHandler } from "@keystatic/core/api/generic";
import keystaticConfig from "./keystatic.config";

// Load environment variables from .env file if present
dotenv.config();

// Ensure NODE_ENV defaults to production for compiled bundle stability
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

// Create the Keystatic API route handler
const keystaticApiHandler = makeGenericAPIRouteHandler({
  config: keystaticConfig,
  clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret: process.env.KEYSTATIC_SECRET || "a-very-secure-random-secret-key-for-session-signing-12345",
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware to parse incoming request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.text());

  // Health check API endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // Keystatic CMS API routes
  app.all("/api/keystatic/*", async (req, res) => {
    try {
      const protocol = req.protocol;
      const host = req.get("host");
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;

      const init: RequestInit = {
        method: req.method,
        headers: req.headers as Record<string, string>,
      };

      if (req.method !== "GET" && req.method !== "HEAD") {
        if (req.body) {
          init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        }
      }

      const webReq = new Request(fullUrl, init);
      const result = await keystaticApiHandler(webReq);

      res.status(result.status);

      if (result.headers) {
        for (const [key, val] of result.headers as any) {
          res.setHeader(key, val);
        }
      }

      if (result.body) {
        res.send(result.body);
      } else {
        res.end();
      }
    } catch (err) {
      console.error("Keystatic API error:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // Vite middleware for development or serving assets in production
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath);

  if (process.env.NODE_ENV !== "production" || !hasDist) {
    console.log(`Starting in development/fallback mode. (hasDist: ${hasDist})`);
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode serving static dist files.");
    app.use(express.static(distPath));
    
    // Serve index.html for all other routes to support client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
