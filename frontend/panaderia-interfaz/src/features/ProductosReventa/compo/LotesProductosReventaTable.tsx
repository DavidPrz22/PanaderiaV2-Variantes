import { useMemo, useReducer } from "react";
import { PRLotesHeader } from "./PRLotesHeader";
import { PRLotesBody } from "./PRLotesBody";
import { useGetLotesProductosReventa } from "../hooks/queries/queries";
import { useProductosReventaContext } from "@/context/ProductosReventaContext";
import { Paginator } from "@/components/Paginator";

type PaginatorActions = "next" | "previous" | "base";

export const LotesProductosReventaTable = () => {
    const { productoReventaId } = useProductosReventaContext();
    const {
        data: lotesPagination,
        isFetching: isFetchingLotesProductosReventa,
        fetchNextPage,
        hasNextPage,
        isFetched
    } = useGetLotesProductosReventa(productoReventaId!);

    const [page, setPage] = useReducer(
        (state: number, action: { type: PaginatorActions; payload?: number }) => {
            switch (action.type) {
                case "next":
                    if (lotesPagination) {
                        if (state < lotesPagination.pages.length - 1) return state + 1;
                        if (hasNextPage) fetchNextPage();
                        return state + 1;
                    }
                    return state;

                case "previous":
                    return state - 1;

                case "base":
                    if (lotesPagination) {
                        if (
                            action.payload! > lotesPagination.pages.length - 1 ||
                            action.payload! < 0
                        ) {
                            if (hasNextPage) fetchNextPage();
                            if (action.payload! > lotesPagination.pages.length) {
                                return state + 1;
                            }
                        }
                        return action.payload!;
                    }
                    return state;

                default:
                    return state;
            }
        },
        0
    );

    const lotesPage = useMemo(() => {
        return lotesPagination?.pages?.[page]?.results || [];
    }, [lotesPagination, page]);

    const pages_count = useMemo(() => {
        if (!lotesPagination?.pages?.[0]) return 0;
        const result_count = lotesPagination.pages[0].count || 0;
        const entry_per_page = 15;
        return Math.ceil(result_count / entry_per_page);
    }, [isFetched, lotesPagination]);

    return (
        <>
            <div className="w-full border border-gray-300 rounded-lg bg-white flex flex-col">
                <PRLotesHeader />
                <PRLotesBody data={lotesPage} isLoading={isFetchingLotesProductosReventa} />
                {pages_count > 1 && (
                    <div className="p-4 border-t border-gray-200">
                        <Paginator
                            previousPage={page > 0}
                            nextPage={hasNextPage || page < pages_count - 1}
                            pages={Array.from({ length: pages_count }, (_, i) => i)}
                            currentPage={page}
                            onClickPrev={() => setPage({ type: "previous" })}
                            onClickPage={(p) => setPage({ type: "base", payload: p })}
                            onClickNext={() => setPage({ type: "next" })}
                        />
                    </div>
                )}
            </div>
        </>
    );
};