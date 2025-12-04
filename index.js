// index.js
import express from "express";
import YahooFinance from "yahoo-finance2";

const app = express();
const PORT = 3000;

// Serve static frontend
app.use(express.static("public"));

// CORS (for testing, optional if frontend served via same server)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Endpoint to fetch price
app.get("/api/price/:ticker", async (req, res) => {
  const { ticker } = req.params;
  try {
    const yahoo = new YahooFinance();
    const quote = await yahoo.quote(ticker);
    // Send only the price
    res.json({ price: quote.regularMarketPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Yahoo price" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
