export interface Context {
    id: string;
    name?: string;
    content: string;
    category?: string;
    tags?: string[];
    updatedAt: string; // ISO date string
}

export interface SearchContextsBody {
    query?: string;
    category?: string[];
    tags?: string[];
    limit?: number;
    sort?: 'updatedAt';
    order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}