import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const mod = await import("../dist/index.cjs");
  const serverHandler = (mod as { handler?: (req: VercelRequest, res: VercelResponse) => Promise<unknown> }).handler;

  if (typeof serverHandler !== "function") {
    throw new Error("The built server entrypoint did not export a handler");
  }

  return serverHandler(req, res);
}
