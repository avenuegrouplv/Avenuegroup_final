import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env file if present
dotenv.config();

// Ensure NODE_ENV defaults to production for compiled bundle stability
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Health check API endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
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
