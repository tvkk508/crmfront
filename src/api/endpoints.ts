import type {
  CreateDealPayload,
  Deal,
  DealDetail,
  DealFieldValue,
  DealStageInfo,
  MoveDealPayload,
  PipelineData,
} from "./view-types";
import type { Client as ApiClient, Deal as ApiDeal, Pipeline as ApiPipeline, Stage as ApiStage } from "./types";
import {
  createDeal as apiCreateDeal,
  fetchDealById,
  fetchDeals,
  fetchPipelines,
  fetchStages,
  fetchClient,
  updateDeal as apiUpdateDeal,
} from "./api";

const stageColorFallback = [
  "var(--amo-stage-purple)",
  "var(--amo-stage-blue)",
  "var(--amo-stage-green)",
  "var(--amo-stage-orange)",
  "var(--amo-stage-teal)",
  "var(--amo-stage-yellow)",
  "var(--amo-stage-red)",
  "var(--amo-stage-pink)",
  "var(--amo-stage-gray)",
];

const MAX_PIPELINE_DEALS = 1000;
let cachedPipelineId: number | null = null;
let cachedPipelines: ApiPipeline[] = [];
let cachedStages: ApiStage[] = [];

const formatUpdatedAt = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ru-RU");
};

const pickDealValue = (deal: ApiDeal) => {
  if (Number.isFinite(deal.amount)) return deal.amount;
  if (Number.isFinite(deal.declared_deal_price ?? NaN)) {
    return deal.declared_deal_price ?? 0;
  }
  return 0;
};

const formatVehicle = (deal: ApiDeal) => {
  const parts = [deal.car_make, deal.car_model].filter(Boolean);
  return parts.length ? parts.join(" ") : undefined;
};

const formatLocation = (deal: ApiDeal) => {
  if (deal.from_location && deal.to_location) {
    return `${deal.from_location} -> ${deal.to_location}`;
  }
  return deal.from_location || deal.to_location || undefined;
};

const mapDealToView = (deal: ApiDeal): Deal => ({
  id: String(deal.id),
  contact: deal.title || deal.contact_phone || `Deal #${deal.id}`,
  company: deal.contact_phone ?? deal.responsible ?? undefined,
  vehicle: formatVehicle(deal),
  location: formatLocation(deal),
  value: pickDealValue(deal),
  stageId: String(deal.stage_id),
  owner: deal.responsible ?? "-",
  updatedAt: formatUpdatedAt(deal.updated_at),
  tags: [],
  statuses: [],
});

const resolvePipelineId = async () => {
  if (cachedPipelineId) return cachedPipelineId;
  const pipelines = await fetchPipelines();
  cachedPipelines = pipelines;
  const active = pipelines.find((p) => p.is_active) ?? pipelines[0];
  if (!active) {
    throw new Error("pipeline_not_found");
  }
  cachedPipelineId = active.id;
  return cachedPipelineId;
};

const getPipelineName = (pipelineId: number): string => {
  const pipeline = cachedPipelines.find((p) => p.id === pipelineId);
  return pipeline?.name ?? `Pipeline #${pipelineId}`;
};

const mapStagesToInfo = (stages: ApiStage[]): DealStageInfo[] =>
  stages.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color ?? stageColorFallback[s.order_index % stageColorFallback.length],
    order_index: s.order_index,
  }));

const ensureStages = async (pipelineId: number) => {
  if (cachedPipelineId === pipelineId && cachedStages.length > 0) {
    return cachedStages;
  }
  cachedPipelineId = pipelineId;
  cachedStages = await fetchStages(pipelineId);
  return cachedStages;
};

// Fallback coefficient is stored in percentage points: 0.2 means 0.2%.
// Must stay in sync with DEFAULT_INSURANCE_COEFFICIENT in DealLeftPanel.tsx so that
// the initial loaded value and the live-computed value are consistent.
const FALLBACK_INSURANCE_DECLARED_COEFF = 0.2;
const FALLBACK_INSURANCE_COST_COEFF = 0.1;

