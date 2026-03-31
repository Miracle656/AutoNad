const BASE_URL = process.env.NEXT_PUBLIC_AGENT_SERVER_URL || "http://localhost:3001";

export interface ParsedStrategy {
  action: "BUY" | "SELL" | "DCA";
  token: string;
  amount: number;
  targetPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  frequency?: string;
  reasoning?: string;
}

export interface Order {
  id: number;
  owner: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  target_price: string;
  is_buy: number;
  status: number; // 0=OPEN, 1=FILLED, 2=CANCELLED
  created_at: number;
  filled_at: number;
  fill_price: string;
  strategy_text?: string;
  pair: string;
}

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

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
  change24h: number;
}

export interface PriceData {
  pair: string;
  price: number;
  history: PricePoint[];
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }

  const json = await res.json();
  return json.data || json;
}

export const api = {
  parseStrategy: (strategy: string): Promise<ParsedStrategy> =>
    request("/api/parse-strategy", {
      method: "POST",
      body: JSON.stringify({ strategy }),
    }).then((r: any) => r.data || r),

  placeOrder: (params: {
    owner: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    targetPrice: string;
    isBuyOrder: boolean;
    pair: string;
    strategyText?: string;
  }): Promise<{ orderId: number }> =>
    request("/api/place-order", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  getOrders: (address: string): Promise<Order[]> =>
    request(`/api/orders/${address}`),

  getAllOrders: (): Promise<Order[]> => request("/api/orders"),

  cancelOrder: (orderId: number, owner: string): Promise<void> =>
    request(`/api/orders/${orderId}`, {
      method: "DELETE",
      body: JSON.stringify({ owner }),
    }),

  getActivity: (): Promise<AgentDecision[]> => request("/api/activity"),

  getPrice: (pair: string): Promise<PriceData> =>
    request(`/api/price/${encodeURIComponent(pair)}`),

  getPrices: (): Promise<Record<string, number>> => request("/api/prices"),

  pauseAgent: (): Promise<void> =>
    request("/api/agent/pause", { method: "POST" }),

  resumeAgent: (): Promise<void> =>
    request("/api/agent/resume", { method: "POST" }),

  getAgentStatus: (): Promise<{ paused: boolean; agentAddress: string }> =>
    request("/api/agent/status"),

  health: (): Promise<{ status: string }> => request("/health"),
};

// WebSocket connection helper
export function createWebSocket(
  onMessage: (msg: { type: string; data: any }) => void
): WebSocket | null {
  if (typeof window === "undefined") return null;

  const wsUrl = BASE_URL.replace("http://", "ws://").replace("https://", "wss://");

  try {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[WS] Connected to AutoNad agent");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage(msg);
      } catch {
        console.error("[WS] Invalid message:", event.data);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected");
    };

    return ws;
  } catch (e) {
    console.error("[WS] Failed to connect:", e);
    return null;
  }
}
