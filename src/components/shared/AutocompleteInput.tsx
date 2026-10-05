"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A plain text input the user can type into freely, with live-filtered
 * suggestions dropped below as they type — unlike SearchableSelect, there's
 * no separate "click to open, then search" step.
 */
export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  options,
  placeholder,
  disabled = false,
}: {
  value: string;
  /** Fires on every keystroke, for a responsive controlled input. */
  onChange: (value: string) => void;
  /** Fires only when the user picks a suggestion — the signal for "this is final". */
  onSelect?: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase();
  const filtered = (query ? options.filter((o) => o.toLowerCase().includes(query)) : options).slice(0, 50);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      />
      {isOpen && !disabled && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.map((option) => (
            <li key={option}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(option);
                  onSelect?.(option);
                  setOpen(false);
                }}
                className="block w-full truncate px-3 py-2 text-left text-sm text-navy hover:bg-slate-50"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
