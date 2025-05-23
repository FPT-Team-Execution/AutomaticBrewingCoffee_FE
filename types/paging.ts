
export interface PagingParams {
    filterBy?: string;
    filterQuery?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    isAsc?: boolean;
    status?: string;
    productId?: string;
    type?: string;
    productType?: string;
    productSize?: string;
    hasMenu?: boolean;
}

export interface PagingResponse<T> {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: T[];
}


