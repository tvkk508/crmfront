export interface Pipeline {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: number;
  pipeline_id: number;
  name: string;
  order_index: number;
  color?: string;
}

export type UserRole = "admin" | "user";

export interface User {
  id: number;
  login: string;
  name: string;
  role: UserRole;
}

export interface TransportLeg {
  id: number;
  title?: string | null;
  transport_type?: string | null;
  from?: string | null;
  to?: string | null;
  carrier?: string | null;
  rate?: number | null;
  paid?: number | null;
  load_date?: string | null;
  unload_date?: string | null;
  parking_cost?: number | null;
  reception_cost?: number | null;
}

export interface Deal {
  id: number;
  pipeline_id: number;
  stage_id: number;
  client_id?: number | null;
  title: string;
  amount: number;
  description?: string | null;
  responsible_user_id?: number | null;
  responsible?: string | null;
  from_location?: string | null;
  to_location?: string | null;
  load_date?: string | null;
  unload_date?: string | null;
  car_make?: string | null;
  car_model?: string | null;
  car_year?: number | null;
  car_running?: boolean | null;
  car_price?: number | null;
  car_dimensions?: string | null;
  car_plate?: string | null;
  car_vin?: string | null;
  contact_phone?: string | null;
  contact_phone_normalized?: string | null;
  is_phone_stub?: boolean | null;
  payment_amount?: number | null;
  payment_form?: string | null;
  planned_dispatch_date?: string | null;
  sender_name?: string | null;
  sender_phone?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  car_keys?: number | null;
  car_mileage?: number | null;
  insurance_sum?: number | null;
  insurance_declared?: number | null;
  insurance_cost?: number | null;
  insurance_coefficient?: number | null;
  insurance_paid?: number | null;
  insurance_profit?: number | null;
  direct_route?: boolean | null;
  declared_shipping_price?: number | null;
  extra_insurance?: number | null;
  declared_deal_price?: number | null;
  shipping_profit?: number | null;
  route_cost?: number | null;
  transport_cost?: number | null;
  parking_cost?: number | null;
  receiving_cost?: number | null;
  agency_fee?: number | null;
  legs?: TransportLeg[];
  agent_enabled?: boolean | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export type TaskEntityType = "deal" | "contact" | "company";
export type TaskStatus = "open" | "completed" | "canceled";
export type TaskSource = "manual" | "automation";

export interface TaskType {
  id: number;
  name: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  task_type_id: number;
  responsible_user_id: number;
  created_by_user_id?: number | null;
  entity_type: TaskEntityType;
  entity_id: number;
  text: string;
  due_at: string;
  status: TaskStatus;
  completed_at?: string | null;
  result_text?: string | null;
  priority: boolean;
  source: TaskSource;
  dedupe_key?: string | null;
  created_at: string;
  updated_at: string;
  task_type_name?: string | null;
  responsible_user_name?: string | null;
  entity_title?: string | null;
}

export interface TaskGroupResponse {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  next_week: Task[];
  future: Task[];
}

export interface AvitoMessage {
  id: number;
  chat_id: string;
  message_id: string;
  author_id?: number | null;
  direction?: string | null;
  type?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
  payload?: any;
  received_at?: string | null;
}

export interface DealsResponse {
  items: Deal[];
  total: number;
}

export type DealPayload = {
  title: string;
  amount: number;
  description?: string | null;
  stage_id: number;
  pipeline_id: number;
  client_id?: number | null;
  responsible?: string | null;
  responsible_user_id?: number | null;
  from_location?: string | null;
  to_location?: string | null;
  load_date?: string | null;
  unload_date?: string | null;
  car_make?: string | null;
  car_model?: string | null;
  car_year?: number | null;
  car_running?: boolean | null;
  car_price?: number | null;
  car_dimensions?: string | null;
  car_plate?: string | null;
  car_vin?: string | null;
  contact_phone?: string | null;
  payment_amount?: number | null;
  payment_form?: string | null;
  planned_dispatch_date?: string | null;
  sender_name?: string | null;
  sender_phone?: string | null;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  car_keys?: number | null;
  car_mileage?: number | null;
  insurance_sum?: number | null;
  insurance_declared?: number | null;
  insurance_cost?: number | null;
  insurance_coefficient?: number | null;
  insurance_paid?: number | null;
  insurance_profit?: number | null;
  direct_route?: boolean | null;
  declared_shipping_price?: number | null;
  extra_insurance?: number | null;
  declared_deal_price?: number | null;
  shipping_profit?: number | null;
  route_cost?: number | null;
  transport_cost?: number | null;
  parking_cost?: number | null;
  receiving_cost?: number | null;
  agency_fee?: number | null;
  legs?: TransportLeg[];
  agent_enabled?: boolean | null;
};

export type TransportBucket = "day" | "week" | "month";

export type DatePreset =
  | "all_time"
  | "last_7_days"
  | "last_30_days"
  | "current_month"
  | "prev_month"
  | "last_3_months"
  | "last_6_months"
  | "last_year"
  | null;

export interface TransportRouteStat {
  origin_city: string | null;
  destination_city: string | null;
  total: number;
  revenue: number;
  avg_rate: number;
  min_rate: number;
  max_rate: number;
  carriers_count: number;
  share_trips: number;
  share_revenue: number;
}

export interface TransportCarrierStat {
  carrier: string | null;
  total: number;
  revenue: number;
  avg_rate: number;
  min_rate: number;
  max_rate: number;
  routes_count: number;
  car_makes_count: number;
  car_models_count: number;
}

export interface TransportTimelinePoint {
  period_start: string;
  period_end: string;
  total: number;
  revenue: number;
  avg_rate: number;
  min_rate: number;
  max_rate: number;
}

export interface TransportCarrierProfile {
  routes: TransportRouteStat[];
  car_mix: { car_make: string | null; car_model: string | null; total: number; avg_rate: number }[];
}

// ======== Client Type ========
export interface Client {
  id: number;
  name?: string | null;
  phone?: string | null;
  phone_normalized?: string | null;
  email?: string | null;
  company?: string | null;
  company_name?: string | null;
  avito_user_id?: number | null;
  avito_profile?: string | null;
  telegram_id?: number | null;
  telegram_username?: string | null;
  birth_date?: string | null;
  passport?: string | null;
  passport_issue_date?: string | null;
  passport_issuer_code?: string | null;
  user_agreement?: boolean | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface TransportAnalytics {
  period: { from: string; to: string; previous_from: string; previous_to: string; bucket: TransportBucket };
  metrics: {
    total_trips: number;
    total_revenue: number;
    avg_rate: number;
    min_rate: number;
    max_rate: number;
    unique_routes: number;
    unique_carriers: number;
    unique_makes: number;
    unique_models: number;
    unique_origins: number;
    unique_destinations: number;
    avg_revenue_per_trip: number;
    avg_trips_per_carrier: number;
  };
  deltas: { total_trips: number; total_revenue: number; avg_rate: number };
  routes_top: TransportRouteStat[];
  routes_by_revenue: TransportRouteStat[];
  carriers: TransportCarrierStat[];
  timeline: TransportTimelinePoint[];
  carrier_profile?: TransportCarrierProfile;
  meta: { global_min_date: string | null };
}

export interface TransportAnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  datePreset: DatePreset;
  carMake?: string;
  carModel?: string;
  origin?: string;
  destination?: string;
  carrier?: string;
  bucket: TransportBucket;
}

export type CarrierResultSource = "exact" | "geo";

export interface CarrierSearchResult {
  carrierId: string;
  carrier: string;
  phone: string;
  dealsCount: number;
  totalSum: number | null;
  avgPrice: number | null;
  totalDealsCount: number | null;
  driverTotalSum: number | null;
  driverAvgPrice: number | null;
  source: CarrierResultSource;
  matchType: CarrierResultSource | "composite";
  priceForRoute?: number | null;
  dealsOnRoute?: number | null;
  lastDealDate?: string | null;
}

export interface CompositeSegment {
  from: string;
  to: string;
  drivers: CarrierSearchResult[];
}

export interface CompositeRouteOption {
  path: string[];
  segments: CompositeSegment[];
  transfers: number;
  totalEstimatedCost: number | null;
  description: string;
}

export type CarrierGroupType = "exact" | "geo" | "composite";

export interface CarrierGroup {
  type: CarrierGroupType;
  title: string;
  total_carriers: number;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  items: CarrierSearchResult[];
}

export interface GroupedCarrierSearchResponse {
  route: { from: string; to: string };
  groups: CarrierGroup[];
  updated_at: string;
}

export interface CarrierDetails {
  carrier_id: string;
  name: string;
  phone: string;
  rating: number | null;
  company_info: {
    inn: string | null;
    region: string | null;
    years_in_business: number | null;
  };
  overall_stats: {
    deals_total: number;
    avg_price_total: number | null;
    min_price_total: number | null;
    max_price_total: number | null;
    cancel_rate: number | null;
    avg_delivery_time_days: number | null;
    last_deal_date: string | null;
  };
  route_stats: {
    from: string | null;
    to: string | null;
    deals_on_route: number;
    avg_price_on_route: number | null;
    min_price_on_route: number | null;
    max_price_on_route: number | null;
  };
  recent_deals: {
    date: string | null;
    load_date: string | null;
    from: string | null;
    to: string | null;
    price: number | null;
    car_make: string | null;
    car_model: string | null;
    car_year: string | null | number;
    status: string | null;
  }[];
}

// ======== Telegram Integration Types ========

export interface TelegramMessage {
  id: number;
  telegram_chat_id: number;
  telegram_message_id: number;
  direction: 'in' | 'out';
  message_type: string;
  text_content?: string | null;
  author_id?: number | null;
  manager_user_id?: number | null;
  payload?: any;
  is_read: boolean;
  created_at: string;
  received_at: string;
}

export interface TelegramStatus {
  has_telegram: boolean;
  has_active_token: boolean;
  active_token_expires: string | null;
}

export interface TelegramLink {
  link: string;
  token: string;
  expires_at: string;
}

export interface UnifiedMessage {
  channel_type: 'avito' | 'telegram';
  id: number;
  external_chat_id: string;
  deal_id?: number | null;
  direction: string;
  text_content?: string | null;
  message_type?: string | null;
  author_external_id?: string | null;
  manager_user_id?: number | null;
  is_read?: boolean | null;
  created_at: string;
  received_at?: string | null;
  payload?: any;
}

export interface CommunicationChannel {
  id: number;
  deal_id: number;
  channel_type: 'avito' | 'telegram' | 'whatsapp';
  external_id: string;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface UnifiedMessagesResponse {
  messages: UnifiedMessage[];
  channels: {
    avito: { chat_id: string; user_id: number } | null;
    telegram: { chat_id: number; user_id: number | null } | null;
  };
  communication_channels: CommunicationChannel[];
}

export type CallDirection = "in" | "out";

export interface Call {
  id: number;
  client_id: number | null;
  deal_id: number | null;
  direction?: CallDirection | null;
  status?: string | null;
  started_at?: string | null;
  answered_at?: string | null;
  ended_at?: string | null;
  external_number_normalized?: string | null;
  internal_sip_number?: string | null;
  recording_local_path?: string | null;
  recording_duration_sec?: number | null;
  transcript_status?: string | null;
}

export interface CommunicationEvent {
  id: number;
  client_id: number;
  deal_id?: number | null;
  type: string;
  direction?: CallDirection | null;
  call_id?: number | null;
  title?: string | null;
  content?: any;
  created_at: string;
  created_by_user_id?: number | null;
  call_status?: string | null;
  call_duration_sec?: number | null;
  call_recording_available?: boolean;
  external_number_normalized?: string | null;
  internal_sip_number?: string | null;
  transcript_status?: string | null;
}
