export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversation } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: conversation,
        max_tokens: 250,
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "Sorry, I don’t have an answer.";

    res.status(200).json({ reply: answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
