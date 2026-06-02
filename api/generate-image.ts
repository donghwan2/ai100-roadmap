export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
    const { prompt } = body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "medium" as any,
      n: 1,
    });

    const b64Json = response.data[0].b64_json;
    const url = response.data[0].url;

    if (b64Json) {
      return res.json({ image: `data:image/png;base64,${b64Json}` });
    }
    if (url) {
      return res.json({ image: url });
    }

    return res.status(500).json({ error: "No image returned from OpenAI" });
  } catch (error: any) {
    console.error("generate-image error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate image" });
  }
}
