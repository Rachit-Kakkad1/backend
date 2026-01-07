import axios from "axios";

/**
 * AI CHAT CONTROLLER
 * ------------------
 * Educational, advisory-only chatbot
 * Uses real LLM responses
 * No scanning, no execution, no persistence
 */

const AI_ENDPOINT = process.env.AI_ENDPOINT; 
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

export const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid message",
      });
    }

    /* ---------------- SYSTEM PROMPT (CRITICAL) ---------------- */
    const systemPrompt = `
You are an AI Security Assistant.

Rules:
- You provide EDUCATIONAL and DEFENSIVE security guidance only.
- You do NOT perform vulnerability scanning.
- You do NOT generate exploit code or payloads.
- You do NOT provide step-by-step attack instructions.
- You do NOT claim authoritative detection.
- You explain concepts in a professional, defensive tone.

If the user asks for anything offensive, illegal, or exploitative:
Politely refuse and redirect to secure coding education.
`;

    const userPrompt = `
User question:
${message}
`;

    const llmResponse = await axios.post(
      AI_ENDPOINT,
      {
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 600,
      },
      { timeout: 60_000 }
    );

    const reply =
      llmResponse.data?.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

    return res.json({
      success: true,
      reply,
      ethics: {
        advisoryOnly: true,
        noExecution: true,
        educational: true,
      },
    });
  } catch (err) {
    console.error("AI chat error:", err.message);
    return res.status(500).json({
      success: false,
      message: "AI service unavailable",
    });
  }
};
