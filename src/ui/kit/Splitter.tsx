import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef } from "react";
import { cn } from "../cn";

export type SplitterProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
  invert?: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function Splitter({
  value,
  min,
  max,
  onChange,
  className,
  invert,
}: SplitterProps) {
  const startXRef = useRef(0);
  const startValueRef = useRef(value);
  const frameRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const splitterRef = useRef<HTMLDivElement | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    startXRef.current = event.clientX;
    startValueRef.current = value;
    pointerIdRef.current = event.pointerId;
    splitterRef.current?.setPointerCapture(event.pointerId);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const adjustedDelta = invert ? -delta : delta;
      const nextValue = clamp(startValueRef.current + adjustedDelta, min, max);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = window.requestAnimationFrame(() => {
        onChange(nextValue);
      });
    };

    const stopResize = () => {
      if (pointerIdRef.current !== null) {
        if (splitterRef.current?.hasPointerCapture(pointerIdRef.current)) {
          splitterRef.current.releasePointerCapture(pointerIdRef.current);
        }
        pointerIdRef.current = null;
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
      window.removeEventListener("blur", stopResize);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
    window.addEventListener("blur", stopResize);
  };

  return (
    <div
      role="separator"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={onPointerDown}
      ref={splitterRef}
      className={cn(
        "group relative flex w-2 min-w-[8px] cursor-col-resize touch-manipulation items-center justify-center",
        className
      )}
    >
      <div className="h-full w-px bg-ui-border transition-colors duration-ui-fast group-hover:bg-ui-accent/60" />
    </div>
  );
}
