import { useQuery } from "@tanstack/react-query";
import { fetchManagerStats } from "../../api/api";

export function useManagerStatsQuery(userId?: number) {
  return useQuery({
    queryKey: ["manager-stats", userId],
    queryFn: async () => {
      const result = await fetchManagerStats(userId);
      return result.stats;
    },
    refetchInterval: 30000, // Автообновление каждые 30 секунд
    refetchOnWindowFocus: true, // Обновление при фокусе на окне
    refetchOnMount: true, // Обновление при монтировании
  });
}
