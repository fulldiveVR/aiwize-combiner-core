import { Context, ApiResponse, SearchContextsBody } from "./types";
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

    /**
     * Search for contexts in vector database
     * @param body - The search body, see {@link SearchContextsBody}
     * @returns The search results
     */
    async searchContexts(body?: SearchContextsBody): Promise<ApiResponse<Context[]>> {
        if (this.opts.testMode) {
            await this.mockDelay();
            let contexts = [...MOCK_CONTEXT];

            // Apply filters if provided
            if (body?.query) {
                const query = body.query.toLowerCase();
                contexts = contexts.filter(c =>
                    (c.name?.toLowerCase().includes(query) ?? false) ||
                    c.content.toLowerCase().includes(query) ||
                    c.tags?.some(tag => tag.toLowerCase().includes(query))
                );
            }

            if (body?.category) {
                contexts = contexts.filter(c =>
                    body.category.some(category =>
                        c.category?.toLowerCase() === category.toLowerCase()
                    )
                );
            }

            if (body?.tags && body.tags.length > 0) {
                contexts = contexts.filter(c =>
                    c.tags?.some(tag =>
                        body.tags?.some(filterTag =>
                            tag.toLowerCase() === filterTag.toLowerCase()
                        )
                    )
                );
            }

            // Sorting
            if (body?.sort === 'updatedAt') {
                contexts.sort((a, b) => {
                    const dateA = new Date(a.updatedAt).getTime();
                    const dateB = new Date(b.updatedAt).getTime();
                    return (body.order === 'asc' ? dateA - dateB : dateB - dateA);
                });
            }

            // Limit
            if (body?.limit && body.limit > 0) {
                contexts = contexts.slice(0, body.limit);
            }

            return { success: true, data: contexts };
        }

        const url = new URL(`/api/labeling/search`, this.opts.baseUrl);
        return await this.postJson(url, body);
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