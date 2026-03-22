import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { DealDetail } from "../../api/view-types";
import { createClient, updateClient, updateDeal, updateDealContacts } from "../../api/api";
import {
  Badge,
  Card,
  Checkbox,
  Cluster,
  FieldError,
  FieldRow,
  Input,
  ScrollArea,
  Select,
} from "../../ui/kit";
import { cn } from "../../ui/cn";
import { AmoPipelineSelect } from "../../ui/amo/AmoPipelineSelect";
import { AmoCardTabs, type AmoCardTab } from "../../ui/amo/AmoCardTabs";
import { usePublicUsersQuery } from "../users/useUsers";
import {
  dealLeftPanelTabs,
  type DealLeftPanelField,
  type DealLeftPanelSection,
  type DealLeftPanelTab,
} from "./dealLeftPanel.schema";

type DealLeftPanelProps = {
  deal: DealDetail;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

type FieldValues = Record<string, unknown>;

// Must stay in sync with FALLBACK_INSURANCE_DECLARED_COEFF in endpoints.ts.
// Stored in percentage points: 0.2 means 0.2%.
const DEFAULT_INSURANCE_COEFFICIENT = 0.2;

const emptyValue = "-";
const currencyFormatter = new Intl.NumberFormat("ru-RU");
const numberFormatter = new Intl.NumberFormat("ru-RU");
const dateFormatter = new Intl.DateTimeFormat("ru-RU");
const scrollStoragePrefix = "ui.deal.left.scrollTop.";
const phoneFieldKeys = new Set(["senderPhone", "receiverPhone", "workPhone"]);
const booleanNumberFieldKeys = new Set([
  "payment",
  "paid1",
  "paid2",
  "paid3",
  "insurancePaid",
]);

const isPhoneField = (key: string) => phoneFieldKeys.has(key);
const isSelectField = (field: DealLeftPanelField) =>
  Array.isArray(field.options) && field.options.length > 0;

const isResponsibleUserField = (field: DealLeftPanelField) =>
  field.key === "responsibleUserId";

const formatInsuranceCoefficient = (value: string | number) =>
  `${String(value).replace(/%/g, "").trim()}%`;

const toFiniteNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/\s+/g, "").replace(",", ".");
    if (!cleaned) {
      return null;
    }
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
};

const sumFieldValues = (values: FieldValues, keys: string[]) =>
  keys.reduce((sum, key) => sum + (toFiniteNumber(values[key]) ?? 0), 0);

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }
  return value.trim().startsWith("+") ? `+${digits}` : digits;
};

const toBooleanLabel = (value: boolean) => (value ? "Да" : "Нет");

const formatValue = (
  value: unknown,
  format?: DealLeftPanelField["format"],
  field?: DealLeftPanelField,
  users?: Array<{ id: number; name: string }>
) => {
  if (value === null || value === undefined || value === "") {
    return emptyValue;
  }
  
  // Для ответственного - показываем имя пользователя
  if (field?.key === "responsibleUserId" && typeof value === "number") {
    const user = users?.find((u) => u.id === value);
    return user?.name ?? String(value);
  }

  if (format === "currency") {
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(numeric)) {
      return `${currencyFormatter.format(numeric)} ₽`;
    }
    return String(value);
  }

  if (format === "number") {
    if (field?.key === "insuranceCoefficient") {
      return formatInsuranceCoefficient(value as string | number);
    }
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(numeric)) {
      return numberFormatter.format(numeric);
    }
    return String(value);
  }

  if (format === "date") {
    const dateValue = value instanceof Date ? value : new Date(String(value));
    if (!Number.isNaN(dateValue.getTime())) {
      return dateFormatter.format(dateValue);
    }
    return String(value);
  }

  if (format === "boolean") {
    if (typeof value === "boolean") {
      return toBooleanLabel(value);
    }
    if (value === "true" || value === "false") {
      return toBooleanLabel(value === "true");
    }
    if (value === 1 || value === 0) {
      return toBooleanLabel(Boolean(value));
    }
  }

  if (typeof value === "boolean") {
    return toBooleanLabel(value);
  }

  return String(value);
};

const dealFieldMap: Record<string, string> = {
  responsible: "responsible",
  responsibleUserId: "responsible_user_id",
  budget: "amount",
  payment: "payment_amount",
  paymentForm: "payment_form",
  from: "from_location",
  to: "to_location",
  plannedDispatch: "planned_dispatch_date",
  loadingDate: "load_date",
  unloadingDate: "unload_date",
  senderName: "sender_name",
  senderPhone: "sender_phone",
  receiverName: "receiver_name",
  receiverPhone: "receiver_phone",
  carMake: "car_make",
  carModel: "car_model",
  carYear: "car_year",
  carRunning: "car_running",
  carKeys: "car_keys",
  carMileage: "car_mileage",
  carValue: "car_price",
  carDimensions: "car_dimensions",
  carVin: "car_vin",
  carPlate: "car_plate",
  directRoute: "direct_route",
  declaredTransportPrice: "declared_shipping_price",
  extraInsurance: "extra_insurance",
  declaredDealPrice: "declared_deal_price",
  transportProfit: "shipping_profit",
  routeCost: "route_cost",
  transportCost: "transport_cost",
  parkingCost: "parking_cost",
  inspectionCost: "receiving_cost",
  agentFees: "agency_fee",
  insuranceSum: "insurance_sum",
  insuranceDeclared: "insurance_declared",
  insuranceCost: "insurance_cost",
  insuranceCoefficient: "insurance_coefficient",
  insurancePaid: "insurance_paid",
  insuranceProfit: "insurance_profit",
};

