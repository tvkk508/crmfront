/**
 * Legacy Badge API — `tone` prop maps to canonical `ui/kit/Badge` `variant`.
 *
 * Canonical for new code: `import { Badge } from "../ui/kit"` with `variant` + `badgeSize`.
 */
import { Badge as KitBadge, type BadgeProps as KitBadgeProps } from "./kit/Badge";

export type BadgeTone = "neutral" | "accent" | "success" | "warn" | "danger";

export type BadgeProps = Omit<KitBadgeProps, "variant" | "badgeSize"> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", ...props }: BadgeProps) {
  return <KitBadge variant={tone} {...props} />;
}
