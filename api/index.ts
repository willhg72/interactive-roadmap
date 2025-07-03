import { createServer } from "http";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import cors from "cors";

const app = express();
const server = createServer(app);

// --- Middleware ---
app.use(cors());

// Body parsing middleware (only for development, Vercel handles it in production)
if (process.env.NODE_ENV === "development") {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

// Logging middleware
app.use((req, _res, next) => {
  console.log(`[roadmap] ${req.method} ${req.url}`);
  next();
});

// --- Route Registration ---
registerRoutes(app);

// --- Development-Only Vite Setup ---
// This block is crucial. It's completely removed from the production build
// because the import is dynamic and conditional.
if (process.env.NODE_ENV === "development") {
  (async () => {
    // Dynamically import Vite server setup
    const { setupVite } = await import("./vite.js");
    // setupVite will attach itself to the existing Express app
    setupVite(app, server);
  })();
}

// --- Error Handling ---
// This must be after routes and other middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err); // Log the full error for debugging
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// --- Server Startup ---
// This block only runs when NOT on Vercel (i.e., for local development)
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`[roadmap] Server listening on http://localhost:${port}`);
  });
}

// --- Vercel Export ---
// This is what Vercel uses to create the serverless function
export default app;
