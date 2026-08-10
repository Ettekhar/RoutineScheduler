import express from "express";
import { createApp } from "../server/app.js";

let appPromise;

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = createApp();
  }

  const app = await appPromise;
  return new Promise((resolve) => {
    app(req, res, () => {
      if (!res.writableEnded) {
        res.status(404).send("Not Found");
      }
      resolve();
    });
  });
}
