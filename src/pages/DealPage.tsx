import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { DealChat } from "../features/deal/DealChat";
import { DealLeftPanel } from "../features/deal/DealLeftPanel";
import { DealRightPanel } from "../features/deal/DealRightPanel";
import { useDealQuery } from "../features/deal/useDeal";
import { useUiSettingsStore } from "../stores/uiSettings";
import { Splitter } from "../ui/kit";

export function DealPage() {
  const { dealId = "1001" } = useParams();
  const { data, isLoading, isError } = useDealQuery(dealId);
  const leftPanelMin = 420;
  const leftPanelDefault = 520;
  const leftPanelCollapsedWidth = 52;
  const rightPanelMin = 420;
  const leftWidthStorageKey = "ui.deal.leftPanelWidth";
  const legacyLeftWidthStorageKey = "ui.deal.leftWidth";
  const leftCollapsedStorageKey = "ui.deal.leftCollapsed";
  const rightPanelWidth = useUiSettingsStore((state) => state.rightPanelWidth);
  const setRightPanelWidth = useUiSettingsStore(
    (state) => state.setRightPanelWidth
  );
  const rightPanelOpen = useUiSettingsStore((state) => state.rightPanelOpen);
  const setRightPanelOpen = useUiSettingsStore(
    (state) => state.setRightPanelOpen
  );
  const basePanelGap = 12;
  const layoutGaps = rightPanelOpen ? basePanelGap * 4 : basePanelGap * 2;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const clampWidth = (value: number, maxWidth: number) =>
    Math.min(maxWidth, Math.max(leftPanelMin, value));
  const clampRightWidth = (value: number, maxWidth: number) =>
    Math.min(maxWidth, Math.max(rightPanelMin, value));
  const computeMaxLeftWidth = (width: number) => {
    const rightReserved = rightPanelOpen ? rightPanelWidth : 0;
    const layoutMax = width - rightReserved - layoutGaps;
    const ratioMax = Math.floor(width * 0.6);
    const absoluteMax = Math.min(720, ratioMax);
    return Math.max(leftPanelMin, Math.min(layoutMax, absoluteMax));
  };
  const computeMaxRightWidth = (width: number) => {
    const leftReserved = leftCollapsed ? leftPanelCollapsedWidth : leftPanelWidth;
    const layoutMax = width - leftReserved - layoutGaps;
    const ratioMax = Math.floor(width * 0.6);
    const absoluteMax = Math.min(720, ratioMax);
    return Math.max(rightPanelMin, Math.min(layoutMax, absoluteMax));
  };
  const getStoredLeftWidth = () => {
    if (typeof window === "undefined") {
      return leftPanelDefault;
    }
    const storedRaw = window.localStorage.getItem(leftWidthStorageKey);
    const legacyRaw =
      storedRaw === null
        ? window.localStorage.getItem(legacyLeftWidthStorageKey)
        : null;
    const stored = Number(storedRaw ?? legacyRaw);
    const initialMax = computeMaxLeftWidth(window.innerWidth);
    return Number.isFinite(stored)
      ? clampWidth(stored, initialMax)
      : leftPanelDefault;
  };
  const getStoredCollapsed = () => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(leftCollapsedStorageKey) === "true";
  };
  const [leftPanelWidth, setLeftPanelWidth] = useState(getStoredLeftWidth);
  const [leftCollapsed, setLeftCollapsed] = useState(getStoredCollapsed);
  const maxLeftWidth = useMemo(() => {
    const baseWidth =
      containerWidth || (typeof window !== "undefined" ? window.innerWidth : 0);
    return computeMaxLeftWidth(baseWidth);
  }, [containerWidth, rightPanelOpen, rightPanelWidth]);
  const maxRightWidth = useMemo(() => {
    const baseWidth =
      containerWidth || (typeof window !== "undefined" ? window.innerWidth : 0);
    return computeMaxRightWidth(baseWidth);
  }, [containerWidth, leftCollapsed, leftPanelWidth, rightPanelOpen]);
  const effectiveLeftWidth = leftCollapsed
    ? leftPanelCollapsedWidth
    : leftPanelWidth;
  const panelStyle = useMemo(
    () => ({ width: effectiveLeftWidth }),
    [effectiveLeftWidth]
  );

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }
    const updateWidth = () => {
      setContainerWidth(node.getBoundingClientRect().width);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    window.addEventListener("resize", updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    setLeftPanelWidth((prev) => clampWidth(prev, maxLeftWidth));
  }, [maxLeftWidth]);

  useEffect(() => {
    if (!rightPanelOpen) {
      return;
    }
    const clamped = clampRightWidth(rightPanelWidth, maxRightWidth);
    if (clamped !== rightPanelWidth) {
      setRightPanelWidth(clamped);
    }
  }, [rightPanelOpen, rightPanelWidth, maxRightWidth, setRightPanelWidth]);

  useEffect(() => {
    window.localStorage.setItem(leftWidthStorageKey, String(leftPanelWidth));
  }, [leftPanelWidth, leftWidthStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(leftCollapsedStorageKey, String(leftCollapsed));
  }, [leftCollapsed, leftCollapsedStorageKey]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-2 border-button-primary/30 border-t-button-primary rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Загрузка сделки...</span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Сделка не найдена</h3>
            <p className="mt-1 text-sm text-text-tertiary">Проверьте правильность ссылки или вернитесь к списку сделок</p>
          </div>
        </div>
      </div>
    );
  }
  const dealNumericId = Number(data.id);
  const contactPhoneNormalized =
    data.client?.phone_normalized ?? data.contactPhoneNormalized ?? null;

  return (
    <div
      ref={containerRef}
      data-testid="deal-page"
      className="page-enter flex h-screen w-full min-h-0 gap-[var(--panel-gap)] overflow-hidden p-[var(--panel-gap)]"
    >
      <div
        className="flex h-full min-h-0 flex-shrink-0"
        style={panelStyle}
      >
        <DealLeftPanel
          deal={data}
          collapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed((prev) => !prev)}
        />
      </div>
      {!leftCollapsed ? (
        <Splitter
          value={leftPanelWidth}
          min={leftPanelMin}
          max={maxLeftWidth}
          onChange={setLeftPanelWidth}
        />
      ) : null}
      <div className="min-h-0 min-w-0 flex-1">
        <DealChat
          dealId={Number.isNaN(dealNumericId) ? 0 : dealNumericId}
          clientId={data.clientId ?? null}
          contactPhoneNormalized={contactPhoneNormalized}
          rightOpen={rightPanelOpen}
          onToggleRight={() => setRightPanelOpen(!rightPanelOpen)}
        />
      </div>
      {rightPanelOpen ? (
        <>
          <Splitter
            value={rightPanelWidth}
            min={rightPanelMin}
            max={maxRightWidth}
            onChange={setRightPanelWidth}
            invert
          />
          <div
            className="flex h-full min-h-0 flex-shrink-0"
            style={{ width: rightPanelWidth }}
          >
            <DealRightPanel dealId={dealNumericId} />
          </div>
        </>
      ) : null}
    </div>
  );
}
