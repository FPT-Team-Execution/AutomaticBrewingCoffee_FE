import { useCrossTabSWR } from "@/lib/swr";
import { getStores } from "@/services/store";
import { PagingParams } from "@/types/paging";

export function useStores(params: PagingParams) {
    return useCrossTabSWR(
        ["stores", params],
        () => getStores(params)
    );
}