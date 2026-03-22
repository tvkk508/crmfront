import { http, HttpResponse } from "msw";
import type { Deal } from "../api/view-types";
import { buildStages, createDealDetails, createPipeline } from "./data";

let pipelineState = createPipeline();
const dealDetails = createDealDetails();

export const handlers = [
  http.get("/api/pipeline", () => {
    return HttpResponse.json(pipelineState);
  }),
  http.get("/api/deals/:dealId", ({ params }) => {
    const dealId = params.dealId as string;
    const deal = dealDetails[dealId];
    if (!deal) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(deal);
  }),
  http.patch("/api/deals/:dealId/move", async ({ params, request }) => {
    const dealId = params.dealId as string;
    const body = (await request.json()) as { stageId?: string };
    if (!body.stageId) {
      return HttpResponse.json({ ok: false }, { status: 400 });
    }

    const stageId = body.stageId as string;
    const updatedDeals: Deal[] = pipelineState.deals.map((deal) =>
      deal.id === dealId ? { ...deal, stageId } : deal
    );
    pipelineState = {
      ...pipelineState,
      deals: updatedDeals,
      stages: buildStages(updatedDeals),
    };

    return HttpResponse.json({ ok: true });
  }),
  http.post("/api/deals", async ({ request }) => {
    const body = (await request.json()) as { stageId?: string; contact?: string };
    if (!body.stageId || !body.contact) {
      return HttpResponse.json({ message: "Bad request" }, { status: 400 });
    }

    const newDeal: Deal = {
      id: String(Date.now()),
      contact: body.contact,
      company: "Без значения",
      vehicle: "Без значения",
      location: "Москва",
      value: 10000,
      stageId: body.stageId,
      owner: "Вы",
      updatedAt: "сейчас",
      tags: [{ label: "SIPUNI", tone: "violet" }],
      statuses: [{ label: "Нет задач", tone: "warn" }],
    };

    const updatedDeals: Deal[] = [newDeal, ...pipelineState.deals];
    pipelineState = {
      ...pipelineState,
      deals: updatedDeals,
      stages: buildStages(updatedDeals),
    };

    return HttpResponse.json(newDeal);
  }),
];
