import {
  createContext,
  useContext,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../cn";
import { controlFocus } from "./controlStyles";

type RadioGroupCtx = {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

const RadioGroupContext = createContext<RadioGroupCtx | null>(null);

export type RadioGroupProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

export function RadioGroup({
  name,
  value,
  onValueChange,
  disabled,
  className,
  children,
}: RadioGroupProps) {
  const uid = useId();
  return (
    <RadioGroupContext.Provider
      value={{
        name: name ?? `radio-${uid}`,
        value,
        onValueChange,
        disabled,
      }}
    >
      <div
        role="radiogroup"
        className={cn("flex min-w-0 flex-col gap-ui-2", className)}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export type RadioItemProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "name" | "checked" | "onChange"
> & {
  value: string;
  label: ReactNode;
  description?: ReactNode;
};

export function RadioItem({
  className,
  id,
  value,
  label,
  description,
  disabled: disabledProp,
  ...props
}: RadioItemProps) {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error("RadioItem must be used inside RadioGroup");
  }
  const inputId = id ?? `${ctx.name}-${value}`;
  const disabled = disabledProp || ctx.disabled;

  return (
    <div className="flex min-w-0 gap-ui-2">
      <input
        id={inputId}
        type="radio"
        name={ctx.name}
        value={value}
        checked={ctx.value === value}
        disabled={disabled}
        onChange={() => ctx.onValueChange?.(value)}
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 border-ui-border accent-button-primary",
          "disabled:cursor-not-allowed disabled:opacity-ui-disabled",
          controlFocus,
          className
        )}
        {...props}
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={inputId}
          className={cn(
            "text-ui-body text-ui-text",
            disabled && "text-ui-text-muted"
          )}
        >
          {label}
        </label>
        {description ? (
          <p className="mt-ui-1 text-ui-caption text-ui-text-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
