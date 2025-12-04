import express from "express";
import fs from "fs";
import path from "path";
import YahooFinance from "yahoo-finance2";

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join("./trades.json");

app.use(express.json());
app.use(express.static("public"));

let trades = [];

// Load trades from JSON
function loadTrades() {
  try {
    trades = JSON.parse(fs.readFileSync(DB_FILE, "utf-8") || "[]");
  } catch {
    trades = [];
  }
}

// Save trades to JSON
function saveTrades() {
  fs.writeFileSync(DB_FILE, JSON.stringify(trades, null, 2));
}

// Initialize
loadTrades();

// APIs
app.get("/api/trades", (req, res) => res.json(trades));

app.post("/api/trade", (req, res) => {
  const trade = { id: Date.now(), ...req.body, latestPL: 0 };
  trades.push(trade);
  saveTrades();
  res.json(trade);
});

app.delete("/api/trade/:id", (req, res) => {
  trades = trades.filter(t => t.id != req.params.id);
  saveTrades();
  res.json({ success: true });
});

app.post("/api/trade/pl/:id", (req, res) => {
  const t = trades.find(tr => tr.id == req.params.id);
  if (t) {
    t.latestPL = req.body.latestPL;
    saveTrades();
    res.json({ success: true });
  } else res.status(404).json({ error: "Trade not found" });
});

// Yahoo Finance
const yahooFinance = new YahooFinance();

app.get("/api/price/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker;
    const quote = await yahooFinance.quote(ticker); 
    // regularMarketPrice is directly on quote
    res.json({ price: quote.regularMarketPrice || 0 });
  } catch (err) {
    console.error("Yahoo fetch failed:", err.message);
    res.json({ price: 0 }); // return 0 if error
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
