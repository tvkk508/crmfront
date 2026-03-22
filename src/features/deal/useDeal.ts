import { useQuery } from "@tanstack/react-query";
import { fetchDeal } from "../../api/endpoints";

export function useDealQuery(dealId: string) {
  return useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => fetchDeal(dealId),
    enabled: Boolean(dealId),
  });
}
