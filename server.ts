import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

dotenv.config();

// Simple in-memory image cache to bypass proxy payload size limits
const imageCache = new Map<string, { buffer: Buffer; mimeType: string }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Route to serve cached images
  app.get("/api/images/:id", (req, res) => {
    const id = req.params.id;
    const cached = imageCache.get(id);
    if (!cached) {
      return res.status(404).send("Image not found");
    }
    res.setHeader("Content-Type", cached.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // cache aggressively
    return res.send(cached.buffer);
  });

  // OpenAI Image Generation API Route
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      console.log("Generating image with prompt:", prompt);

      const apiKey = process.env.OPENAI_API_KEY;
      
      const openai = new OpenAI({
        apiKey: apiKey,
      });

      // Generate the image using model "gpt-image-1" with supported parameters
      // Note: "response_format" is omitted because it is not supported by this proxy
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024",
        quality: "medium" as any, // Model configuration parameter (supported: low, medium, high, auto)
        n: 1,
      });

      console.log("Full OpenAI response keys:", Object.keys(response), "data array length:", response.data?.length);
      if (response.data && response.data[0]) {
        console.log("First data object keys:", Object.keys(response.data[0]));
      }

      const b64Json = response.data[0].b64_json;
      const url = response.data[0].url;

      console.log("OpenAI Image response - b64_json length:", b64Json ? b64Json.length : "null/undefined", "url:", url || "null/undefined");

      let imageBuffer: Buffer | null = null;
      let mimeType = "image/png";

      if (b64Json) {
        imageBuffer = Buffer.from(b64Json, "base64");
      } else if (url) {
        try {
          console.log("Fetching image from CDN URL to store in local cache:", url);
          const responseFetch = await fetch(url);
          if (responseFetch.ok) {
            const arrayBuffer = await responseFetch.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
            const contentType = responseFetch.headers.get("content-type");
            if (contentType) {
              mimeType = contentType;
            }
          } else {
            console.error("Failed to fetch image from CDN URL:", responseFetch.statusText);
          }
        } catch (fetchErr) {
          console.error("Error fetching image from URL:", fetchErr);
        }
      }

      if (imageBuffer) {
        const imageId = `char-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        imageCache.set(imageId, { buffer: imageBuffer, mimeType });
        const localUrl = `/api/images/${imageId}`;
        console.log("Image cached successfully! Serving via:", localUrl);
        return res.json({ image: localUrl });
      }

      // Fallback if we cannot cache the image but have a URL
      if (url) {
        console.warn("Could not cache image, returning direct URL as fallback:", url);
        return res.json({ image: url });
      }

      return res.status(500).json({ error: "Failed to process image output from OpenAI" });
    } catch (error: any) {
      console.error("OpenAI Generation Error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate character image" });
    }
  });

  // Serve static assets & support Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
