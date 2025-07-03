import { createServer } from "http";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
// In development, Vite handles HMR and client-side routing.
// In production, Vercel handles body parsing, so we only need this for local dev.
if (app.get("env") === "development") {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Register API routes
registerRoutes(app);

// Create the HTTP server
const server = createServer(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Setup Vite for development or serve static files for production
if (process.env.NODE_ENV === "development") {
  setupVite(app, server);
} else {
  // In a non-Vercel production environment, you'd serve static files.
  // Vercel handles this automatically via its build output configuration.
  serveStatic(app);
}

// Start the server only if not in a serverless environment (like Vercel)
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    log(`Server listening on port ${port}`);
  });
}

// Export the app for Vercel
export default app;
