"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A free-text input with a styled suggestion dropdown — unlike a native
 * `<input list>` + `<datalist>` (which renders as an unstyled OS popup that
 * doesn't match the app's design), this stays within our own visual
 * language. The user can still type anything; suggestions are just a
 * shortcut, never a forced choice.
 */
export function SuggestionInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  otherPlaceholder,
  allowOther = true,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  /** Shown once "Other" is picked, in place of `placeholder` — defaults to
   * `placeholder` itself if not given. */
  otherPlaceholder?: string;
  /** Adds an "Other" row at the end of the list that clears the field for
   * a custom value instead of inserting literal text. */
  allowOther?: boolean;
  className?: string;
}) {
  const [isOpen, setOpen] = useState(false);
  const [pickedOther, setPickedOther] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((s) => s.toLowerCase().includes(q));
  }, [suggestions, value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pickOther = () => {
    setPickedOther(true);
    onChange("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          if (pickedOther) setPickedOther(false);
          onChange(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        placeholder={pickedOther ? (otherPlaceholder ?? placeholder) : placeholder}
        autoComplete="off"
        className={
          className ??
          "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
        }
      />

      {isOpen && (filtered.length > 0 || allowOther) && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // mousedown (not click) so this fires before the input's
                    // blur/outside-click handler can close the dropdown first.
                    e.preventDefault();
                    onChange(suggestion);
                    setOpen(false);
                  }}
                  className={`block w-full truncate px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    suggestion === value ? "bg-gold/10 font-medium text-gold" : "text-navy"
                  }`}
                >
                  {suggestion}
                </button>
              </li>
            ))}
            {allowOther && (
              <li className={filtered.length > 0 ? "border-t border-slate-100" : undefined}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickOther();
                  }}
                  className="block w-full truncate px-3 py-2 text-left text-sm italic text-slate-500 hover:bg-slate-50"
                >
                  Other — type your own
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
