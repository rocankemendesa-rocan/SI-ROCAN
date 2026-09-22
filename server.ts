import express from "express";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // API Health Check - CRITICAL for verification
  app.get("/api/health", (req, res) => {
    console.log("Health check requested");
    res.json({ 
      status: "ok", 
      message: "SI-ROCAN Server is live",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  });

  const isDev = process.env.NODE_ENV !== "production" && !process.env.FOR_PROD;
  
  if (isDev) {
    console.log("Starting in DEVELOPMENT mode");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // SPA Fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) {
          console.error("Failed to serve index.html:", err);
          res.status(500).send("Application initialization error. Please try again later.");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> SI-ROCAN Server listening on 0.0.0.0:${PORT} <<<`);
  });
}

startServer().catch(err => {
  console.error("FATAL: Server failed to start:", err);
  process.exit(1);
});
