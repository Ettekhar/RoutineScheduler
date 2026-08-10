import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use("/api/assets", express.static(path.join(distPath, "assets"), { index: false }));
  app.use(express.static(distPath));

  // fall through to index.html for app routes only
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/assets/")) {
      return res.status(404).send("Not Found");
    }
    return res.sendFile(path.resolve(distPath, "index.html"));
  });
}
