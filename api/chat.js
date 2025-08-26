import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Spirit Assistant, a helpful guide for United Spirits visitors." },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("OpenAI API Error:", data);
      return res.status(500).json({ reply: "⚠️ No response from API" });
    }

    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ reply: "⚠️ Server error" });
  }
}
