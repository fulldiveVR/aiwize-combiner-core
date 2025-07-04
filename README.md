# aiwize-combiner-core

A minimal **TypeScript/JavaScript SDK** for interacting with the *AIWIZE Combiner* service from **browser** and **Node.js** environments.

The API surface is intentionally small and **LLM-friendly** – method names, option keys and payload shapes are kept simple and explicit so that large-language models can generate correct code with high confidence. Human readability is a close second goal.

---

## 1. Installation

```bash
# npm
npm add aiwize-combiner-core
# or
yarn add aiwize-combiner-core
# or
pnpm add aiwize-combiner-core
```

The package ships as transpiled **CommonJS** with bundled type-declarations, so it works out-of-the-box in both ESM and CJS projects.

---

## 2. Quick start

```ts
import {
  BrowserBackend,
  CombinerRestClient,
  CombinerWebSocketClient,
  // convenient React-style helper (optional)
  useBackend,
} from "aiwize-combiner-core";

// ➊ Access the browser extension bridge (browser-only)
const backend = useBackend();            // or: new BrowserBackend();
backend.openLink("https://aiwize.com"); // native call – no await needed

// ➋ Interact with the Combiner REST API (browser + Node)
const rest = new CombinerRestClient({
  moduleId: "my-awesome-module",
  // baseUrl defaults to http://localhost:22003 – override if necessary
});
const rootFiles = await rest.listDir("/");

// ➌ Subscribe to the Combiner event bus via WebSocket
const ws = new CombinerWebSocketClient({ moduleId: "my-awesome-module" });
ws.on("json", (msg) => console.log("Incoming", msg));
await ws.connect();
ws.send({ type: "hello", payload: "world" });
```

---

## 3. API reference

### 3.1 `class BrowserBackend`

A very thin wrapper around the **AIWIZE browser extension**. All calls are forwarded via `window.chrome.send`. Works in Chrome-based browsers that have the extension installed.

| method | signature | description |
| ------ | --------- | ----------- |
| `openLink` | `openLink(url: string): void` | Open a new tab with the provided URL. |
| `getPageContent` | `getPageContent(): Promise<string>` | Resolve to **full HTML source** of the current page. |
| `getPageInfo` | `getPageInfo(): Promise<[link: string, title: string]>` | Resolve to the current page **URL** and **`<title>`**. |
| `getPageScreenshots` | `getPageScreenshots(): Promise<string[]>` | Resolve to an **array of base-64 PNG screenshots** capturing the visible area. |

Helper: `useBackend(): BrowserBackend` simply returns `new BrowserBackend()` – handy for dependency injection or React hooks.

---

### 3.2 `class CombinerRestClient`

Lightweight wrapper around the **Combiner** HTTP API (filesystem + document DB). Automatically sets `X-Module-Id` header and handles JSON/text responses & errors.

#### 3.2.1 Constructor

```ts
new CombinerRestClient(options: {
  /** Combiner base URL (default: "http://localhost:22003") */
  baseUrl?: string;
  /** Unique identifier of your module – *required* */
  moduleId: string;
  /** Extra headers to send with every request */
  defaultHeaders?: Record<string, string>;
});
```

#### 3.2.2 Filesystem endpoints

| method | signature | server route |
| ------ | --------- | ------------ |
| `listDir` | `listDir(dirPath = "."): Promise<any>` | `GET /api/fs/list?path=…` |
| `readFile` | `readFile(filePath, encoding="utf-8"): Promise<any>` | `POST /api/fs/read` |
| `writeFile` | `writeFile(filePath, content, encoding="utf-8"): Promise<any>` | `POST /api/fs/write` |

#### 3.2.3 Database endpoints

| method | signature | server route |
| ------ | --------- | ------------ |
| `dbCreate` | `dbCreate(collection, payload): Promise<any>` | `POST /api/db/:module/:collection` |
| `dbList` | `dbList(collection, filter?): Promise<any[]>` | `GET /api/db/:module/:collection?filter=…` |
| `dbRead` | `dbRead(collection, id): Promise<any>` | `GET /api/db/:module/:collection/:id` |
| `dbUpdate` | `dbUpdate(collection, id, update): Promise<any>` | `PUT /api/db/:module/:collection/:id` |
| `dbDelete` | `dbDelete(collection, id): Promise<any>` | `DELETE /api/db/:module/:collection/:id` |

All helpers throw a rich `Error` containing `status` *(number)* and `payload` *(JSON | string)* when the server responds with a non-2xx status code.

---

### 3.3 `class CombinerWebSocketClient`

Bi-directional communication with the Combiner *event bus*. Features automatic JSON parsing, reconnect with exponential back-off and a dead-simple event emitter.

#### 3.3.1 Constructor

```ts
new CombinerWebSocketClient(options: {
  /** Combiner base URL (default: "http://localhost:22003") */
  baseUrl?: string;
  /** Path of the WS endpoint (default: "/ws") */
  path?: string;
  /** Identifier of your module – *required* */
  moduleId: string;
  /** Optional panel identifier ("left" | "right" | any) */
  panel?: string;
  /** Reconnect automatically? (default: true) */
  autoReconnect?: boolean;
  /** Max reconnection attempts (default: Infinity) */
  maxReconnectAttempts?: number;
  /** Initial back-off in ms (default: 1000) */
  reconnectBackoffMs?: number;
  /** Cap for back-off in ms (default: 30000) */
  maxReconnectBackoffMs?: number;
});
```

#### 3.3.2 Methods & properties

| member | description |
| ------ | ----------- |
| `connect(): Promise<void>` | Establish the connection; resolves when `readyState === OPEN`. |
| `send(data: any): void` | Send string / binary / JSON (*objects are automatically `JSON.stringify`-ed*). Queues messages until connected.
| `disconnect(code = 1000, reason = ""): void` | Graceful close (disables auto-reconnect).
| `readyState: number | null` | Raw [`WebSocket.readyState`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState).

#### 3.3.3 Events

```ts
ws.on("open", () => { /* socket is ready */ });
ws.on("close", (ev) => { /* socket closed */ });
ws.on("error", (err) => { /* network / protocol error */ });
ws.on("message", (raw) => { /* every incoming frame (string | ArrayBuffer) */ });
ws.on("json", (obj) => { /* auto-parsed JSON helper */ });
ws.on("connection_established", (meta) => { /* server handshake */ });
ws.on("reconnecting", (attempt: number, delayMs: number) => { /* back-off info */ });
```

---

## 4. TypeScript support

The library is authored in TypeScript and publishes **`.d.ts`** declarations, so you get full intellisense and static checking without extra setup.

---

## 5. License

MIT © AIWIZE
