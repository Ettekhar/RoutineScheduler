import type { Request, Response, NextFunction } from "express";
import { createServer } from "http";
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

export async function handler(req: VercelRequest, res: VercelResponse) {
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

const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isMain) {
  startServer().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
