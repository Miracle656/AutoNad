# AutoNad — AI-Powered Portfolio Manager on Monad

> **AutoNad** is a full-stack DeFi application that lets you describe your trading strategy in plain English. An AI agent (powered by Claude) parses your intent, places on-chain limit orders on the **Monad** blockchain, and auto-executes them when price conditions are met.

![Demo](https://placehold.co/800x400/0E091C/6E54FF?text=AutoNad+Demo+GIF)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AutoNad System                           │
│                                                                 │
│  ┌──────────────┐    REST/WS    ┌──────────────────────────┐   │
│  │  Next.js 14  │◄─────────────►│   Agent Server (Node.js) │   │
│  │  Frontend    │               │                          │   │
│  │  (port 3000) │               │  ┌─────────────────────┐ │   │
│  └──────────────┘               │  │  priceMonitor.ts    │ │   │
│                                 │  │  (5s price ticks)   │ │   │
│  ┌──────────────────────────┐   │  ├─────────────────────┤ │   │
│  │   Monad Testnet          │   │  │  orderExecutor.ts   │ │   │
│  │   (chainId: 10143)       │   │  │  (SQLite + ethers)  │ │   │
│  │                          │   │  ├─────────────────────┤ │   │
│  │  ┌──────────────────┐    │◄──┤  │  strategyParser.ts  │ │   │
│  │  │ LimitOrderBook   │    │   │  │  (Claude API)       │ │   │
│  │  │ .sol             │    │   │  └─────────────────────┘ │   │
│  │  ├──────────────────┤    │   │         (port 3001)      │   │
│  │  │ AgentVault.sol   │    │   └──────────────────────────┘   │
│  │  ├──────────────────┤    │                                  │
│  │  │ MockPriceFeed    │    │   ┌──────────────────────────┐   │
│  │  │ .sol             │    │   │  Anthropic Claude API    │   │
│  │  └──────────────────┘    │   │  (Strategy Parsing)      │   │
│  └──────────────────────────┘   └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Monad Testnet (chainId: 10143) |
| Smart Contracts | Solidity 0.8.24, Hardhat, OpenZeppelin 5.x |
| AI Agent | Node.js, TypeScript, Express, WebSocket |
| AI Model | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Price Data | Simulated random walk (testnet mock) |
| Storage | SQLite (better-sqlite3) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Wallet | wagmi v2, RainbowKit, viem |
| Charts | Recharts |

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm 9+
- A Monad testnet wallet with some MON for gas
- An Anthropic API key ([get one here](https://console.anthropic.com))

### 1. Clone and install

```bash
git clone <repo>
cd autonад
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
AGENT_PRIVATE_KEY=0x<your_agent_wallet_private_key>
ANTHROPIC_API_KEY=sk-ant-<your_key>
NEXT_PUBLIC_CHAIN_ID=10143
```

### 3. Compile & deploy contracts

```bash
# Compile
npm run compile

# Deploy to Monad testnet
npm run deploy
```

This outputs `contracts/deployments.json` and auto-fills `.env` with contract addresses.

### 4. Start the AI agent server

```bash
npm run agent
# or in watch mode:
npm run agent:dev
```

Agent server starts on `http://localhost:3001`

### 5. Start the frontend

```bash
npm run dev
```

Frontend starts on `http://localhost:3000`

---

## How to Use

1. **Connect Wallet** — Click "Connect Wallet" in the sidebar. Select Monad Testnet.

2. **Set a Strategy** — Click "Set Strategy" on the dashboard. Type something like:
   - `"Buy 100 MON when price drops to $38"`
   - `"DCA $50 weekly into MON"`
   - `"Sell half at +30% profit, stop loss at $35"`

3. **AI Parses** — Claude extracts structured order parameters and shows them for confirmation.

4. **Confirm** — Review the parsed parameters and confirm. The order is placed on-chain.

5. **Watch the Agent** — The agent monitors prices every 5 seconds. When your price condition is met, it auto-executes the order and logs the reasoning.

6. **Track Everything** — View open orders on `/orders`, agent decisions on `/agent`, and portfolio on `/portfolio`.

---

## Key Files

```
autonад/
├── contracts/
│   ├── contracts/
│   │   ├── LimitOrderBook.sol     # On-chain limit order logic
│   │   ├── AgentVault.sol         # User vault with agent permissions
│   │   ├── interfaces/IPriceFeed.sol
│   │   └── mocks/MockPriceFeed.sol
│   ├── scripts/deploy.ts          # Deploy script → deployments.json
│   └── hardhat.config.ts          # Monad testnet config
│
├── agent/src/
│   ├── index.ts                   # Express + WebSocket server
│   ├── priceMonitor.ts            # Simulated price feeds
│   ├── orderExecutor.ts           # Order checking + execution engine
│   └── strategyParser.ts          # Claude API strategy parser
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Dashboard
│   │   ├── portfolio/page.tsx     # Token balances + vault
│   │   ├── orders/page.tsx        # Order management
│   │   └── agent/page.tsx         # Agent activity log
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── StrategyModal.tsx      # AI strategy input
│   │   └── ui/
│   │       ├── MetricCard.tsx
│   │       ├── OrderTable.tsx
│   │       ├── PriceChart.tsx
│   │       └── ActivityFeed.tsx
│   └── lib/
│       ├── api.ts                 # Agent server API client
│       ├── wagmi.ts               # Monad testnet wagmi config
│       └── format.ts              # Number/address formatters
```

---

## API Reference (Agent Server)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/parse-strategy` | Parse natural language → order params |
| POST | `/api/place-order` | Place a new limit order |
| GET | `/api/orders/:address` | Get orders for a wallet |
| DELETE | `/api/orders/:id` | Cancel an order |
| GET | `/api/activity` | Last 50 agent decisions |
| GET | `/api/price/:pair` | Current price + history |
| POST | `/api/agent/pause` | Pause order execution |
| POST | `/api/agent/resume` | Resume order execution |
| WS | `/` | Live price + order fill events |

---

## Smart Contract Addresses (Monad Testnet)

After deployment, addresses are in `contracts/deployments.json` and `.env`.

| Contract | Address |
|---|---|
| LimitOrderBook | See `deployments.json` |
| AgentVault | See `deployments.json` |
| MockPriceFeed | See `deployments.json` |

---

## Development Notes

- **Price data** is simulated via a random walk on the agent server (no real oracle on testnet needed)
- **Order execution** calls `executeOrderSimulated()` on the contract which marks the order filled and returns tokens to the owner
- **Strategy parsing** uses `claude-sonnet-4-20250514` with a strict JSON-only system prompt
- The agent logs all decisions to a local SQLite database at `data/agent.db`

---

## Built for Monad Blitz Nigeria 2026

[![Monad](https://img.shields.io/badge/Built%20on-Monad-6E54FF?style=for-the-badge)](https://monad.xyz)
[![Monad Blitz Nigeria 2026](https://img.shields.io/badge/Monad%20Blitz-Nigeria%202026-FFAE45?style=for-the-badge)](https://monad.xyz)
# AutoNad
