import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import YahooFinance from "yahoo-finance2";

const app = express();
const PORT = process.env.PORT || 3000;


// Serve static files (if any)
app.use(express.static('public'));

// Route to serve HTML
app.get("/", (req, res) => {
  res.sendFile(path.join('public', "index.html"));
});

// API to fetch stock price
app.get("/api/price/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const yahooFinance = new YahooFinance();
    const quote = await yahooFinance.quote(ticker);
    res.json({ quoteResponse: { result: [quote] } });
  } catch (err) {
    console.error("Yahoo Finance API error:", err.message);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
