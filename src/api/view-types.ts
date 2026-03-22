export type Stage = {
  id: string;
  title: string;
  color: string;
  dealCount: number;
  valueSum: number;
};

export type DealTag = {
  label: string;
  tone?: "violet" | "blue" | "green" | "orange" | "red" | "gray";
};

export type DealStatus = {
  label: string;
  tone?: "success" | "warn" | "danger" | "info" | "muted";
};

export type Deal = {
  id: string;
  contact: string;
  company?: string;
  vehicle?: string;
  location?: string;
  value: number;
  stageId: string;
  owner: string;
  updatedAt: string;
  tags: DealTag[];
  statuses?: DealStatus[];
};

export type PipelineData = {
  stages: Stage[];
  deals: Deal[];
};

export type DealField = {
  id: string;
  label: string;
  value?: string | null;
  href?: string;
};

export type DealSection = {
  id: string;
  title: string;
  fields: DealField[];
};

import type { Client, Deal as ApiDeal } from "./types";

export type DealStageInfo = {
  id: number;
  name: string;
  color?: string;
  order_index: number;
};

export type DealDetail = {
  id: string;
  title: string;
  stage: string;
  stageId: number;
  pipelineId: number;
  pipelineName: string;
  stages: DealStageInfo[];
  stageEnteredAt?: string | null;
  value: number;
  responsible?: string | null;
  owner: string;
  status: string;
  company: string;
  updatedAt: string;
  sections: DealSection[];
  fields?: Record<string, DealFieldValue>;
  clientId?: number | null;
  contactPhone?: string | null;
  contactPhoneNormalized?: string | null;
  client?: Client | null;
  legs?: ApiDeal["legs"];
};

export type MoveDealPayload = {
  dealId: string;
  stageId: string;
};

export type CreateDealPayload = {
  stageId: string;
  contact: string;
};

export type DealFieldValue = string | number | boolean | null;
