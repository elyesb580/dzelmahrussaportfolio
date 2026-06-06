const express = require("express");
const fetch = require("node-fetch");

const app = express();

// Autorise ton frontend GitHub Pages (remplace par l'URL exacte de ton site)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://elyesb580.github.io");
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