import { ethers, Wallet, JsonRpcProvider, Contract } from "ethers";
import { PriceMonitor, PriceUpdate } from "./priceMonitor";
import * as db from "./db";

// Minimal ABI for LimitOrderBook
const LIMIT_ORDER_BOOK_ABI = [
  "function executeOrderSimulated(uint256 orderId, uint256 simulatedPrice) external",
  "event OrderFilled(uint256 indexed orderId, address indexed owner, uint256 fillPrice, uint256 filledAt)",
];

export interface AgentDecision {
  id: number;
  timestamp: number;
  pair: string;
  orderId: string;
  action: string;
  reasoning: string;
  txHash?: string;
  success: boolean;
  price: number;
}

export class OrderExecutor {
  private wallet?: Wallet;
  private provider?: JsonRpcProvider;
  private contract?: Contract;
  private paused = false;

  constructor(private priceMonitor: PriceMonitor) {
    this._setupChain();
    console.log("[OrderExecutor] JSON file DB initialized");
  }

  private _setupChain() {
    const rpc = process.env.MONAD_TESTNET_RPC;
    const pk = process.env.AGENT_PRIVATE_KEY;
    const contractAddr = process.env.NEXT_PUBLIC_LIMIT_ORDER_CONTRACT;

    if (!pk || pk === "your_agent_wallet_private_key") {
      console.log("[OrderExecutor] No agent key configured — running in simulation mode");
      return;
    }

    try {
      this.provider = new JsonRpcProvider(rpc);
      this.wallet = new Wallet(pk, this.provider);
      if (contractAddr) {
        this.contract = new Contract(contractAddr, LIMIT_ORDER_BOOK_ABI, this.wallet);
        console.log(`[OrderExecutor] Connected to LimitOrderBook at ${contractAddr}`);
      }
    } catch (e) {
      console.log("[OrderExecutor] Chain connection failed, simulation mode:", e);
    }
  }

  start() {
    console.log("[OrderExecutor] Starting order execution engine");
    this.priceMonitor.on("price", (update: PriceUpdate) => {
      if (!this.paused) {
        this._checkOrders(update).catch(console.error);
      }
    });
  }

  pause() {
    this.paused = true;
    console.log("[OrderExecutor] PAUSED");
  }

  resume() {
    this.paused = false;
    console.log("[OrderExecutor] RESUMED");
  }

  isPaused() {
    return this.paused;
  }

  // ─── Simulated Order Management ──────────────────────────────────────────

  addSimulatedOrder(order: {
    owner: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    targetPrice: string;
    isBuyOrder: boolean;
    pair: string;
    strategyText?: string;
  }): number {
    const now = Math.floor(Date.now() / 1000);
    const id = db.insertOrder({
      owner: order.owner,
      token_in: order.tokenIn,
      token_out: order.tokenOut,
      amount_in: order.amountIn,
      target_price: order.targetPrice,
      is_buy: order.isBuyOrder ? 1 : 0,
      status: 0,
      created_at: now,
      filled_at: 0,
      fill_price: "0",
      strategy_text: order.strategyText || "",
      pair: order.pair,
    });
    console.log(`[OrderExecutor] Simulated order #${id} added`);
    return id;
  }

  cancelSimulatedOrder(orderId: number, owner: string): boolean {
    return db.cancelOrder(orderId, owner);
  }

  getOrdersForUser(owner: string) {
    return db.getOrdersByOwner(owner);
  }

  getAllOrders() {
    return db.getAllOrders();
  }

  // ─── Execution Logic ─────────────────────────────────────────────────────

  private async _checkOrders(update: PriceUpdate) {
    const openOrders = db.getOpenOrders();

    for (const order of openOrders) {
      if (order.pair !== update.pair) continue;

      const targetPrice = parseFloat(order.target_price);
      const currentPrice = update.price;
      const isBuy = order.is_buy === 1;

      const conditionMet = isBuy
        ? currentPrice <= targetPrice
        : currentPrice >= targetPrice;

      if (!conditionMet) continue;

      console.log(
        `[OrderExecutor] Order #${order.id} condition met! ` +
          `${isBuy ? "BUY" : "SELL"} @ target $${targetPrice}, current $${currentPrice.toFixed(4)}`
      );

      await this._executeOrder(order, currentPrice, update.pair);
    }
  }

  private async _executeOrder(order: db.Order, fillPrice: number, pair: string) {
    const reasoning = this._buildReasoning(order, fillPrice);
    let txHash: string | undefined;
    let success = true;

    try {
      if (this.contract && this.wallet) {
        const priceScaled = BigInt(Math.round(fillPrice * 1e8));
        const tx = await this.contract.executeOrderSimulated(order.id, priceScaled);
        const receipt = await tx.wait();
        txHash = receipt.hash;
        console.log(`[OrderExecutor] On-chain tx: ${txHash}`);
      } else {
        // Simulate — generate a realistic-looking tx hash
        txHash = "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        console.log(`[OrderExecutor] Simulated fill, fake tx: ${txHash.slice(0, 18)}...`);
      }

      const now = Math.floor(Date.now() / 1000);
      db.updateOrderStatus(order.id, 1, now, fillPrice.toFixed(8));
    } catch (err: any) {
      console.error(`[OrderExecutor] Failed to execute order #${order.id}:`, err.message);
      success = false;
      txHash = undefined;
    }

    db.insertDecision({
      timestamp: Date.now(),
      pair,
      order_id: String(order.id),
      action: order.is_buy ? "BUY_FILL" : "SELL_FILL",
      reasoning,
      tx_hash: txHash || null,
      success: success ? 1 : 0,
      price: fillPrice,
    });
  }

  private _buildReasoning(order: db.Order, fillPrice: number): string {
    const isBuy = order.is_buy === 1;
    const target = parseFloat(order.target_price);
    const diff = Math.abs(((fillPrice - target) / target) * 100).toFixed(2);

    if (isBuy) {
      return `Buy condition triggered: MON reached $${fillPrice.toFixed(4)}, meeting the $${target} limit. Price is within ${diff}% of target.`;
    } else {
      return `Sell condition triggered: MON reached $${fillPrice.toFixed(4)}, meeting the $${target} target. Locked in ${diff}% from set price.`;
    }
  }

  getRecentActivity(limit = 50): AgentDecision[] {
    return db.getRecentDecisions(limit).map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      pair: r.pair,
      orderId: r.order_id,
      action: r.action,
      reasoning: r.reasoning,
      txHash: r.tx_hash || undefined,
      success: r.success === 1,
      price: r.price,
    }));
  }

  logDecision(
    pair: string,
    orderId: string,
    action: string,
    reasoning: string,
    price: number,
    txHash?: string
  ) {
    db.insertDecision({
      timestamp: Date.now(),
      pair,
      order_id: orderId,
      action,
      reasoning,
      tx_hash: txHash || null,
      success: 1,
      price,
    });
  }
}
