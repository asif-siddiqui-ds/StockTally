const OpenAI = require("openai");

module.exports = async ({ req, res, log, error }) => {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    const { imageBase64, mimeType = "image/jpeg", mode = "product" } = body;

    if (!imageBase64) {
      return res.json({
        success: false,
        message: "Missing imageBase64",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: false,
        message: "Missing OPENAI_API_KEY variable",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt =
      mode === "invoice"
        ? `Extract stock/product items from this invoice image. Return ONLY JSON:
{
  "items": [
    {
      "name": "Product name",
      "category": "General",
      "quantity": 1,
      "unit": "pcs",
      "barcode": "",
      "costPrice": 0
    }
  ]
}`
        : `Identify the product in this image. Return ONLY JSON:
{
  "items": [
    {
      "name": "Product name",
      "category": "General",
      "quantity": 1,
      "unit": "pcs",
      "barcode": "",
      "costPrice": 0
    }
  ]
}`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const text = aiResponse.choices?.[0]?.message?.content || "";

    log("AI output: " + text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.json({
        success: false,
        message: "AI returned invalid JSON",
        raw: text,
      });
    }

    return res.json({
      success: true,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    });
  } catch (err) {
    error(err.message);

    return res.json({
      success: false,
      message: err.message || "Function failed",
    });
  }
};