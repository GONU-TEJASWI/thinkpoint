/**
 * THINKPOINT Frontend AI Service Layer
 * Connects exclusively to local backend endpoint: POST http://localhost:5000/api/ai
 */

export async function sendToThinkpointAI(payload) {
  console.log("[THINKPOINT Frontend -> POST http://localhost:5000/api/ai]", payload);

  try {
    const response = await fetch("http://localhost:5000/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`AI Backend returned HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("[THINKPOINT Frontend <- POST http://localhost:5000/api/ai]", data);

    return {
      error: data.error || false,
      hint: data.hint || data.reply || data.message || "",
      reply: data.reply || data.hint || data.message || "",
      message: data.message || data.reply || data.hint || "",
      analysis: data.analysis,
      hintTitle: data.hintTitle,
      hintText: data.hintText
    };
  } catch (err) {
    console.warn("[THINKPOINT Frontend AI Fetch Error]", err.message);
    return {
      error: true,
      message: "Unable to connect to local backend (http://localhost:5000/api/ai).",
      hint: "Unable to connect to local backend (http://localhost:5000/api/ai).",
      reply: "Unable to connect to local backend (http://localhost:5000/api/ai)."
    };
  }
}
