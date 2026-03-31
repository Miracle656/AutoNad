"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WsMessage { type: string; data: any; }

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => {
          setConnected(false);
          setTimeout(connect, 3000); // auto-reconnect
        };
        ws.onerror = () => ws.close();
        ws.onmessage = (ev) => {
          try {
            const msg: WsMessage = JSON.parse(ev.data);
            const handler = handlersRef.current.get(msg.type);
            if (handler) handler(msg.data);
            // Also call wildcard handler
            const wildcard = handlersRef.current.get("*");
            if (wildcard) wildcard(msg);
          } catch {}
        };
      } catch {}
    };

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [url]);

  const on = useCallback((type: string, handler: (data: any) => void) => {
    handlersRef.current.set(type, handler);
    return () => handlersRef.current.delete(type);
  }, []);

  const send = useCallback((msg: object) => {
    wsRef.current?.send(JSON.stringify(msg));
  }, []);

  return { connected, on, send };
}
