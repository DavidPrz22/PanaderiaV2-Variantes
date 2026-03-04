// src/hooks/usePageHook.ts
import type { InfiniteData } from "@tanstack/react-query";
import { useReducer, useMemo } from "react";

type PaginatorActions = "next" | "previous" | "base";

// Generic interface for DRF-style pagination
interface BasePagination<T> {
    count: number;
    results: T[];
}

export const usePageHook = <T>(
    paginationData: InfiniteData<BasePagination<T>, unknown> | undefined,
    fetchNextPage: () => void,
    hasNextPage: boolean,
    pageSize: number = 15,
    initialPage: number = 0
) => {
    const [page, setPage] = useReducer(
        (state: number, action: { type: PaginatorActions; payload?: number }) => {
            switch (action.type) {
                case "next":
                    if (paginationData) {
                        if (state < paginationData.pages.length - 1) return state + 1;
                        if (hasNextPage) fetchNextPage();
                        return state + 1;
                    }
                    return state;
                case "previous":
                    return Math.max(0, state - 1);
                case "base":
                    if (paginationData && action.payload !== undefined) {
                        if (action.payload > paginationData.pages.length - 1) {
                            if (hasNextPage) fetchNextPage();
                        }
                        return action.payload;
                    }
                    return state;
                default:
                    return state;
            }
        },
        initialPage
    );

    const currentPageResults = useMemo(() => {
        return paginationData?.pages?.[page]?.results || [];
    }, [paginationData, page]);

    const totalPages = useMemo(() => {
        if (!paginationData?.pages?.[0]) return 0;
        const resultCount = paginationData.pages[0].count || 0;
        return Math.ceil(resultCount / pageSize);
    }, [paginationData, pageSize]);

    return {
        page,
        setPage,
        currentPageResults,
        totalPages
    };
};