const buildDealFields = (deal: ApiDeal, client?: ApiClient | null) => {
  const insuranceSum = deal.insurance_sum ?? deal.car_price ?? null;
  const insuranceCoefficient = deal.insurance_coefficient ?? FALLBACK_INSURANCE_DECLARED_COEFF;
  const insuranceDeclared =
    deal.insurance_declared ?? (insuranceSum !== null ? insuranceSum * insuranceCoefficient / 100 : null);
  const insuranceCost =
    deal.insurance_cost ??
    (insuranceSum !== null ? insuranceSum * FALLBACK_INSURANCE_COST_COEFF / 100 : null);
  const insuranceProfit =
    deal.insurance_profit ??
    (insuranceDeclared !== null && insuranceCost !== null
      ? insuranceDeclared - insuranceCost
      : null);
  const plannedDispatch = deal.planned_dispatch_date ?? deal.load_date ?? null;
  const fields: Record<string, DealFieldValue> = {
    responsibleUserId: deal.responsible_user_id ?? null,
    budget: deal.amount ?? null,
    payment: deal.payment_amount ?? null,
    paymentForm: deal.payment_form ?? null,
    from: deal.from_location ?? null,
    to: deal.to_location ?? null,
    plannedDispatch,
    loadingDate: deal.load_date ?? null,
    unloadingDate: deal.unload_date ?? null,
    senderName: deal.sender_name ?? null,
    senderPhone: deal.sender_phone ?? null,
    receiverName: deal.receiver_name ?? null,
    receiverPhone: deal.receiver_phone ?? null,
    carMake: deal.car_make ?? null,
    carModel: deal.car_model ?? null,
    carYear: deal.car_year ?? null,
    carRunning: deal.car_running ?? null,
    carKeys: deal.car_keys ?? null,
    carMileage: deal.car_mileage ?? null,
    carValue: deal.car_price ?? null,
    carDimensions: deal.car_dimensions ?? null,
    carVin: deal.car_vin ?? null,
    carPlate: deal.car_plate ?? null,
    company: client?.company ?? null,
    companyName: client?.company_name ?? client?.name ?? null,
    workPhone: client?.phone ?? deal.contact_phone ?? null,
    workEmail: client?.email ?? null,
    telegram: client?.telegram_username ? `@${client.telegram_username}` : null,
    avitoProfile: client?.avito_profile ?? null,
    avitoId: client?.avito_user_id ?? null,
    birthDate: client?.birth_date ?? null,
    passport: client?.passport ?? null,
    passportIssueDate: client?.passport_issue_date ?? null,
    passportIssuerCode: client?.passport_issuer_code ?? null,
    userAgreement: client?.user_agreement ?? null,
    directRoute: deal.direct_route ?? null,
    declaredTransportPrice: deal.declared_shipping_price ?? null,
    extraInsurance: deal.extra_insurance ?? null,
    declaredDealPrice: deal.declared_deal_price ?? null,
    transportProfit: deal.shipping_profit ?? null,
    routeCost: deal.route_cost ?? null,
    transportCost: deal.transport_cost ?? null,
    parkingCost: deal.parking_cost ?? null,
    inspectionCost: deal.receiving_cost ?? null,
    agentFees: deal.agency_fee ?? null,
    insuranceSum,
    insuranceDeclared,
    insuranceCost,
    // insurance_coefficient is stored in percentage points: 0.2 means 0.2%.
    insuranceCoefficient: deal.insurance_coefficient ?? null,
    insurancePaid: deal.insurance_paid ?? null,
    insuranceProfit,
  };

  const legs = Array.isArray(deal.legs) ? deal.legs : [];
  legs.slice(0, 3).forEach((leg, index) => {
    const suffix = index + 1;
    fields[`transportType${suffix}`] = leg.transport_type ?? leg.title ?? null;
    fields[`from${suffix}`] = leg.from ?? null;
    fields[`to${suffix}`] = leg.to ?? null;
    fields[`carrier${suffix}`] = leg.carrier ?? null;
    fields[`rate${suffix}`] = leg.rate ?? null;
    fields[`paid${suffix}`] = leg.paid ?? null;
    fields[`loadDate${suffix}`] = leg.load_date ?? null;
    fields[`unloadDate${suffix}`] = leg.unload_date ?? null;
    fields[`parking${suffix}`] = leg.parking_cost ?? null;
    fields[`inspection${suffix}`] = leg.reception_cost ?? null;
  });

  return fields;
};