const AUTO_CALCULATED_FIELDS = [
  "routeCost",
  "transportCost",
  "parkingCost",
  "inspectionCost",
  "insuranceSum",
  "insuranceDeclared",
  "insuranceCost",
  "insuranceProfit",
  "extraInsurance",
  "declaredDealPrice",
  "transportProfit",
  "budget",
] as const;

const clientFieldMap: Record<string, string> = {
  company: "company",
  companyName: "company_name",
  workPhone: "phone",
  workEmail: "email",
  telegram: "telegram_username",
  avitoProfile: "avito_profile",
  avitoId: "avito_user_id",
  birthDate: "birth_date",
  passport: "passport",
  passportIssueDate: "passport_issue_date",
  passportIssuerCode: "passport_issuer_code",
  userAgreement: "user_agreement",
};

const legFieldPattern =
  /^(transportType|from|to|carrier|rate|paid|loadDate|unloadDate|parking|inspection)(\d)$/;

const getSectionStorageKey = (tabId: DealLeftPanelTab["id"], sectionId: string) =>
  `ui.deal.left.sectionsCollapsed.${tabId}.${sectionId}`;

type DealSectionProps = {
  tabId: DealLeftPanelTab["id"];
  section: DealLeftPanelSection;
  values: FieldValues;
  renderField: (field: DealLeftPanelField, rawValue: unknown) => JSX.Element;
};

const DealSection = ({ tabId, section, values, renderField }: DealSectionProps) => {
  const storageKey = section.title
    ? getSectionStorageKey(tabId, section.id)
    : null;
  const [collapsed, setCollapsed] = useState(() => {
    if (!storageKey) {
      return false;
    }
    return localStorage.getItem(storageKey) === "true";
  });

  useEffect(() => {
    if (!storageKey) {
      return;
    }
    setCollapsed(localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }
    localStorage.setItem(storageKey, String(collapsed));
  }, [storageKey, collapsed]);

  const fields = section.fields.map((field) => {
    const rawValue = (values as Record<string, unknown>)[field.key];
    return renderField(field, rawValue);
  });

  if (!section.title) {
    return <div className="min-w-0 px-ui-2 pb-ui-2">{fields}</div>;
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-ui-md border border-ui-border/60 bg-ui-surface">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className={cn(
          "flex w-full min-w-0 items-center justify-between gap-ui-2 px-ui-3 py-ui-2.5 text-left",
          "text-ui-caption font-semibold uppercase tracking-wide text-text-tertiary",
          "transition-colors duration-ui-fast hover:bg-ui-surface-muted"
        )}
      >
        <span className="min-w-0 truncate">{section.title}</span>
        <svg
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-ui-fast motion-reduce:transition-none",
            collapsed ? "-rotate-90" : "rotate-0"
          )}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {!collapsed ? <div className="min-w-0 border-t border-ui-border/50 px-ui-2 pb-ui-3">{fields}</div> : null}
    </section>
  );
};

