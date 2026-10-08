"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, Search } from "lucide-react";

export type SearchableSelectOption = { value: string; label: string };

/**
 * A dropdown that behaves like a native <select> but lets the user either
 * type to filter or scroll through the full list — meant for fields backed
 * by a potentially long, dynamic list (properties, units, tenants).
 */
export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}: {
  id?: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // The field doubles as the search box — opening it clears to a blank,
  // typeable input rather than popping a second search row below a closed
  // button, so there's only ever one place to type.
  const open = () => {
    if (disabled) return;
    setQuery("");
    setOpen(true);
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
          isOpen ? "border-gold" : "border-slate-300"
        } ${disabled ? "cursor-not-allowed bg-slate-50" : "cursor-text bg-white"}`}
        onClick={() => !isOpen && open()}
      >
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          disabled={disabled}
          value={isOpen ? query : (selected?.label ?? "")}
          onFocus={open}
          onChange={(e) => {
            if (!isOpen) setOpen(true);
            setQuery(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full min-w-0 truncate bg-transparent text-navy placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              close();
            } else {
              open();
            }
          }}
          className="shrink-0 disabled:cursor-not-allowed"
        >
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">No matches</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      close();
                    }}
                    className={`block w-full truncate px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      option.value === value ? "bg-gold/10 font-medium text-gold" : "text-navy"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
