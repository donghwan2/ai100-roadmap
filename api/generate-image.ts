import OpenAI from "openai";

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") {
      return resolve(req.body);
    }
    let raw = "";
    req.on("data", (chunk: any) => { raw += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = await parseBody(req);
  const { prompt } = body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not configured. Vercel 대시보드 → Settings → Environment Variables에서 OPENAI_API_KEY를 추가하고 Redeploy 하세요.",
    });
  }

  try {
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

    return res.status(500).json({ error: "OpenAI에서 이미지가 반환되지 않았습니다." });
  } catch (error: any) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: error.message || "이미지 생성에 실패했습니다." });
  }
}
