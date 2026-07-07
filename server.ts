import express from "express";
import path from "path";
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import keystaticConfig from './keystatic.config';

import { exec } from "child_process";
import dotenv from "dotenv";

// Load environment variables from .env file if present
dotenv.config();

// Ensure NODE_ENV defaults to production for compiled bundle or production run stability
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

// Asynchronous helper to push changes to GitHub
function triggerGitSync() {
  if (process.env.GIT_SYNC === 'false') {
    return;
  }

  const repo = process.env.KEYSTATIC_GITHUB_REPO || 'AvenueGroupLV/avenue-group';
  const token = process.env.GITHUB_PAT || process.env.KEYSTATIC_GITHUB_TOKEN || process.env.KEYSTATIC_GITHUB_CLIENT_SECRET;

  console.log('CMS mutation detected. Triggering Git Sync...');

  let gitCommand = '';
  if (token) {
    gitCommand = `git remote set-url origin https://${token}@github.com/${repo}.git && `;
  }

  gitCommand += `git add . && git commit -m "CMS satura atjauninājums [skip ci]" && git push origin main`;

  exec(gitCommand, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error('Git sync failed:', error.message);
      return;
    }
    console.log('Git sync completed successfully.');
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Keystatic API Handler
  const keystaticHandler = makeGenericAPIRouteHandler({
    config: keystaticConfig,
    clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: process.env.KEYSTATIC_SECRET || 'avenue-group-keystatic-super-secret-key-194829',
  });

  // Handle Keystatic local storage API requests
  // Keystatic UI communicates via endpoints like /api/keystatic/tree, /api/keystatic/blob/...
  app.all('/api/keystatic/*', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host');
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;
      
      const keystaticReq = {
        method: req.method,
        url: fullUrl,
        headers: {
          get(name: string) {
            const val = req.headers[name.toLowerCase()];
            return Array.isArray(val) ? val[0] : (val || null);
          }
        },
        json: async () => {
          if (!req.body || req.body.length === 0) return null;
          return JSON.parse(req.body.toString('utf-8'));
        }
      };

      const response = await keystaticHandler(keystaticReq);
      
      // Copy Keystatic response headers
      if (response.headers) {
        if (Array.isArray(response.headers)) {
          response.headers.forEach(([key, val]) => {
            res.setHeader(key, val);
          });
        } else if (typeof response.headers === 'object') {
          Object.entries(response.headers).forEach(([key, val]) => {
            res.setHeader(key, val as string);
          });
        }
      }
      
      res.status(response.status || 200);
      
      if (response.body) {
        res.send(Buffer.from(response.body));
      } else {
        res.end();
      }

      // If this is a mutation (creation/update/deletion), push changes to GitHub asynchronously
      const isMutation = req.method !== 'GET' && req.method !== 'HEAD';
      const isSuccess = (response.status || 200) >= 200 && (response.status || 200) < 300;
      if (isMutation && isSuccess) {
        // Debounce Git Sync slightly so Keystatic completes writing files
        setTimeout(() => {
          triggerGitSync();
        }, 1000);
      }
    } catch (error) {
      console.error('Keystatic API error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Vite middleware for development or fallback for production assets
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
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
