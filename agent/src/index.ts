import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { PriceMonitor, PriceUpdate } from "./priceMonitor";
import { OrderExecutor } from "./orderExecutor";
import { parseStrategy } from "./strategyParser";

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ─── Core Services ────────────────────────────────────────────────────────────
const priceMonitor = new PriceMonitor();
const orderExecutor = new OrderExecutor(priceMonitor);

// ─── WebSocket: Real-time price + order feed ──────────────────────────────────
const wsClients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");
  wsClients.add(ws);

  // Send current prices immediately
  const prices = priceMonitor.getAllPrices();
  ws.send(JSON.stringify({ type: "prices_snapshot", data: prices }));

  ws.on("close", () => {
    wsClients.delete(ws);
    console.log("[WS] Client disconnected");
  });

  ws.on("error", () => wsClients.delete(ws));
});

function broadcast(payload: object) {
  const msg = JSON.stringify(payload);
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

// Forward price updates to WebSocket clients
priceMonitor.on("price", (update: PriceUpdate) => {
  broadcast({ type: "price_update", data: update });
});

// ─── REST Routes ──────────────────────────────────────────────────────────────

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", agentPaused: orderExecutor.isPaused() });
});

// Parse natural language strategy into order params
app.post("/api/parse-strategy", async (req, res) => {
  try {
    const { strategy } = req.body;
    if (!strategy || typeof strategy !== "string") {
      return res.status(400).json({ error: "strategy string required" });
    }

    const parsed = await parseStrategy(strategy);
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("[API] parse-strategy error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Place an order (simulated on-chain)
app.post("/api/place-order", (req, res) => {
  try {
    const { owner, tokenIn, tokenOut, amountIn, targetPrice, isBuyOrder, pair, strategyText } = req.body;

    if (!owner || !tokenIn || !tokenOut || !amountIn || !targetPrice) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    const orderId = orderExecutor.addSimulatedOrder({
      owner,
      tokenIn,
      tokenOut,
      amountIn: String(amountIn),
      targetPrice: String(targetPrice),
      isBuyOrder: !!isBuyOrder,
      pair: pair || "MON/USDC",
      strategyText,
    });

    // Log agent decision
    orderExecutor.logDecision(
      pair || "MON/USDC",
      String(orderId),
      isBuyOrder ? "PLACE_BUY" : "PLACE_SELL",
      `Order #${orderId} placed: ${isBuyOrder ? "buy" : "sell"} ${amountIn} ${tokenIn} at $${targetPrice}.`,
      parseFloat(targetPrice)
    );

    // Broadcast new order to WS clients
    broadcast({ type: "order_placed", data: { orderId, owner, targetPrice, isBuyOrder } });

    return res.json({ success: true, orderId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get orders for a wallet address
app.get("/api/orders/:address", (req, res) => {
  try {
    const { address } = req.params;
    const orders = orderExecutor.getOrdersForUser(address);
    return res.json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get all orders (admin)
app.get("/api/orders", (_, res) => {
  try {
    const orders = orderExecutor.getAllOrders();
    return res.json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Cancel an order
app.delete("/api/orders/:orderId", (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    const { owner } = req.body;
    if (!owner) return res.status(400).json({ error: "owner required" });

    const ok = orderExecutor.cancelSimulatedOrder(orderId, owner);
    if (!ok) return res.status(400).json({ error: "Cannot cancel order" });

    broadcast({ type: "order_cancelled", data: { orderId } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Recent agent activity
app.get("/api/activity", (_, res) => {
  try {
    const activity = orderExecutor.getRecentActivity(50);
    return res.json({ success: true, data: activity });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Current price for a pair
app.get("/api/price/:pair", (req, res) => {
  try {
    const pair = decodeURIComponent(req.params.pair);
    const price = priceMonitor.getPrice(pair);
    if (price === undefined) {
      return res.status(404).json({ error: `Unknown pair: ${pair}` });
    }
    const history = priceMonitor.getHistory(pair, 60);
    return res.json({ success: true, data: { pair, price, history } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// All current prices
app.get("/api/prices", (_, res) => {
  res.json({ success: true, data: priceMonitor.getAllPrices() });
});

// Agent control
app.post("/api/agent/pause", (_, res) => {
  orderExecutor.pause();
  broadcast({ type: "agent_status", data: { paused: true } });
  res.json({ success: true, paused: true });
});

app.post("/api/agent/resume", (_, res) => {
  orderExecutor.resume();
  broadcast({ type: "agent_status", data: { paused: false } });
  res.json({ success: true, paused: false });
});

app.get("/api/agent/status", (_, res) => {
  res.json({
    success: true,
    data: {
      paused: orderExecutor.isPaused(),
      agentAddress: (() => {
        try {
          const { ethers } = require("ethers");
          const pk = process.env.AGENT_PRIVATE_KEY;
          if (!pk || pk === "your_agent_wallet_private_key") return "0x0000...0000";
          return new ethers.Wallet(pk).address;
        } catch {
          return "0x0000...0000";
        }
      })(),
    },
  });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
priceMonitor.start(5000);
orderExecutor.start();

httpServer.listen(PORT, () => {
  console.log("╔══════════════════════════════════════╗");
  console.log("║    AutoNad Agent Server — ONLINE     ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`  REST API:  http://localhost:${PORT}`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`  Agent:     ${orderExecutor.isPaused() ? "PAUSED" : "ACTIVE"}`);
  console.log("");
});
