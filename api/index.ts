import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server/app";

const appPromise = createApp();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await appPromise;
  return new Promise<void>((resolve) => {
    app(req, res, () => {
      if (!res.writableEnded) {
        res.status(404).send("Not Found");
      }
      resolve();
    });
  });
}