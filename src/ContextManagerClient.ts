import { Context, SearchFilters, ApiResponse } from "./types";
import { MOCK_CONTEXT } from "./mocks";

import fetchOrig from "cross-fetch";

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

export interface ContextManagerClientOptions {
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
    testMode?: boolean;
}

export class ContextManagerClient {
    private opts: Required<ContextManagerClientOptions>;
    private _fetch: typeof fetch;

    constructor(options: ContextManagerClientOptions) {
        this.opts = {
            baseUrl: options.baseUrl ?? this.getDefaultBaseUrl(),
            defaultHeaders: options.defaultHeaders ?? {},
            testMode: options.testMode ?? false,
        };

        this._fetch = getFetch();
    }

    /* ———————————— Context API ———————————— */

    private async mockDelay(): Promise<void> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    async getContexts(filters?: SearchFilters): Promise<ApiResponse<Context[]>> {
        if (this.opts.testMode) {
            await this.mockDelay();
            let contexts = [...MOCK_CONTEXT];

            // Apply filters if provided
            if (filters?.query) {
                const query = filters.query.toLowerCase();
                contexts = contexts.filter(c =>
                    (c.name?.toLowerCase().includes(query) ?? false) ||
                    c.content.toLowerCase().includes(query) ||
                    c.tags?.some(tag => tag.toLowerCase().includes(query))
                );
            }

            if (filters?.category) {
                contexts = contexts.filter(c =>
                    c.category?.toLowerCase() === filters.category?.toLowerCase()
                );
            }

            if (filters?.tags && filters.tags.length > 0) {
                contexts = contexts.filter(c =>
                    c.tags?.some(tag =>
                        filters.tags?.some(filterTag =>
                            tag.toLowerCase() === filterTag.toLowerCase()
                        )
                    )
                );
            }

            // Sorting
            if (filters?.sort === 'updatedAt') {
                contexts.sort((a, b) => {
                    const dateA = new Date(a.updatedAt).getTime();
                    const dateB = new Date(b.updatedAt).getTime();
                    return (filters.order === 'asc' ? dateA - dateB : dateB - dateA);
                });
            }

            // Limit
            if (filters?.limit && filters.limit > 0) {
                contexts = contexts.slice(0, filters.limit);
            }

            return { success: true, data: contexts };
        }

        const params = new URLSearchParams();
        if (filters?.query) params.append('q', filters.query);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.tags) params.append('tags', filters.tags.join(','));
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.sort) params.append('sort', filters.sort);
        if (filters?.order) params.append('order', filters.order);

        const url = new URL(`/api/context?${params.toString()}`, this.opts.baseUrl);
        return this.getJson(url);
    }

    async getContext(id: string): Promise<ApiResponse<Context>> {
        if (this.opts.testMode) {
            await this.mockDelay();
            const context = MOCK_CONTEXT.find(c => c.id === id);

            if (context) {
                return { success: true, data: context };
            } else {
                return { success: false, error: 'Context not found' };
            }
        }

        const url = new URL(`/api/context/${encodeURIComponent(id)}`, this.opts.baseUrl);
        return this.getJson(url);
    }

    // Method to toggle test mode
    setTestMode(enabled: boolean): void {
        this.opts.testMode = enabled;
    }

    // Method to get current test mode status
    isTestMode(): boolean {
        return this.opts.testMode;
    }

    private getDefaultBaseUrl(): string {
        return "http://localhost:22003";
    }

    private buildHeaders(extra?: Record<string, string>): HeadersInit {
        return {
            "Content-Type": "application/json",
            ...this.opts.defaultHeaders,
            ...extra,
        };
    }

    private async getJson(url: URL): Promise<any> {
        const res = await this._fetch(url.toString(), {
            headers: this.buildHeaders({
                "Content-Type": "application/json",
                ...this.opts.defaultHeaders,
            }),
            credentials: "include",
        });
        return this.handleResponse(res);
    }

    private async postJson(url: URL, body: any): Promise<any> {
        const res = await this._fetch(url.toString(), {
            method: "POST",
            headers: this.buildHeaders({
                "Content-Type": "application/json",
                ...this.opts.defaultHeaders,
            }),
            credentials: "include",
            body: JSON.stringify(body ?? {}),
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
}