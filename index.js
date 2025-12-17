import express from "express";
import mongoose from "mongoose";
import YahooFinance from "yahoo-finance2";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// Models
const tradeSchema = new mongoose.Schema({
  type: { type:String, enum:["CSP","CC"], required:true },
  ticker: { type:String, uppercase:true },
  strike: Number,
  lots: Number,
  premium: Number,
  date: String,
  collateral: Number,
  createdAt: { type:Date, default:Date.now }
});
const Trade = mongoose.model("Trade", tradeSchema);

const holdingSchema = new mongoose.Schema({
  ticker: { type:String, uppercase:true },
  entry: Number,
  lots: Number,
  createdAt: { type:Date, default:Date.now }
});
const Holding = mongoose.model("Holding", holdingSchema);

// --- APIs ---

// Trades
app.get("/api/trades", async (_, res) => {
  res.json(await Trade.find().sort({ createdAt: 1 }));
});
app.post("/api/trade", async (req,res) => {
  res.json(await Trade.create(req.body));
});
app.delete("/api/trade/:id", async (req,res) => {
  await Trade.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Holdings
app.get("/api/holdings", async (_, res) => {
  res.json(await Holding.find().sort({ createdAt: 1 }));
});
app.post("/api/holding", async (req,res) => {
  res.json(await Holding.create(req.body));
});
app.delete("/api/holding/:id", async (req,res) => {
  await Holding.findByIdAndDelete(req.params.id);
  res.json({ success:true });
});

// Price
const yahoo = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
app.get("/api/price/:ticker", async (req,res) => {
  try {
    const q = await yahoo.quote(req.params.ticker);
    res.json({ price: q?.regularMarketPrice || 0 });
  } catch {
    res.json({ price: 0 });
  }
});

app.listen(PORT, () =>
  console.log(`Server running → http://localhost:${PORT}`)
);
