import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../cn";

export type AmoCardTab = {
  id: string;
  label: string;
  disabled?: boolean;
};

export type AmoCardTabsProps = {
  tabs: AmoCardTab[];
  value: string;
  onValueChange: (id: string) => void;
  overflowMode?: "dots" | "scroll";
  dataTestId?: string;
};

export function AmoCardTabs({
  tabs,
  value,
  onValueChange,
  overflowMode = "dots",
  dataTestId = "deal-tabs",
}: AmoCardTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [showOverflow, setShowOverflow] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [hiddenTabs, setHiddenTabs] = useState<AmoCardTab[]>([]);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Update slider position based on active tab
  const updateSlider = useCallback(() => {
    const activeTab = tabRefs.current.get(value);
    const container = containerRef.current;
    if (!activeTab || !container) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    
    setSliderStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [value]);

  // Check for overflow and determine hidden tabs
  const checkOverflow = useCallback(() => {
    const container = containerRef.current;
    if (!container || overflowMode !== "dots") {
      setShowOverflow(false);
      setHiddenTabs([]);
      return;
    }

    const containerWidth = container.clientWidth;
    const dotsButtonWidth = 32; // Approximate width for dots button
    let totalWidth = 0;
    const hidden: AmoCardTab[] = [];
    let overflowNeeded = false;

    tabs.forEach((tab) => {
      const tabEl = tabRefs.current.get(tab.id);
      if (tabEl) {
        const tabWidth = tabEl.offsetWidth;
        totalWidth += tabWidth;
        if (totalWidth > containerWidth - dotsButtonWidth) {
          overflowNeeded = true;
          hidden.push(tab);
        }
      }
    });

    setShowOverflow(overflowNeeded && hidden.length > 0);
    setHiddenTabs(hidden);
  }, [tabs, overflowMode]);

  useEffect(() => {
    updateSlider();
  }, [value, updateSlider]);

  useEffect(() => {
    // Schedule check after render to avoid setState in effect body
    const timer = requestAnimationFrame(() => {
      checkOverflow();
    });
    const handleResize = () => {
      checkOverflow();
      updateSlider();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [checkOverflow, updateSlider, tabs]);

  // Close overflow menu on outside click
  useEffect(() => {
    if (!overflowOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [overflowOpen]);

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    onValueChange(tabId);
    setOverflowOpen(false);
  };

  const getTabTestId = (tabId: string) => {
    const testIdMap: Record<string, string> = {
      main: "deal-tab-main",
      transport: "deal-tab-transport",
      insurance: "deal-tab-insurance",
    };
    return testIdMap[tabId] ?? `deal-tab-${tabId}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      role="tablist"
      data-testid={dataTestId}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = tab.id === value;
          const isHidden = hiddenTabs.some((h) => h.id === tab.id);

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              data-testid={getTabTestId(tab.id)}
              className={cn(
                "relative px-3 py-2 text-sm font-medium whitespace-nowrap",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:rounded-sm",
                isActive
                  ? "text-accent"
                  : "text-text-tertiary hover:text-text-primary",
                tab.disabled && "opacity-40 cursor-not-allowed",
                isHidden && showOverflow && "sr-only"
              )}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              disabled={tab.disabled}
            >
              <span className="truncate max-w-[120px] inline-block">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated slider/underline */}
      <div
        className="absolute bottom-0 h-0.5 bg-accent transition-all duration-200 ease-out rounded-full"
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width,
        }}
      />

      {/* Overflow dots menu */}
      {showOverflow && (
        <div ref={overflowRef} className="relative ml-1">
          <button
            type="button"
            className={cn(
              "flex items-center justify-center w-8 h-8",
              "rounded-sm text-text-tertiary hover:text-text-primary hover:bg-surface-muted",
              "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            )}
            onClick={() => setOverflowOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={overflowOpen}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
            </svg>
          </button>

          {overflowOpen && (
            <div
              role="menu"
              className={cn(
                "absolute top-full right-0 z-50 mt-1 min-w-[140px]",
                "rounded-md border border-border bg-surface shadow-lg",
                "py-1 animate-in fade-in-0 zoom-in-95 duration-100"
              )}
            >
              {hiddenTabs.map((tab) => {
                const isActive = tab.id === value;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="menuitem"
                    data-testid={getTabTestId(tab.id)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm",
                      "transition-colors hover:bg-surface-muted",
                      isActive ? "text-accent font-medium" : "text-text-primary",
                      tab.disabled && "opacity-40 cursor-not-allowed"
                    )}
                    onClick={() => handleTabClick(tab.id, tab.disabled)}
                    disabled={tab.disabled}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

