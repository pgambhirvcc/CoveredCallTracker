import express from "express";
import mongoose from "mongoose";
import YahooFinance from "yahoo-finance2";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------- Middleware -----------------
app.use(express.json());
app.use(express.static("public"));

// ----------------- MongoDB -----------------
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// ----------------- Models -----------------
const tradeSchema = new mongoose.Schema({
  type: { type: String, enum: ["CSP", "CC"], required: true },
  ticker: { type: String, uppercase: true, required: true },
  strike: Number,
  lots: Number,
  premium: Number,
  date: String,
  collateral: Number,
  createdAt: { type: Date, default: Date.now }
});

const holdingSchema = new mongoose.Schema({
  ticker: { type: String, uppercase: true, required: true },
  entry: Number,
  lots: Number,
  createdAt: { type: Date, default: Date.now }
});

const Trade = mongoose.model("Trade", tradeSchema);
const Holding = mongoose.model("Holding", holdingSchema);

// ----------------- Trade APIs -----------------
app.get("/api/trades", async (req, res) => {
  const trades = await Trade.find().sort({ createdAt: -1 });
  res.json(trades);
});

app.post("/api/trade", async (req, res) => {
  const trade = await Trade.create(req.body);
  res.json(trade);
});

app.delete("/api/trade/:id", async (req, res) => {
  await Trade.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ----------------- Holdings APIs -----------------
app.get("/api/holdings", async (req, res) => {
  const holdings = await Holding.find().sort({ createdAt: -1 });
  res.json(holdings);
});

app.post("/api/holding", async (req, res) => {
  const holding = await Holding.create(req.body);
  res.json(holding);
});

app.delete("/api/holding/:id", async (req, res) => {
  await Holding.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ----------------- Yahoo Finance -----------------
const yahooFinance = new YahooFinance();

app.get("/api/price/:ticker", async (req, res) => {
  try {
    const quote = await yahooFinance.quote(req.params.ticker);
    res.json({ price: quote.regularMarketPrice || 0 });
  } catch {
    res.json({ price: 0 });
  }
});

// ----------------- Start Server -----------------
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
