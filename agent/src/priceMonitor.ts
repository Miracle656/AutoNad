import { EventEmitter } from "events";

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
  change24h: number;
}

export interface PriceUpdate {
  pair: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  timestamp: number;
  history: PricePoint[];
}

// Random walk with trend and mean reversion
function simulatePrice(
  currentPrice: number,
  basePrice: number,
  volatility = 0.002,
  meanReversionStrength = 0.01
): number {
  const drift = (basePrice - currentPrice) * meanReversionStrength;
  const shock = (Math.random() - 0.5) * 2 * volatility * currentPrice;
  // Occasional momentum burst
  const momentum = Math.random() < 0.05 ? (Math.random() - 0.5) * 0.01 * currentPrice : 0;
  return Math.max(0.01, currentPrice + drift + shock + momentum);
}

export class PriceMonitor extends EventEmitter {
  private prices: Map<string, number> = new Map();
  private history: Map<string, PricePoint[]> = new Map();
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();

  private readonly BASE_PRICES: Record<string, number> = {
    "MON/USDC": 42.0,
    "WETH/USDC": 3250.0,
    "WBTC/USDC": 68000.0,
  };

  constructor() {
    super();
    // Init starting prices
    for (const [pair, base] of Object.entries(this.BASE_PRICES)) {
      this.prices.set(pair, base + (Math.random() - 0.5) * base * 0.05);
      this.history.set(pair, []);
    }
  }

  start(intervalMs = 5000) {
    console.log(`[PriceMonitor] Starting price feeds (${intervalMs}ms interval)`);
    for (const pair of Object.keys(this.BASE_PRICES)) {
      const timer = setInterval(() => this._tick(pair), intervalMs);
      this.timers.set(pair, timer);
      // Emit initial price immediately
      setTimeout(() => this._tick(pair), 100);
    }
  }

  stop() {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    console.log("[PriceMonitor] Stopped");
  }

  getPrice(pair: string): number | undefined {
    return this.prices.get(pair);
  }

  getAllPrices(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [pair, price] of this.prices.entries()) {
      result[pair] = price;
    }
    return result;
  }

  getHistory(pair: string, limit = 100): PricePoint[] {
    const h = this.history.get(pair) || [];
    return h.slice(-limit);
  }

  private _tick(pair: string) {
    const previous = this.prices.get(pair) || this.BASE_PRICES[pair];
    const base = this.BASE_PRICES[pair];
    const next = simulatePrice(previous, base);

    this.prices.set(pair, next);

    // Track history (keep last 500 points)
    const hist = this.history.get(pair) || [];
    const now = Date.now();

    // Compute 24h change from oldest available point
    const oldest = hist.length > 0 ? hist[0] : null;
    const change24h = oldest ? ((next - oldest.price) / oldest.price) * 100 : 0;

    hist.push({
      timestamp: now,
      price: next,
      volume: Math.random() * 10000 + 1000,
      change24h,
    });
    if (hist.length > 500) hist.shift();
    this.history.set(pair, hist);

    const update: PriceUpdate = {
      pair,
      price: next,
      previousPrice: previous,
      change: next - previous,
      changePercent: ((next - previous) / previous) * 100,
      timestamp: now,
      history: hist.slice(-60),
    };

    this.emit("price", update);
    this.emit(`price:${pair}`, update);
  }
}
