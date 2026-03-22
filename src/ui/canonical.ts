/**
 * Canonical UI surface for Drivengo CRM.
 *
 * **New and touched feature code:** import from `../ui/canonical` or `../ui/kit` (same exports).
 * Do not add imports from legacy bridges (`../ui/Button`, `../ui/Badge`, …) — ESLint blocks them
 * outside `src/ui/*` bridge files.
 *
 * **Controlled migration:** replace legacy bridge imports only when the change is localized and
 * API mapping is obvious (e.g. `Badge tone=` → `variant=`). No mass codemods without a boundary map.
 *
 * **Tokens:** prefer Tailwind `ui-*` semantic utilities (`border-ui-border`, `text-ui-caption`, …)
 * over legacy `border-border`, `text-12`, `rounded-12` in files you edit.
 *
 * Legacy `src/ui/Button.tsx` (and siblings) remain as compatibility bridges until all call sites
 * are migrated; they are not re-exported here to avoid duplicate component types.
 */
export * from "./kit";
