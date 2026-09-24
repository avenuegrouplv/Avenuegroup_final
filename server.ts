import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env file if present
dotenv.config();

// Determine production mode: Cloud Run (K_SERVICE), npm start, or built dist present
if (process.env.K_SERVICE || process.env.npm_lifecycle_event === "start" || !process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

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

  // Check if static dist bundle exists
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isDev = process.env.npm_lifecycle_event === 'dev' || (process.env.NODE_ENV === 'development' && !hasDist && !process.env.K_SERVICE);

  if (isDev) {
    console.log(`Starting in development mode with Vite middleware. (hasDist: ${hasDist})`);
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    process.env.NODE_ENV = "production";
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
