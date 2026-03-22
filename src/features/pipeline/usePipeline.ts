import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDeal, fetchPipeline, moveDeal } from "../../api/endpoints";
import type {
  CreateDealPayload,
  Deal,
  MoveDealPayload,
  PipelineData,
} from "../../api/view-types";

export type PipelineFilters = { responsibleUserId?: number; q?: string };

const getPipelineQueryKey = (filters?: PipelineFilters) => [
  "pipeline",
  filters?.responsibleUserId ?? null,
  filters?.q ?? "",
];

const rebuildStages = (stages: PipelineData["stages"], deals: Deal[]) => {
  return stages.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.stageId === stage.id);
    const valueSum = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
    return {
      ...stage,
      dealCount: stageDeals.length,
      valueSum,
    };
  });
};

const createOptimisticDeal = (payload: CreateDealPayload): Deal => ({
  id: `tmp-${Date.now()}`,
  contact: payload.contact,
  company: "Без значения",
  vehicle: "Без значения",
  location: "Москва",
  value: 10000,
  stageId: payload.stageId,
  owner: "Вы",
  updatedAt: "сейчас",
  tags: [{ label: "SIPUNI", tone: "violet" }],
  statuses: [{ label: "Нет задач", tone: "warn" }],
});

export function usePipelineQuery(filters?: PipelineFilters) {
  return useQuery({
    queryKey: getPipelineQueryKey(filters),
    queryFn: () => fetchPipeline(filters),
  });
}

export function useMoveDealMutation(filters?: PipelineFilters) {
  const queryClient = useQueryClient();
  const queryKey = getPipelineQueryKey(filters);

  return useMutation({
    mutationFn: (payload: MoveDealPayload) => moveDeal(payload),
    onMutate: async ({ dealId, stageId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PipelineData>(queryKey);
      if (!previous) {
        return { previous };
      }

      const updatedDeals = previous.deals.map((deal) =>
        deal.id === dealId ? { ...deal, stageId } : deal
      );

      queryClient.setQueryData<PipelineData>(queryKey, {
        ...previous,
        deals: updatedDeals,
        stages: rebuildStages(previous.stages, updatedDeals),
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });
}

export function useCreateDealMutation(filters?: PipelineFilters) {
  const queryClient = useQueryClient();
  const queryKey = getPipelineQueryKey(filters);

  return useMutation({
    mutationFn: (payload: CreateDealPayload) => createDeal(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PipelineData>(queryKey);
      if (!previous) {
        return { previous };
      }

      const optimisticDeal = createOptimisticDeal(payload);
      const updatedDeals = [optimisticDeal, ...previous.deals];

      queryClient.setQueryData<PipelineData>(queryKey, {
        ...previous,
        deals: updatedDeals,
        stages: rebuildStages(previous.stages, updatedDeals),
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });
}
