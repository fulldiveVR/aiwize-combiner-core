// CombinerWebSocketClient – lightweight wrapper around the Combiner Service WS bus
// Author: AI assistant (generated)

/* eslint-disable @typescript-eslint/no-explicit-any */

import WS from "isomorphic-ws";

export type CombinerClientEvent =
  | "open"
  | "close"
  | "error"
  | "message"
  | "json"
  | "reconnecting"
  | "connection_established";

export interface CombinerWebSocketClientOptions {
  baseUrl?: string;
  /** Path where the WebSocket server is mounted. Defaults to "/ws". */
  path?: string;
  /** Unique module identifier – required. */
  moduleId: string;
  /** Optional panel identifier ("left" | "right" | any string). */
  panel?: string;
  /** Enable automatic reconnect (default: true) */
  autoReconnect?: boolean;
  /** Maximum reconnection attempts (default: Infinity) */
  maxReconnectAttempts?: number;
  /** Initial reconnect delay in ms (default: 1000) */
  reconnectBackoffMs?: number;
  /** Maximum delay for exponential back-off in ms (default: 30000) */
  maxReconnectBackoffMs?: number;
}

/** Simple event emitter (browser + node) */
class TinyEmitter {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  on<T extends any[]>(event: string, handler: (...args: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    // @ts-ignore
    this.listeners.get(event)!.add(handler);
  }

  off<T extends any[]>(event: string, handler: (...args: T) => void): void {
    this.listeners.get(event)?.delete(handler as any);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((h) => {
      try {
        h(...args);
      } catch (err) {
        console.error("[CombinerWSClient] listener error", err);
      }
    });
  }
}

export class CombinerWebSocketClient extends TinyEmitter {
  private ws: WS | null = null;
  private reconnectAttempts = 0;
  private manualClose = false;
  private queue: (WS.Data | string)[] = [];
  private opts: Required<CombinerWebSocketClientOptions>;

  constructor(options: CombinerWebSocketClientOptions) {
    super();

    this.opts = {
      baseUrl: options.baseUrl ?? this.getDefaultBaseUrl(),
      path: options.path ?? "/ws",
      moduleId: options.moduleId,
      panel: options.panel ?? "unknown",
      autoReconnect: options.autoReconnect !== false,
      maxReconnectAttempts:
        options.maxReconnectAttempts === undefined
          ? Infinity
          : options.maxReconnectAttempts,
      reconnectBackoffMs: options.reconnectBackoffMs ?? 1000,
      maxReconnectBackoffMs: options.maxReconnectBackoffMs ?? 30000,
    } as Required<CombinerWebSocketClientOptions>;
  }

  /** Establish the WebSocket connection. Resolves when the socket is OPEN. */
  connect(): Promise<void> {
    if (this.ws && (this.ws.readyState === WS.OPEN || this.ws.readyState === WS.CONNECTING)) {
      return Promise.resolve();
    }

    const wsUrl = this.buildWsUrl();
    this.manualClose = false;

    return new Promise<void>((resolve, reject) => {
      const socket = new WS(wsUrl);
      this.ws = socket;

      socket.addEventListener("open", () => {
        this.reconnectAttempts = 0;
        this.flushQueue();
        this.emit("open");
        resolve();
      });

      socket.addEventListener("message", (ev: WS.MessageEvent) => {
        const data = (ev as any).data ?? ev; // in node data is param itself
        this.emit("message", data);
        // try JSON parse
        try {
          const json = JSON.parse(data.toString());
          if (json?.type === "connection_established") {
            this.emit("connection_established", json);
          }
          this.emit("json", json);
        } catch {
          /* non-JSON or parse error – ignore */
        }
      });

      socket.addEventListener("close", (ev: WS.CloseEvent) => {
        this.emit("close", ev);
        this.ws = null;
        if (!this.manualClose && this.opts.autoReconnect) {
          this.scheduleReconnect();
        }
      });

      socket.addEventListener("error", (err) => {
        this.emit("error", err);
      });
    });
  }

  /** Send a message. Objects are automatically JSON.stringify-ed. */
  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WS.OPEN) {
      // queue until connected
      this.queue.push(this.preparePayload(data));
      return;
    }
    this.ws.send(this.preparePayload(data));
  }

  disconnect(code = 1000, reason = ""): void {
    this.manualClose = true;
    if (this.ws && this.ws.readyState === WS.OPEN) {
      this.ws.close(code, reason);
    }
  }

  get readyState(): number | null {
    return this.ws?.readyState ?? null;
  }

  /* —————————————————————————— private helpers —————————————————————————— */

  private preparePayload(input: any): WS.Data | string {
    if (typeof input === "string" || input instanceof ArrayBuffer) {
      return input;
    }
    try {
      return JSON.stringify(input);
    } catch {
      console.warn("[CombinerWSClient] Falling back to toString() for payload");
      return String(input);
    }
  }

  private flushQueue() {
    if (!this.ws || this.ws.readyState !== WS.OPEN) return;
    this.queue.forEach((p) => this.ws!.send(p));
    this.queue = [];
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.opts.maxReconnectAttempts) {
      return;
    }
    this.reconnectAttempts += 1;
    const delay = Math.min(
      this.opts.reconnectBackoffMs * 2 ** (this.reconnectAttempts - 1),
      this.opts.maxReconnectBackoffMs
    );
    this.emit("reconnecting", this.reconnectAttempts, delay);

    setTimeout(() => {
      this.connect().catch(() => {/* swallow */});
    }, delay);
  }

  private buildWsUrl(): string {
    const httpUrl = new URL(this.opts.baseUrl);
    const proto = httpUrl.protocol === "https:" ? "wss:" : "ws:";
    const url = new URL(`${proto}//${httpUrl.host}${this.opts.path}`);
    url.searchParams.set("moduleId", this.opts.moduleId);
    if (this.opts.panel) {
      url.searchParams.set("panel", this.opts.panel);
    }
    return url.toString();
  }

  private getDefaultBaseUrl(): string {
    return "http://localhost:22003";
  }
} 