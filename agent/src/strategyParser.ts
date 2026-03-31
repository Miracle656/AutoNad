import Anthropic from "@anthropic-ai/sdk";

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

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an on-chain trading strategy parser for AutoNad, a DeFi portfolio manager on Monad.

Your job: parse a plain English trading strategy into a precise JSON object.

Rules:
- Output ONLY valid JSON. No prose, no markdown, no explanation.
- Use the exact schema below.
- If a value is not specified, omit the field (don't use null).
- All prices are in USD.
- All amounts are in token units (not USD).
- For DCA, frequency must be one of: "hourly", "daily", "weekly", "monthly".
- Token must be one of: "MON", "USDC", "WETH", "WBTC" (default to "MON" if unclear).

Output schema:
{
  "action": "BUY" | "SELL" | "DCA",
  "token": string,
  "amount": number,
  "targetPrice": number,
  "stopLoss": number (optional),
  "takeProfit": number (optional),
  "frequency": string (optional, only for DCA),
  "reasoning": string (one sentence explaining the trade logic)
}

Examples:

Input: "buy 100 MON when the price drops to $38"
Output: {"action":"BUY","token":"MON","amount":100,"targetPrice":38,"reasoning":"Buy limit order triggered when MON price reaches $38."}

Input: "DCA $50 into MON every week"
Output: {"action":"DCA","token":"MON","amount":50,"targetPrice":42,"frequency":"weekly","reasoning":"Weekly dollar-cost averaging into MON at current market price."}

Input: "sell half my MON when it hits $60, stop loss at $35"
Output: {"action":"SELL","token":"MON","amount":50,"targetPrice":60,"stopLoss":35,"reasoning":"Take profit at $60 with downside protection at $35 stop loss."}

Input: "buy the dip, 10% below current price"
Output: {"action":"BUY","token":"MON","amount":100,"targetPrice":37.8,"reasoning":"Buy limit order 10% below current MON price as a dip-buying strategy."}`;

export async function parseStrategy(strategyText: string): Promise<ParsedStrategy> {
  console.log(`[StrategyParser] Parsing: "${strategyText}"`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: strategyText,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Strip potential markdown code blocks
  let jsonText = content.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonText) as ParsedStrategy;

  // Validate required fields
  if (!parsed.action || !parsed.token || !parsed.amount || !parsed.targetPrice) {
    throw new Error("Invalid strategy response: missing required fields");
  }

  console.log(`[StrategyParser] Parsed:`, parsed);
  return parsed;
}