export function DealLeftPanel({ deal, collapsed, onToggleCollapse }: DealLeftPanelProps) {
  const { data: users } = usePublicUsersQuery();
  const [localFields, setLocalFields] = useState<Record<string, unknown>>({});
  const fieldValues = useMemo(
    () => ({ ...(deal.fields ?? {}), ...localFields }),
    [deal.fields, localFields]
  );
  const [activeTab, setActiveTab] = useState(dealLeftPanelTabs[0].id);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const commitRef = useRef(false);
  const clientCommitRef = useRef(false);
  const queryClient = useQueryClient();
  const [currentStageId, setCurrentStageId] = useState(deal.stageId);
  const [stageError, setStageError] = useState<string | null>(null);

  // Sync local stage state with deal data
  useEffect(() => {
    setCurrentStageId(deal.stageId);
  }, [deal.stageId]);

  // Calculate days in current stage
  const daysInStage = useMemo(() => {
    if (!deal.stageEnteredAt) return null;
    const enteredDate = new Date(deal.stageEnteredAt);
    if (Number.isNaN(enteredDate.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - enteredDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  }, [deal.stageEnteredAt]);

  // Tabs for AmoCardTabs component
  const amoTabs: AmoCardTab[] = useMemo(
    () => dealLeftPanelTabs.map((tab) => ({ id: tab.id, label: tab.label })),
    []
  );

  // Handle stage change
  const handleStageChange = useCallback(
    async (newStageId: number) => {
      const dealId = Number(deal.id);
      if (Number.isNaN(dealId)) return;
      setStageError(null);
      // Optimistic update
      const previousStageId = currentStageId;
      setCurrentStageId(newStageId);
      try {
        await updateDeal(dealId, { stage_id: newStageId });
        queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
      queryClient.invalidateQueries({ queryKey: ["manager-stats"] });
        queryClient.invalidateQueries({ queryKey: ["pipeline"] });
        queryClient.invalidateQueries({ queryKey: ["manager-stats"] });
      } catch (err) {
        // Rollback on error
        setCurrentStageId(previousStageId);
        const message = err instanceof Error ? err.message : "Не удалось сменить этап";
        setStageError(message);
        // Clear error after 3 seconds
        setTimeout(() => setStageError(null), 3000);
        throw err;
      }
    },
    [deal.id, currentStageId, queryClient]
  );
  const [clientInfo, setClientInfo] = useState(deal.client ?? null);
  const [clientEditField, setClientEditField] = useState<"name" | "phone" | null>(null);
  const [clientDraft, setClientDraft] = useState({
    name: deal.client?.name ?? "",
    phone: deal.client?.phone ?? deal.contactPhone ?? "",
  });
  const [clientSaving, setClientSaving] = useState(false);
  const [clientError, setClientError] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const saveTimerRef = useRef<number | null>(null);
  const saveSeqRef = useRef<Record<string, number>>({});
  const isReadOnly = false;


  // Автоматический расчет полей
  const calculatedFields = useMemo(() => {
    const values = fieldValues;
    const calculated: Record<string, number | null> = {};

    // Получаем значения из legs (этапы 1, 2, 3)
    calculated.transportCost = sumFieldValues(values, ["rate1", "rate2", "rate3"]);
    calculated.parkingCost = sumFieldValues(values, ["parking1", "parking2", "parking3"]);
    calculated.inspectionCost = sumFieldValues(values, ["inspection1", "inspection2", "inspection3"]);
    
    // Себестоимость маршрута = сумма (транспорт + стоянка + приемка + агентские) по всем этапам
    const agentFees = toFiniteNumber(values.agentFees) ?? 0;
    const routeCost =
      (calculated.transportCost ?? 0) +
      (calculated.parkingCost ?? 0) +
      (calculated.inspectionCost ?? 0) +
      agentFees;
    // Добавляем агентские из основного поля
    calculated.routeCost = routeCost;

    // Сумма страхования = себестоимость автомобиля
    const carValue = toFiniteNumber(values.carValue);
    calculated.insuranceSum = carValue;

    // Коэффициент страховки: если не задан явно — используем тот же fallback,
    // что и endpoints.ts (FALLBACK_INSURANCE_DECLARED_COEFF = 0.2), чтобы
    // начальное загруженное значение и live-вычисленное совпадали.
    const rawCoefficient = toFiniteNumber(values.insuranceCoefficient);
    const insuranceCoefficient =
      rawCoefficient !== null && !Number.isNaN(rawCoefficient)
        ? rawCoefficient
        : DEFAULT_INSURANCE_COEFFICIENT;

    // Страхование объявлено = сумма страхования × коэффициент / 100
    if (calculated.insuranceSum !== null) {
      calculated.insuranceDeclared = calculated.insuranceSum * insuranceCoefficient / 100;
    } else {
      calculated.insuranceDeclared = null;
    }

    // Страхование себестоимость = сумма страхования × 0.1
    if (calculated.insuranceSum !== null) {
      calculated.insuranceCost = calculated.insuranceSum * 0.1 / 100;
    } else {
      calculated.insuranceCost = null;
    }

    // Прибыль страхования = страхование объявлено - страхование себестоимость
    if (calculated.insuranceDeclared !== null && calculated.insuranceCost !== null) {
      calculated.insuranceProfit = calculated.insuranceDeclared - calculated.insuranceCost;
    } else {
      calculated.insuranceProfit = null;
    }

    // Доп. страховка = страхование объявлено
    calculated.extraInsurance = calculated.insuranceDeclared;

    // Объявленная цена перевозки (вручную, берем из values)
    const declaredTransportPrice = toFiniteNumber(values.declaredTransportPrice);

    // Объявленная цена сделки = объявленная цена перевозки + доп. страховка
    if (declaredTransportPrice !== null && calculated.extraInsurance !== null) {
      calculated.declaredDealPrice = declaredTransportPrice + calculated.extraInsurance;
    } else {
      calculated.declaredDealPrice = null;
    }

    // Прибыль перевозки = объявленная цена перевозки - себестоимость маршрута
    if (declaredTransportPrice !== null) {
      calculated.transportProfit = declaredTransportPrice - routeCost;
    } else {
      calculated.transportProfit = null;
    }

    // Сумма = прибыль перевозки + прибыль страхования (это поле не определено в схеме, но можно добавить)
    if (calculated.transportProfit !== null && calculated.insuranceProfit !== null) {
      calculated.totalProfit = calculated.transportProfit + calculated.insuranceProfit;
    } else {
      calculated.totalProfit = null;
    }

    // Бюджет = прибыль перевозки + прибыль страхования
    calculated.budget = calculated.totalProfit;

    return calculated;
  }, [fieldValues]);

  // Объединяем вычисленные поля с текущими значениями
  const computedFieldValues = useMemo(() => {
    const computed: Record<string, unknown> = { ...fieldValues };
    
    // Применяем вычисленные значения только если поле не редактируется вручную
    // Для автоматически вычисляемых полей используем вычисленные значения
    Object.keys(calculatedFields).forEach((key) => {
      // Не перезаписываем, если значение было установлено вручную и отличается от вычисленного
      // Но для автоматических полей всегда используем вычисленные значения
      if (AUTO_CALCULATED_FIELDS.includes(key as (typeof AUTO_CALCULATED_FIELDS)[number])) {
        computed[key] = calculatedFields[key];
      }
    });

    return computed;
  }, [fieldValues, calculatedFields]);

  useEffect(() => {
    setClientInfo(deal.client ?? null);
    setLocalFields({});
    setFieldErrors({});
    if (clientEditField) {
      return;
    }
    setClientDraft({
      name: deal.client?.name ?? "",
      phone: deal.client?.phone ?? deal.contactPhone ?? "",
    });
  }, [deal.client, deal.contactPhone, clientEditField]);

  const getScrollKey = (tabId: string) => `${scrollStoragePrefix}${tabId}`;
  const getStoredScrollTop = (tabId: string) => {
    const stored = Number(localStorage.getItem(getScrollKey(tabId)));
    return Number.isFinite(stored) ? stored : 0;
  };

  const handleTabChange = (nextTab: string) => {
    const nextId =
      dealLeftPanelTabs.find((tab) => tab.id === nextTab)?.id ??
      dealLeftPanelTabs[0].id;
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      localStorage.setItem(
        getScrollKey(activeTab),
        String(scrollArea.scrollTop)
      );
    }
    setActiveTab(nextId);
    requestAnimationFrame(() => {
      const nextScroll = getStoredScrollTop(nextId);
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = nextScroll;
      }
    });
  };

  const handleScroll = () => {
    if (scrollRafRef.current !== null) {
      return;
    }
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const scrollArea = scrollAreaRef.current;
      if (!scrollArea) {
        return;
      }
      localStorage.setItem(
        getScrollKey(activeTab),
        String(scrollArea.scrollTop)
      );
    });
  };

  const bumpSaveSeq = (key: string) => {
    const next = (saveSeqRef.current[key] ?? 0) + 1;
    saveSeqRef.current[key] = next;
    return next;
  };

  const isLatestSave = (key: string, seq: number) =>
    saveSeqRef.current[key] === seq;

  const markSaved = (key: string) => {
    setSavedKey(key);
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      setSavedKey(null);
      saveTimerRef.current = null;
    }, 1200);
  };

  const toDateInputValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().slice(0, 10);
  };

  const normalizeNumeric = (value: string) => {
    const cleaned = value.replace(/\s+/g, "").replace(",", ".");
    const numeric = Number(cleaned);
    return Number.isNaN(numeric) ? null : numeric;
  };

  const parseBooleanValue = (value: unknown) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return Boolean(value);
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "y", "да"].includes(normalized)) return true;
      if (["false", "0", "no", "n", "нет"].includes(normalized)) return false;
    }
    return null;
  };

  const formatInputValue = (value: unknown, format?: DealLeftPanelField["format"]) => {
    if (format === "date") {
      return toDateInputValue(value);
    }
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  };

  const parseInputValue = (
    key: string,
    value: string,
    format?: DealLeftPanelField["format"]
  ) => {
    const trimmed = value.trim();
    if (format === "boolean") {
      return trimmed ? parseBooleanValue(trimmed) : null;
    }
    const isNumericField =
      format === "currency" ||
      format === "number" ||
      ["carYear", "carKeys", "carMileage", "avitoId"].includes(key) ||
      /^(rate|paid|parking|inspection)\d$/.test(key);
    if (!trimmed) {
      return isNumericField ? undefined : null;
    }
    if (isPhoneField(key)) {
      const normalized = normalizePhone(trimmed);
      return normalized ? normalized : null;
    }
    if (isNumericField) {
      const numeric = normalizeNumeric(trimmed);
      return numeric === null ? undefined : numeric;
    }
    if (format === "date") {
      return trimmed;
    }
    return trimmed;
  };

  const parseSelectValue = (field: DealLeftPanelField, value: string) => {
    if (!value) {
      return null;
    }
    if (field.valueType === "number") {
      const numeric = Number(value);
      return Number.isNaN(numeric) ? null : numeric;
    }
    return value;
  };

  const normalizeRawValue = (field: DealLeftPanelField, rawValue: unknown) => {
    if (field.format === "date") {
      return toDateInputValue(rawValue);
    }
    if (field.format === "boolean") {
      return parseBooleanValue(rawValue);
    }
    if (field.valueType === "number" && typeof rawValue === "string") {
      const numeric = normalizeNumeric(rawValue);
      return numeric === null ? rawValue : numeric;
    }
    if (isPhoneField(field.key) && typeof rawValue === "string") {
      return normalizePhone(rawValue);
    }
    return rawValue;
  };

  const buildLegsUpdate = (key: string, value: unknown) => {
    const match = key.match(legFieldPattern);
    if (!match) {
      return null;
    }
    const index = Number(match[2]) - 1;
    if (Number.isNaN(index) || index < 0) {
      return null;
    }
    const base = Array.isArray(deal.legs) ? deal.legs : [];
    const next = base.map((leg) => ({ ...leg }));
    while (next.length <= index) {
      next.push({ id: 0 });
    }
    const fieldKey = match[1];
    const map: Record<string, string> = {
      transportType: "transport_type",
      from: "from",
      to: "to",
      carrier: "carrier",
      rate: "rate",
      paid: "paid",
      loadDate: "load_date",
      unloadDate: "unload_date",
      parking: "parking_cost",
      inspection: "reception_cost",
    };
    const targetKey = map[fieldKey];
    if (!targetKey) {
      return null;
    }
    const nextValue =
      fieldKey === "paid" && typeof value === "boolean" ? (value ? 1 : 0) : value;
    next[index] = { ...next[index], [targetKey]: nextValue };
    return next;
  };

  const ensureClient = async () => {
    if (clientInfo?.id) {
      return clientInfo;
    }
    const phoneRaw = clientDraft.phone || deal.contactPhone || "";
    const phoneValue = phoneRaw ? normalizePhone(phoneRaw) : "";
    if (!phoneValue) {
      throw new Error("Телефон обязателен для создания клиента");
    }
    const created = await createClient({
      name: clientDraft.name || null,
      phone: phoneValue,
    });
    await updateDealContacts(Number(deal.id), {
      client_id: created.id,
      contact_phone: phoneValue,
    });
    setClientInfo(created);
    return created;
  };

  // Автоматическое сохранение вычисленных полей в БД
  useEffect(() => {
    const dealId = Number(deal.id);
    if (Number.isNaN(dealId)) {
      return;
    }

    // Создаем payload только с вычисленными полями, которые есть в dealFieldMap
    const payload: Record<string, unknown> = {};
    let hasChanges = false;

    AUTO_CALCULATED_FIELDS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(dealFieldMap, key)) {
        const calculatedValue = calculatedFields[key];
        const currentValue = fieldValues[key];
        
        // Сохраняем только если значение изменилось
        if (calculatedValue !== currentValue && calculatedValue !== null && calculatedValue !== undefined) {
          payload[dealFieldMap[key]] = calculatedValue;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      // Сохраняем вычисленные значения в БД
      updateDeal(dealId, payload).catch((err) => {
        console.error("Failed to save calculated fields", err);
      });
    }
  }, [calculatedFields, deal.id, fieldValues]);

  const applyFieldUpdate = async (key: string, value: unknown) => {
    const dealId = Number(deal.id);
    if (Number.isNaN(dealId)) {
      throw new Error("invalid_deal_id");
    }
    
    // Автоматически вычисляемые поля не сохраняются напрямую через редактирование
    // Они сохраняются автоматически через useEffect выше
    if (AUTO_CALCULATED_FIELDS.includes(key as (typeof AUTO_CALCULATED_FIELDS)[number])) {
      // Эти поля вычисляются автоматически, не сохраняем их напрямую
      return;
    }
    
    if (Object.prototype.hasOwnProperty.call(dealFieldMap, key)) {
      let payloadValue = value;
      if (booleanNumberFieldKeys.has(key)) {
        const normalized = parseBooleanValue(value);
        payloadValue = normalized === null ? null : normalized ? 1 : 0;
      }
      const payload = {
        [dealFieldMap[key]]: payloadValue,
      } as Record<string, unknown>;
      await updateDeal(dealId, payload);
      
      // После сохранения пересчитываем автоматические поля (они сохранятся через useEffect)
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
      queryClient.invalidateQueries({ queryKey: ["manager-stats"] });
      return;
    }
    if (Object.prototype.hasOwnProperty.call(clientFieldMap, key)) {
      const client = await ensureClient();
      const payload = { [clientFieldMap[key]]: value } as Record<string, unknown>;
      if (key === "telegram" && typeof value === "string") {
        payload[clientFieldMap[key]] = value.replace(/^@/, "");
      }
      if (key === "avitoId" && typeof value === "string") {
        const numeric = normalizeNumeric(value);
        payload[clientFieldMap[key]] = numeric === null ? null : numeric;
      }
      const updated = await updateClient(client.id, payload);
      setClientInfo(updated);
      return;
    }
    const nextLegs = buildLegsUpdate(key, value);
    if (nextLegs) {
      await updateDeal(dealId, { legs: nextLegs });
    }
  };

  const startEdit = (field: DealLeftPanelField, rawValue: unknown) => {
    // Автоматически вычисляемые поля нельзя редактировать
    if (
      isReadOnly ||
      savingKey ||
      field.format === "boolean" ||
      isSelectField(field) ||
      AUTO_CALCULATED_FIELDS.includes(field.key as (typeof AUTO_CALCULATED_FIELDS)[number])
    ) {
      return;
    }
    setFieldErrors((prev) => ({ ...prev, [field.key]: "" }));
    setEditingKey(field.key);
    setEditingValue(formatInputValue(rawValue, field.format));
  };

  const saveFieldValue = async (
    field: DealLeftPanelField,
    rawValue: unknown,
    parsed: unknown,
    options?: { clearEditing?: boolean; optimistic?: boolean }
  ) => {
    if (parsed === undefined) {
      return;
    }
    const { clearEditing = true, optimistic = false } = options ?? {};
    const normalizedRaw = normalizeRawValue(field, rawValue);
    if (parsed === normalizedRaw || String(parsed ?? "") === String(normalizedRaw ?? "")) {
      if (clearEditing) {
        setEditingKey(null);
        setEditingValue("");
      }
      return;
    }
    const seq = bumpSaveSeq(field.key);
    setSavingKey(field.key);
    setFieldErrors((prev) => ({ ...prev, [field.key]: "" }));
    const previousValue = rawValue;
    if (optimistic) {
      setLocalFields((prev) => ({ ...prev, [field.key]: parsed }));
    }
    try {
      await applyFieldUpdate(field.key, parsed);
      if (isLatestSave(field.key, seq)) {
        if (!optimistic) {
          setLocalFields((prev) => ({ ...prev, [field.key]: parsed }));
        }
        if (clearEditing) {
          setEditingKey(null);
          setEditingValue("");
        }
        markSaved(field.key);
        queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
      queryClient.invalidateQueries({ queryKey: ["manager-stats"] });
      }
    } catch (err) {
      if (optimistic && isLatestSave(field.key, seq)) {
        setLocalFields((prev) => ({ ...prev, [field.key]: previousValue }));
      }
      const message = err instanceof Error ? err.message : "Save failed";
      setFieldErrors((prev) => ({ ...prev, [field.key]: message }));
    } finally {
      if (isLatestSave(field.key, seq)) {
        setSavingKey(null);
      }
      commitRef.current = false;
    }
  };

  const commitEdit = async (
    field: DealLeftPanelField,
    rawValue: unknown,
    overrideValue?: string
  ) => {
    if (editingKey !== field.key) {
      return;
    }
    const valueToUse = overrideValue ?? editingValue;
    const trimmed = valueToUse.trim();
    const parsed = parseInputValue(field.key, valueToUse, field.format);
    if (parsed === undefined) {
      if (trimmed) {
        setFieldErrors((prev) => ({ ...prev, [field.key]: "Enter a number" }));
        return;
      }
      setEditingKey(null);
      return;
    }
    await saveFieldValue(field, rawValue, parsed, { clearEditing: true });
  };

  const renderField = (field: DealLeftPanelField, rawValue: unknown) => {
    // Используем вычисленное значение для автоматических полей
    const valueToDisplay = computedFieldValues[field.key] ?? rawValue;
    const formattedValue = formatValue(valueToDisplay, field.format, field, users);
    const isEditing = editingKey === field.key;
    const isSaving = savingKey === field.key;
    const error = fieldErrors[field.key];
    // Автоматически вычисляемые поля нельзя редактировать
    const isAutoCalculated = AUTO_CALCULATED_FIELDS.includes(
      field.key as (typeof AUTO_CALCULATED_FIELDS)[number]
    );
    const editable = !isReadOnly && !isAutoCalculated;
    const isBooleanField = field.format === "boolean";
    const isSelect = isSelectField(field);
    const isResponsibleUser = isResponsibleUserField(field);
    const canInlineEdit = editable && !isBooleanField && !isSelect && !isResponsibleUser;
    const inputType =
      field.format === "date"
        ? "date"
        : isPhoneField(field.key)
          ? "tel"
          : field.format === "currency" ||
            field.format === "number" ||
            ["carYear", "carKeys", "carMileage", "avitoId"].includes(field.key) ||
            (/^(rate|paid|parking|inspection)\d$/.test(field.key) && field.format !== "boolean")
            ? "number"
            : "text";

    const saved = savedKey === field.key;
    const booleanValue = parseBooleanValue(rawValue) ?? false;

    const saveMeta = (
      <Cluster gap="sm" align="center" className="text-ui-caption">
        {isSaving ? <span className="text-ui-text-muted">Сохранение…</span> : null}
        {saved ? <span className="text-ui-success">Сохранено</span> : null}
      </Cluster>
    );

    const valueNode = isBooleanField ? (
      <div className="flex min-w-0 w-full flex-wrap items-center gap-ui-2">
        <Checkbox
          checked={booleanValue}
          disabled={isSaving || isReadOnly}
          label={toBooleanLabel(booleanValue)}
          onChange={(event) => {
            void saveFieldValue(field, rawValue, event.target.checked, {
              clearEditing: false,
              optimistic: true,
            });
          }}
        />
        {saveMeta}
      </div>
    ) : isSelect || isResponsibleUser ? (
      <div className="flex min-w-0 w-full flex-wrap items-center gap-ui-2">
        <Select
          className="min-w-0 flex-1"
          size="small"
          value={rawValue === null || rawValue === undefined ? "" : String(rawValue)}
          disabled={isSaving || isReadOnly}
          onChange={(event) => {
            const parsed = parseSelectValue(field, event.target.value);
            void saveFieldValue(field, rawValue, parsed, {
              clearEditing: false,
              optimistic: true,
            });
          }}
        >
          <option value="">{emptyValue}</option>
          {isResponsibleUser ? (
            (users ?? []).map((user) => (
              <option key={user.id} value={String(user.id)}>
                {user.name}
              </option>
            ))
          ) : (
            [
              ...new Set([
                ...(rawValue === null || rawValue === undefined || rawValue === ""
                  ? []
                  : field.options?.includes(String(rawValue))
                    ? []
                    : [String(rawValue)]),
                ...(field.options ?? []),
              ]),
            ].map((option) => (
              <option key={option} value={option}>
                {field.key === "insuranceCoefficient" ? formatInsuranceCoefficient(option) : option}
              </option>
            ))
          )}
        </Select>
        {saveMeta}
      </div>
    ) : isEditing ? (
      <Input
        className="h-8 w-full min-w-0 text-ui-caption"
        type={inputType}
        inputMode={inputType === "number" ? "decimal" : inputType === "tel" ? "tel" : undefined}
        value={editingValue}
        onChange={(event) => {
          setEditingValue(event.target.value);
          if (fieldErrors[field.key]) {
            setFieldErrors((prev) => ({ ...prev, [field.key]: "" }));
          }
        }}
        onFocus={(event) => {
          try {
            const length = event.currentTarget.value.length;
            event.currentTarget.setSelectionRange(length, length);
          } catch {}
        }}
        onBlur={() => {
          if (commitRef.current) {
            commitRef.current = false;
            return;
          }
          void commitEdit(field, rawValue);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitRef.current = true;
            void commitEdit(field, rawValue);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setEditingKey(null);
            setEditingValue("");
          }
        }}
        autoFocus
        disabled={isSaving}
      />
    ) : (
      <div className="flex min-w-0 w-full flex-wrap items-center gap-ui-2">
        <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">{formattedValue}</span>
        {saveMeta}
      </div>
    );

    return (
      <FieldRow
        key={field.key}
        label={field.label}
        value={
          error ? (
            <div className="min-w-0">
              {valueNode}
              <FieldError className="mt-ui-1">{error}</FieldError>
            </div>
          ) : (
            valueNode
          )
        }
        className="deal-left-field min-w-0"
        valueClassName={canInlineEdit ? "cursor-pointer select-none" : "cursor-default"}
        disableTooltip={
          isEditing ||
          isBooleanField ||
          isSelect ||
          isResponsibleUser ||
          field.key === "telegram"
        }
        onValueDoubleClick={
          canInlineEdit
            ? (event) => {
                event.preventDefault();
                startEdit(field, rawValue);
              }
            : undefined
        }
        onValueClick={
          canInlineEdit
            ? (event) => {
                if (event.detail > 1) {
                  event.preventDefault();
                  startEdit(field, rawValue);
                }
              }
            : undefined
        }
      />
    );
  };

  const resetClientDraft = () => {
    setClientDraft({
      name: clientInfo?.name ?? "",
      phone: clientInfo?.phone ?? deal.contactPhone ?? "",
    });
  };

  const saveClientName = async () => {
    const dealId = Number(deal.id);
    if (Number.isNaN(dealId)) {
      return;
    }
    const nextName = clientDraft.name.trim();
    const currentName = (clientInfo?.name ?? "").trim();
    if (nextName === currentName) {
      setClientEditField(null);
      return;
    }
    setClientSaving(true);
    setClientError("");
    try {
      if (clientInfo?.id) {
        const updated = await updateClient(clientInfo.id, {
          name: nextName,
        });
        setClientInfo(updated);
      } else {
        const phoneRaw = clientDraft.phone || deal.contactPhone || "";
        const phoneValue = phoneRaw ? normalizePhone(phoneRaw) : "";
        if (!phoneValue) {
          setClientError("Телефон обязателен");
          return;
        }
        const created = await createClient({
          name: nextName || null,
          phone: phoneValue,
        });
        setClientInfo(created);
        await updateDealContacts(dealId, { client_id: created.id });
      }
      setClientEditField(null);
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
      queryClient.invalidateQueries({ queryKey: ["manager-stats"] });
    } catch (err) {
      setClientError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setClientSaving(false);
    }
  };

  const saveClientPhone = async () => {
    const dealId = Number(deal.id);
    if (Number.isNaN(dealId)) {
      return;
    }
    const rawPhone = clientDraft.phone.trim();
    const nextPhone = rawPhone ? normalizePhone(rawPhone) : "";
    const currentPhoneValue = (clientInfo?.phone ?? deal.contactPhone ?? "").trim();
    const currentNormalized = currentPhoneValue ? normalizePhone(currentPhoneValue) : "";
    if (nextPhone === currentNormalized) {
      setClientEditField(null);
      return;
    }
    setClientSaving(true);
    setClientError("");
    try {
      if (clientInfo?.id) {
        const updated = await updateClient(clientInfo.id, {
          phone: nextPhone,
        });
        setClientInfo(updated);
        await updateDealContacts(dealId, {
          contact_phone: nextPhone,
          client_id: clientInfo.id,
        });
      } else {
        await updateDealContacts(dealId, { contact_phone: nextPhone });
        if (clientDraft.name || nextPhone) {
          if (!nextPhone) {
            setClientError("Телефон обязателен");
            return;
          }
          const created = await createClient({
            name: clientDraft.name || null,
            phone: nextPhone,
          });
          setClientInfo(created);
          await updateDealContacts(dealId, {
            client_id: created.id,
            contact_phone: nextPhone,
          });
        }
      }
      setClientEditField(null);
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
      queryClient.invalidateQueries({ queryKey: ["manager-stats"] });
    } catch (err) {
      setClientError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setClientSaving(false);
    }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }
    scrollArea.scrollTop = getStoredScrollTop(activeTab);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const fromLabel =
    fieldValues.from === null || fieldValues.from === undefined || fieldValues.from === ""
      ? ""
      : String(fieldValues.from);
  const toLabel =
    fieldValues.to === null || fieldValues.to === undefined || fieldValues.to === ""
      ? ""
      : String(fieldValues.to);
  const routeLabel = fromLabel && toLabel ? `${fromLabel} → ${toLabel}` : fromLabel || toLabel;
  const budgetValue = toFiniteNumber(computedFieldValues.budget) ?? deal.value;
  const valueLabel = Number.isFinite(budgetValue)
    ? `${currencyFormatter.format(budgetValue)} ₽`
    : emptyValue;

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-ui-2 rounded-ui-lg border border-ui-border bg-ui-surface py-ui-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-ui-sm border border-ui-border text-ui-caption text-text-tertiary transition-colors duration-ui-fast hover:bg-button-secondary-hover hover:text-text-primary"
          aria-label="Развернуть панель"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-ui-lg border border-ui-border bg-ui-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-ui-border bg-ui-surface px-ui-3 pt-ui-4 sm:px-ui-4">
        <div className="flex min-w-0 flex-col gap-ui-3">
          {/* Title row */}
          <div className="flex min-w-0 items-start justify-between gap-ui-3">
            <div className="min-w-0 flex-1">
              <Link
                to="/"
                className="inline-flex min-w-0 items-center gap-ui-1 text-ui-caption text-text-tertiary transition-colors duration-ui-fast hover:text-button-primary"
              >
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </Link>
              <h2
                className={cn(
                  "mt-ui-2 truncate text-ui-section-title text-text-primary",
                  isReadOnly ? "cursor-default" : "cursor-pointer"
                )}
              >
                Сделка #{deal.id}
              </h2>
            </div>
            <Cluster gap="sm" align="center" className="shrink-0">
              <Badge variant="accent" className="max-w-[10rem] truncate">
                {deal.status}
              </Badge>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-ui-sm border border-ui-border text-text-tertiary transition-colors duration-ui-fast hover:bg-button-secondary-hover hover:text-text-primary"
                aria-label="Свернуть панель"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </Cluster>
          </div>

          {/* amoCRM-style Pipeline Stage Selector */}
          {deal.stages && deal.stages.length > 0 && (
            <div className="mt-ui-1 min-w-0">
              <AmoPipelineSelect
                pipelineName={deal.pipelineName}
                stages={deal.stages}
                valueStageId={currentStageId}
                daysInStage={daysInStage}
                onChangeStage={handleStageChange}
                disabled={isReadOnly}
              />
              {stageError ? <FieldError className="mt-ui-1">{stageError}</FieldError> : null}
            </div>
          )}
          
          {/* Route & Value info */}
          <Cluster gap="md" align="center" className="min-w-0 text-ui-caption">
            {routeLabel ? (
              <>
                <div className="flex min-w-0 max-w-full items-center gap-ui-1.5 text-text-secondary">
                  <span className="shrink-0">Маршрут:</span>
                  <span className="min-w-0 truncate font-medium text-text-primary" title={routeLabel}>
                    {routeLabel}
                  </span>
                </div>
                <span className="hidden text-text-disabled sm:inline" aria-hidden>
                  •
                </span>
              </>
            ) : null}
            <div className="flex min-w-0 items-center gap-ui-1.5 text-text-secondary">
              <span className="shrink-0">Бюджет:</span>
              <span className="min-w-0 truncate font-semibold tabular-nums text-text-primary">{valueLabel}</span>
            </div>
          </Cluster>
        </div>
        
        {/* amoCRM-style Tabs with slider */}
        <div className="-mx-ui-3 mt-ui-4 border-b border-ui-border px-ui-3 pb-0 sm:-mx-ui-4 sm:px-ui-4">
          <AmoCardTabs
            tabs={amoTabs}
            value={activeTab}
            onValueChange={handleTabChange}
          />
        </div>
        
        {/* Client Card */}
        <Card variant="outlined" className="mt-ui-3 min-w-0 p-ui-3">
          <div className="flex min-w-0 items-start justify-between gap-ui-2">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Клиент
              </div>
              {clientEditField === "name" ? (
                <div className="mt-ui-2 min-w-0">
                  <Input
                    value={clientDraft.name}
                    onChange={(event) =>
                      setClientDraft((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    onBlur={() => {
                      if (clientCommitRef.current) {
                        clientCommitRef.current = false;
                        return;
                      }
                      void saveClientName();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        clientCommitRef.current = true;
                        void saveClientName();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        setClientEditField(null);
                        resetClientDraft();
                      }
                    }}
                    autoFocus
                    disabled={clientSaving}
                    size="small"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={cn(
                    "mt-ui-1 min-w-0 max-w-full text-left text-ui-body font-semibold text-text-primary [overflow-wrap:anywhere]",
                    isReadOnly
                      ? "cursor-default"
                      : "cursor-pointer transition-colors duration-ui-fast hover:text-button-primary"
                  )}
                  onDoubleClick={() => { if (!isReadOnly) { setClientEditField("name"); } }}
                  title="Двойной клик для редактирования"
                >
                  {clientInfo?.name || "Не указано"}
                </button>
              )}
            </div>
            {clientError ? (
              <FieldError className="max-w-[40%] shrink-0 text-left text-[10px] sm:max-w-none">
                {clientError}
              </FieldError>
            ) : null}
          </div>
          <div className="mt-ui-3 border-t border-ui-border pt-ui-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">Телефон</div>
            {clientEditField === "phone" ? (
              <div className="mt-ui-2 min-w-0">
                <Input
                  value={clientDraft.phone}
                  onChange={(event) =>
                    setClientDraft((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  onBlur={() => {
                    if (clientCommitRef.current) {
                      clientCommitRef.current = false;
                      return;
                    }
                    void saveClientPhone();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      clientCommitRef.current = true;
                      void saveClientPhone();
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      setClientEditField(null);
                      resetClientDraft();
                    }
                  }}
                  autoFocus
                  disabled={clientSaving}
                  size="small"
                />
              </div>
            ) : (
              <button
                type="button"
                className={cn(
                  "mt-ui-1 min-w-0 max-w-full text-left text-ui-body font-medium tabular-nums text-text-primary [overflow-wrap:anywhere]",
                  isReadOnly
                    ? "cursor-default"
                    : "cursor-pointer transition-colors duration-ui-fast hover:text-button-primary"
                )}
                onDoubleClick={() => { if (!isReadOnly) { setClientEditField("phone"); } }}
                title="Двойной клик для редактирования"
              >
                {clientInfo?.phone || deal.contactPhone || "-"}
              </button>
            )}
            {clientInfo?.phone_normalized && clientEditField !== "phone" ? (
              <div className="mt-ui-1 break-all text-[10px] text-text-tertiary">
                Нормал.: {clientInfo.phone_normalized}
              </div>
            ) : null}
          </div>
        </Card>
      </div>
      {/* Scrollable content */}
      <ScrollArea
        ref={scrollAreaRef}
        onScroll={handleScroll}
        orientation="vertical"
        className="min-h-0 min-w-0 flex-1 px-ui-2 pb-ui-6"
      >
        {dealLeftPanelTabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            className={cn("min-h-full min-w-0 w-full", tab.id !== activeTab && "hidden")}
          >
            <div className="flex min-w-0 flex-col gap-ui-2 pt-ui-3">
              {tab.sections.map((section) => (
                <DealSection
                  key={section.id}
                  tabId={tab.id}
                  section={section}
                  values={fieldValues}
                  renderField={renderField}
                />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
