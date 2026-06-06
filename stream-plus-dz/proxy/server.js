const express = require("express");
const fetch = require("node-fetch");

const app = express();

// ⚠️ Remplace par l'URL exacte de ton site GitHub Pages
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://elyesb580.github.io/dzelmahrussaportfolio");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/fetch", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Paramètre url manquant" });

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const body = await response.text();
    res.send(body);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy sur le port ${PORT}`));
const express = require("express");
const fetch = require("node-fetch");

const app = express();

// Autorise ton frontend (GitHub Pages)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://elyesb580.github.io/dzelmahrussaportfolio");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Endpoint pour récupérer une page web (comme avant)
app.get("/fetch", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Paramètre url manquant" });
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    const body = await response.text();
    res.send(body);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

// Nouvel endpoint pour le chatbot IA (DeepSeek)
app.post("/chat", express.json(), async (req, res) => {
  const apiKey = "sk-2f20437a2ae6408a9f46e506f3bc454c";
  const userMessage = req.body.message;
  const history = req.body.history || [];

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Tu es un assistant serviable. Réponds de manière concise." },
          ...history,
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erreur de communication avec l'IA" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy opérationnel sur le port ${PORT}`));
