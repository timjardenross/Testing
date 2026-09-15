import { useId } from "react";
function localTime(value: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return value;
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export function Field({
  label,
  value,
  onChange,
  options,
  type = "text",
  wide = false,
  hint = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[] | { value: string; label: string }[];
  type?: string;
  wide?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className={wide ? "field wide" : "field"}>
      <label htmlFor={id}>{label}</label>
      {options ? (
        <select
          id={id}
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option
              key={typeof o === "string" ? o : o.value}
              value={typeof o === "string" ? o : o.value}
            >
              {typeof o === "string" ? o : o.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          id={id}
          type={type}
          min={type === "number" ? 0 : undefined}
          value={type === "datetime-local" ? localTime(value) : value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) =>
            onChange(
              type === "datetime-local" && e.target.value
                ? new Date(e.target.value).toISOString()
                : e.target.value,
            )
          }
        />
      )}{" "}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
