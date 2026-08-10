import type { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { createApp } from "./app";
import { serveStatic } from "./static";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pathToFileURL } from "url";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

function sendAsset(req: VercelRequest, res: VercelResponse): boolean {
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  if (!pathname.startsWith("/api/assets/")) {
    return false;
  }

  const relativePath = pathname.replace(/^\/api\/assets\//, "");
  const assetPath = path.resolve(path.join(process.cwd(), "dist", "public", relativePath));
  const publicRoot = path.resolve(process.cwd(), "dist", "public");

  if (!assetPath.startsWith(publicRoot) || !fs.existsSync(assetPath)) {
    res.status(404).send("Not Found");
    return true;
  }

  const extension = path.extname(assetPath).toLowerCase();
  const contentType =
    extension === ".js"
      ? "application/javascript; charset=utf-8"
      : extension === ".css"
        ? "text/css; charset=utf-8"
        : extension === ".json"
          ? "application/json; charset=utf-8"
          : extension === ".svg"
            ? "image/svg+xml"
            : "application/octet-stream";

  res.setHeader("Content-Type", contentType);
  res.sendFile(assetPath);
  return true;
}

export async function handler(req: VercelRequest, res: VercelResponse) {
  if (sendAsset(req, res)) {
    return;
  }

  const app = await createApp();
  return new Promise<void>((resolve) => {
    app(req as any, res as any, () => {
      if (!res.writableEnded) {
        res.status(404).send("Not Found");
      }
      resolve();
    });
  });
}

async function startServer() {
  const app = await createApp();
  const httpServer = createServer(app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "127.0.0.1",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
}

const isMain =
  typeof __filename !== "undefined" &&
  !!process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMain) {
  startServer().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
