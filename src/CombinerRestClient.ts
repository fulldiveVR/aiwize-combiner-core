/* CombinerRestClient – minimal wrapper around Combiner Service REST API (filesystem + db) */
/* eslint-disable @typescript-eslint/no-explicit-any */

import fetchOrig from "cross-fetch";
import { MOCK_CONTEXT } from "./mocks";

function getFetch(): typeof fetch {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch.bind(window);
  }
  // Check if we're in Node.js with global fetch (Node 18+)
  if (typeof global !== 'undefined' && 'fetch' in global) {
    return (global as any).fetch;
  }
  // Fallback to polyfill
  return fetchOrig;
}

export interface CombinerRestClientOptions {
  baseUrl?: string;
  moduleId?: string;
  defaultHeaders?: Record<string, string>;
  testMode?: boolean;
}

export class CombinerRestClient {
  private opts: Required<CombinerRestClientOptions>;
  private _fetch: typeof fetch;

  constructor(options: CombinerRestClientOptions) {
    this.opts = {
      baseUrl: options.baseUrl ?? this.getDefaultBaseUrl(),
      moduleId: options.moduleId ?? "",
      defaultHeaders: options.defaultHeaders ?? {},
      testMode: options.testMode ?? false,
    };
    this._fetch = getFetch();
  }

  async getAiwizeSessionToken(): Promise<string> {
    const url = new URL("/get-token", this.opts.baseUrl);
    const { token } = await this.getJson(url);
    return token;
  }

  /* ———————————— Filesystem API ———————————— */

  async listDir(dirPath = "."): Promise<any> {
    const url = new URL("/api/fs/list", this.opts.baseUrl);
    url.searchParams.set("path", dirPath);
    return this.getJson(url);
  }

  async readFile(filePath: string, encoding = "utf-8"): Promise<any> {
    const url = new URL("/api/fs/read", this.opts.baseUrl);
    return this.postJson(url, { path: filePath, encoding });
  }

  async writeFile(filePath: string, content: string, encoding = "utf-8"): Promise<any> {
    const url = new URL("/api/fs/write", this.opts.baseUrl);
    return this.postJson(url, { path: filePath, content, encoding });
  }

  /* ———————————— DB API ———————————— */

  async dbCreate(collection: string, payload: any): Promise<any> {
    const url = new URL(`/api/db/${encodeURIComponent(this.opts.moduleId)}/${encodeURIComponent(collection)}`, this.opts.baseUrl);
    return this.postJson(url, payload);
  }

  async dbList(collection: string, filter?: Record<string, any>): Promise<any[]> {
    const url = new URL(`/api/db/${encodeURIComponent(this.opts.moduleId)}/${encodeURIComponent(collection)}`, this.opts.baseUrl);
    if (filter && Object.keys(filter).length > 0) {
      url.searchParams.set("filter", JSON.stringify(filter));
    }
    return this.getJson(url);
  }

  async dbRead(collection: string, id: string): Promise<any> {
    const url = new URL(`/api/db/${encodeURIComponent(this.opts.moduleId)}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, this.opts.baseUrl);
    return this.getJson(url);
  }

  async dbUpdate(collection: string, id: string, update: any): Promise<any> {
    const url = new URL(`/api/db/${encodeURIComponent(this.opts.moduleId)}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, this.opts.baseUrl);
    return this.putJson(url, update);
  }

  async dbDelete(collection: string, id: string): Promise<any> {
    const url = new URL(`/api/db/${encodeURIComponent(this.opts.moduleId)}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, this.opts.baseUrl);
    return this.delete(url);
  }

  /* ———————————— Labeling API ———————————— */

  /**
   * Search context using a query and optional filters.
   * @param payload { query: string, limit?: number, categories?: any, entities?: any, tags?: any }
   */
  async searchContext(payload: any): Promise<any> {
    if (this.opts.testMode) {
      // --- Test mode logic, modeled after ContextManagerClient.searchContexts ---
      await new Promise(resolve => setTimeout(resolve, 300));
      let contexts = [...MOCK_CONTEXT];

      // Apply filters if provided
      if (payload?.query) {
        const query = payload.query.toLowerCase();
        contexts = contexts.filter(c =>
          (c.name?.toLowerCase().includes(query) ?? false) ||
          c.content.toLowerCase().includes(query) ||
          c.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }

      if (payload?.categories && payload.categories.length > 0) {
        contexts = contexts.filter(c =>
          payload.categories.some(category =>
            c.category?.toLowerCase() === category.toLowerCase()
          )
        );
      }

      if (payload?.tags && payload.tags.length > 0) {
        contexts = contexts.filter(c =>
          c.tags?.some(tag =>
            payload.tags?.some(filterTag =>
              tag.toLowerCase() === filterTag.toLowerCase()
            )
          )
        );
      }

      // Limit
      if (payload?.limit && payload.limit > 0) {
        contexts = contexts.slice(0, payload.limit);
      }

      // Map to expected response shape: { content, summary_content, url }
      const mapped = contexts.map(c => ({
        content: c.content,
        summary_content: c.content.length > 100 ? c.content.slice(0, 100) + "..." : c.content,
        url: `https://mock.local/context/${c.id}`
      }));

      return { success: true, data: mapped };
    }

    // --- Real API call ---
    const url = new URL("/api/labeling/search", this.opts.baseUrl);
    return this.postJson(url, payload);
  }

  /**
   * Process labeling request.
   * @param payload { content: string, metadata: any, userTags: any, model: string }
   */
  async processLabeling(payload: any): Promise<any> {
    const url = new URL("/api/labeling/process", this.opts.baseUrl);
    return this.postJson(url, payload);
  }

  /* ———————————— Internals ———————————— */

  private buildHeaders(extra?: Record<string, string>): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-Module-Id": this.opts.moduleId,
      ...this.opts.defaultHeaders,
      ...extra,
    };
  }

  private async getJson(url: URL): Promise<any> {
    const res = await this._fetch(url.toString(), {
      headers: this.buildHeaders(),
      credentials: "include",
    });
    return this.handleResponse(res);
  }

  private async postJson(url: URL, body: any): Promise<any> {
    const res = await this._fetch(url.toString(), {
      method: "POST",
      headers: this.buildHeaders(),
      credentials: "include",
      body: JSON.stringify(body ?? {}),
    });
    return this.handleResponse(res);
  }

  private async putJson(url: URL, body: any): Promise<any> {
    const res = await this._fetch(url.toString(), {
      method: "PUT",
      headers: this.buildHeaders(),
      credentials: "include",
      body: JSON.stringify(body ?? {}),
    });
    return this.handleResponse(res);
  }

  private async delete(url: URL): Promise<any> {
    const res = await this._fetch(url.toString(), {
      method: "DELETE",
      headers: this.buildHeaders(),
      credentials: "include",
    });
    return this.handleResponse(res);
  }

  private async handleResponse(res: Response): Promise<any> {
    if (!res.ok) {
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { /* ignore */ }
      const err: any = new Error(`HTTP ${res.status}: ${res.statusText}`);
      err.status = res.status;
      err.payload = json ?? text;
      throw err;
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return res.json();
    }
    return res.text();
  }

  private getDefaultBaseUrl(): string {
    return "http://localhost:22003";
  }
} 