/**
 * Lightweight JSON file-based database — no native modules required.
 * Persistence via atomic-style writes to a JSON file.
 */

import * as fs from "fs";
import * as path from "path";

interface DBSchema {
  orders: Order[];
  decisions: Decision[];
  nextOrderId: number;
  nextDecisionId: number;
}

export interface Order {
  id: number;
  owner: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  target_price: string;
  is_buy: number; // 0 or 1
  status: number; // 0=OPEN, 1=FILLED, 2=CANCELLED
  created_at: number;
  filled_at: number;
  fill_price: string;
  strategy_text: string;
  pair: string;
}

export interface Decision {
  id: number;
  timestamp: number;
  pair: string;
  order_id: string;
  action: string;
  reasoning: string;
  tx_hash: string | null;
  success: number; // 0 or 1
  price: number;
}

const DB_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "agent.json");

let _db: DBSchema | null = null;

function load(): DBSchema {
  if (_db) return _db;
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const empty: DBSchema = { orders: [], decisions: [], nextOrderId: 1000, nextDecisionId: 1 };
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    _db = empty;
    return _db;
  }
  _db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")) as DBSchema;
  return _db;
}

function save() {
  if (!_db) return;
  fs.writeFileSync(DB_PATH, JSON.stringify(_db, null, 2));
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function insertOrder(o: Omit<Order, "id">): number {
  const db = load();
  const id = db.nextOrderId++;
  db.orders.push({ ...o, id });
  save();
  return id;
}

export function getOrdersByOwner(owner: string): Order[] {
  return load().orders.filter((o) => o.owner.toLowerCase() === owner.toLowerCase())
    .sort((a, b) => b.created_at - a.created_at);
}

export function getAllOrders(): Order[] {
  return [...load().orders].sort((a, b) => b.created_at - a.created_at);
}

export function getOpenOrders(): Order[] {
  return load().orders.filter((o) => o.status === 0);
}

export function updateOrderStatus(id: number, status: number, filledAt = 0, fillPrice = "0") {
  const db = load();
  const order = db.orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    if (status === 1) {
      order.filled_at = filledAt;
      order.fill_price = fillPrice;
    }
    save();
  }
}

export function cancelOrder(id: number, owner: string): boolean {
  const db = load();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return false;
  if (order.owner.toLowerCase() !== owner.toLowerCase()) return false;
  if (order.status !== 0) return false;
  order.status = 2;
  save();
  return true;
}

// ─── Decisions ────────────────────────────────────────────────────────────────

export function insertDecision(d: Omit<Decision, "id">): number {
  const db = load();
  const id = db.nextDecisionId++;
  db.decisions.push({ ...d, id });
  // Keep last 500 decisions
  if (db.decisions.length > 500) {
    db.decisions = db.decisions.slice(-500);
  }
  save();
  return id;
}

export function getRecentDecisions(limit = 50): Decision[] {
  return [...load().decisions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