export async function fetchPipeline(filters?: { responsibleUserId?: number; q?: string }): Promise<PipelineData> {
  const pipelineId = await resolvePipelineId();
  const stages = await ensureStages(pipelineId);
  const { items } = await fetchDeals({
    pipelineId,
    limit: MAX_PIPELINE_DEALS,
    responsibleUserId: filters?.responsibleUserId,
    q: filters?.q,
  });

  const deals = items.map(mapDealToView);
  const stageDealMap = new Map<string, Deal[]>();
  deals.forEach((deal) => {
    const bucket = stageDealMap.get(deal.stageId) ?? [];
    bucket.push(deal);
    stageDealMap.set(deal.stageId, bucket);
  });

  const viewStages = stages.map((stage, index) => {
    const stageDeals = stageDealMap.get(String(stage.id)) ?? [];
    const valueSum = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
    return {
      id: String(stage.id),
      title: stage.name,
      color: stage.color ?? stageColorFallback[index % stageColorFallback.length],
      dealCount: stageDeals.length,
      valueSum,
    };
  });

  return { stages: viewStages, deals };
}

export async function fetchDeal(dealId: string): Promise<DealDetail> {
  const id = Number(dealId);
  if (Number.isNaN(id)) {
    throw new Error("invalid_deal_id");
  }
  const deal = await fetchDealById(id);
  // Ensure pipelines are cached for pipeline name lookup
  if (cachedPipelines.length === 0) {
    await resolvePipelineId();
  }
  const stages = await ensureStages(deal.pipeline_id);
  const stageName = stages.find((stage) => stage.id === deal.stage_id)?.name ?? String(deal.stage_id);
  let client: ApiClient | null = null;
  if (deal.client_id) {
    try {
      client = await fetchClient(deal.client_id);
    } catch {
      client = null;
    }
  }

  return {
    id: String(deal.id),
    title: deal.title || `Deal #${deal.id}`,
    stage: stageName,
    stageId: deal.stage_id,
    pipelineId: deal.pipeline_id,
    pipelineName: getPipelineName(deal.pipeline_id),
    stages: mapStagesToInfo(stages),
    stageEnteredAt: deal.updated_at ?? null,
    value: pickDealValue(deal),
    responsible: deal.responsible ?? null,
    owner: deal.responsible ?? "-",
    status: deal.agent_enabled === false ? "Disabled" : "Active",
    company: client?.name ?? deal.contact_phone ?? "-",
    updatedAt: formatUpdatedAt(deal.updated_at),
    sections: [],
    fields: buildDealFields(deal, client),
    clientId: deal.client_id ?? null,
    contactPhone: deal.contact_phone ?? null,
    contactPhoneNormalized: client?.phone_normalized ?? deal.contact_phone_normalized ?? null,
    client,
    legs: deal.legs,
  };
}

export async function moveDeal({ dealId, stageId }: MoveDealPayload) {
  const id = Number(dealId);
  const targetStageId = Number(stageId);
  if (Number.isNaN(id) || Number.isNaN(targetStageId)) {
    throw new Error("invalid_deal_id");
  }
  await apiUpdateDeal(id, { stage_id: targetStageId, position: Number.MAX_SAFE_INTEGER });
  return { ok: true };
}

export async function createDeal(payload: CreateDealPayload) {
  const stageId = Number(payload.stageId);
  if (Number.isNaN(stageId)) {
    throw new Error("invalid_stage_id");
  }
  const pipelineId = await resolvePipelineId();
  const created = await apiCreateDeal({
    title: payload.contact,
    amount: 0,
    pipeline_id: pipelineId,
    stage_id: stageId,
  });
  return mapDealToView(created);
}
