import express from "express";
import fs from "fs";
import path from "path";
import YahooFinance from "yahoo-finance2";

const app = express();
const PORT = process.env.PORT || 3000;

const TRADES_FILE = path.join("./trades.json");
const HOLDINGS_FILE = path.join("./holdings.json");

app.use(express.json());
app.use(express.static("public"));

// ----- Load & Save Helpers -----
let trades = [];
let holdings = [];

function loadTrades() {
  try {
    trades = JSON.parse(fs.readFileSync(TRADES_FILE, "utf-8") || "[]");
  } catch {
    trades = [];
  }
}

function saveTrades() {
  fs.writeFileSync(TRADES_FILE, JSON.stringify(trades, null, 2));
}

function loadHoldings() {
  try {
    holdings = JSON.parse(fs.readFileSync(HOLDINGS_FILE, "utf-8") || "[]");
  } catch {
    holdings = [];
  }
}

function saveHoldings() {
  fs.writeFileSync(HOLDINGS_FILE, JSON.stringify(holdings, null, 2));
}

loadTrades();
loadHoldings();

// ----- Trade APIs -----
app.get("/api/trades", (req, res) => res.json(trades));

app.post("/api/trade", (req, res) => {
  const trade = { id: Date.now(), ...req.body };
  trades.push(trade);
  saveTrades();
  res.json(trade);
});

app.delete("/api/trade/:id", (req, res) => {
  trades = trades.filter(t => t.id != req.params.id);
  saveTrades();
  res.json({ success: true });
});

// ----- Holdings APIs -----
app.get("/api/holdings", (req, res) => res.json(holdings));

app.post("/api/holding", (req, res) => {
  const holding = { id: Date.now(), ...req.body };
  holdings.push(holding);
  saveHoldings();
  res.json(holding);
});

app.delete("/api/holding/:id", (req, res) => {
  holdings = holdings.filter(h => h.id != req.params.id);
  saveHoldings();
  res.json({ success: true });
});

// ----- Yahoo Finance -----
const yahooFinance = new YahooFinance();

app.get("/api/price/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker;
    const quote = await yahooFinance.quote(ticker);
    res.json({ price: quote.regularMarketPrice || 0 });
  } catch {
    res.json({ price: 0 });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
