import { useEffect, useRef, useState } from "react";
import { TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface SearchInputProps {
  /** Current value (from URL params) */
  value: string;
  /** Called with the debounced value */
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  /** Debounce delay in ms */
  delay?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
  delay = 300,
}: SearchInputProps) {
  // Local state for immediate keystroke feedback
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync external value changes (e.g. browser back/forward)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setLocalValue(next);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(next);
    }, delay);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <TextField.Root
      size="2"
      name="search"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      style={{ flexGrow: 1 }}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon />
      </TextField.Slot>
    </TextField.Root>
  );
}
