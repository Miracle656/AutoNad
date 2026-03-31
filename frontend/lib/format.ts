// Number & address formatting utilities

export function formatPrice(price: number, decimals = 4): string {
  if (price === 0) return "$0.00";
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toFixed(decimals)}`;
}

export function formatAmount(amount: string | number, token = ""): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "—";
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 4 })}${token ? ` ${token}` : ""}`;
}

export function formatAddress(addr: string, chars = 6): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-4)}`;
}

export function formatTimestamp(ts: number): string {
  // Handle both seconds and milliseconds
  const ms = ts > 1e12 ? ts : ts * 1000;
  const d = new Date(ms);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatTimeAgo(ts: number): string {
  const ms = ts > 1e12 ? ts : ts * 1000;
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatPnL(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function orderStatusLabel(status: number): string {
  switch (status) {
    case 0: return "OPEN";
    case 1: return "FILLED";
    case 2: return "CANCELLED";
    default: return "UNKNOWN";
  }
}

export function orderStatusClass(status: number): string {
  switch (status) {
    case 0: return "badge-open";
    case 1: return "badge-filled";
    case 2: return "badge-cancelled";
    default: return "badge-cancelled";
  }
}

export function explorerTxUrl(txHash: string): string {
  return `https://testnet.monadexplorer.com/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://testnet.monadexplorer.com/address/${address}`;
}
