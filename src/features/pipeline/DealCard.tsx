import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Deal } from "../../api/view-types";
import { cn } from "../../ui/cn";
import { Tag, Badge } from "../../ui/kit";
import { formatRubles } from "./format";

type DealCardProps = {
  deal: Deal;
};

type DealCardViewProps = DealCardProps & {
  className?: string;
  style?: CSSProperties;
  innerRef?: (node: HTMLElement | null) => void;
  attributes?: DraggableAttributes;
  listeners?: DraggableSyntheticListeners;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  isOverlay?: boolean;
  isPlaceholder?: boolean;
};

// Map tag tones to Tag variants
const tagToneToVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "neutral"> = {
  violet: "primary",
  blue: "primary",
  green: "success",
  orange: "warning",
  red: "danger",
  gray: "neutral",
};

// Map status tones to Badge variants
const statusToneToVariant: Record<string, "neutral" | "accent" | "success" | "warn" | "danger" | "positive" | "negative"> = {
  success: "success",
  warn: "warn",
  danger: "danger",
  info: "accent",
  muted: "neutral",
};

const DealCardView = ({
  deal,
  className,
  style,
  innerRef,
  attributes,
  listeners,
  onClick,
  isOverlay = false,
  isPlaceholder = false,
}: DealCardViewProps) => {
  const hasTags = deal.tags.length > 0;
  const hasStatuses = (deal.statuses?.length ?? 0) > 0;

  return (
    <div
      ref={innerRef}
      style={style}
      data-testid={`deal-card-${deal.id}`}
      data-draggable="true"
      className={cn(
        "group bg-surface border border-border rounded-sm p-2.5",
        "flex flex-col gap-1.5 text-sm leading-tight cursor-grab",
        // Use specific properties to avoid conflicting with dnd-kit transform transitions
        "transition-[border-color,box-shadow,opacity] duration-150 will-change-transform",
        // Hover state
        !isOverlay && !isPlaceholder && "hover:border-button-primary/35 hover:shadow-soft",
        // Overlay state (dragging)
        isOverlay && "shadow-[0_10px_24px_rgba(15,23,42,0.2)] scale-[1.02] cursor-grabbing pointer-events-none",
        // Placeholder state: keep layout footprint, hide content
        isPlaceholder && "bg-transparent border-dashed shadow-none cursor-grabbing [&_*]:invisible",
        className
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {/* Header: Contact + Value */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text-primary truncate leading-snug">{deal.contact}</div>
          {deal.company ? (
            <div className="text-xs text-text-tertiary truncate mt-0.5 leading-snug">{deal.company}</div>
          ) : null}
        </div>
        {/* Value: max-width prevents squeezing contact name on extreme values */}
        <div className="font-semibold text-text-primary whitespace-nowrap tabular-nums text-xs flex-shrink-0 max-w-[45%] truncate">
          {formatRubles(deal.value)}
        </div>
      </div>

      {/* Vehicle Link */}
      {deal.vehicle ? (
        <a
          className="text-xs text-accent font-semibold hover:underline truncate block"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {deal.vehicle}
        </a>
      ) : null}

      {/* Location Meta */}
      {deal.location ? (
        <div className="text-xs text-text-tertiary truncate">{deal.location}</div>
      ) : null}

      {/* Footer: Tags + Statuses
          - Tags: flex-1 min-w-0 so they shrink first and don't overflow
          - Statuses: flex-shrink-0 so they stay readable; only rendered when present
          - items-start so both groups align top when wrapping */}
      {(hasTags || hasStatuses) && (
        <div className="flex items-start justify-between gap-2 mt-1">
          {/* Tags (channels) */}
          <div className="flex flex-wrap gap-1 min-w-0 flex-1">
            {deal.tags.map((tag) => (
              <Tag
                key={tag.label}
                variant={tagToneToVariant[tag.tone ?? "gray"] ?? "neutral"}
                size="small"
              >
                {tag.label}
              </Tag>
            ))}
          </div>

          {/* Statuses */}
          {hasStatuses && (
            <div className="flex flex-wrap gap-1 min-w-0 flex-shrink-0">
              {deal.statuses!.map((status) => (
                <Badge
                  key={status.label}
                  variant={statusToneToVariant[status.tone ?? "muted"]}
                  badgeSize="small"
                >
                  {status.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function DealCard({ deal }: DealCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });

  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || isDragging) {
      return;
    }
    navigate(`/deal/${deal.id}`);
  };

  return (
    <DealCardView
      deal={deal}
      style={style}
      innerRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      onClick={handleClick}
      isPlaceholder={isDragging}
    />
  );
}

export function DealCardOverlay({
  deal,
  width,
  height,
}: DealCardProps & { width?: number; height?: number }) {
  const style: CSSProperties = { boxSizing: "border-box" };
  if (width) {
    style.width = width;
  }
  if (height) {
    style.height = height;
  }

  return <DealCardView deal={deal} style={style} isOverlay />;
}
