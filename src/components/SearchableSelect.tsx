"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableSelectItem = {
  id: string;
  label: string;
  groupLabel?: string;
};

export function SearchableSelect({
  items,
  value,
  onChange,
  name,
  placeholder,
  className,
}: {
  items: SearchableSelectItem[];
  value: string;
  onChange: (id: string) => void;
  name: string;
  placeholder: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(() => items.find((i) => i.id === value) ?? null, [items, value]);

  // While closed, always show the selected item's name rather than tracking it in state.
  const displayValue = open ? query : (selected?.label ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "" || (selected && query === selected.label)) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query, selected]);

  const rows = useMemo(
    () =>
      filtered.reduce<{ item: SearchableSelectItem; showGroupHeader: boolean }[]>((acc, item) => {
        const previousGroup = acc[acc.length - 1]?.item.groupLabel;
        acc.push({ item, showGroupHeader: item.groupLabel !== previousGroup });
        return acc;
      }, []),
    [filtered],
  );

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Keep the highlighted row (the current selection when just opened, or the
  // arrow-key cursor) visible instead of always scrolling to the list's top.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-index="${highlighted}"]`);
    el?.scrollIntoView({ block: "center" });
  }, [open, highlighted]);

  function selectItem(item: SearchableSelectItem) {
    onChange(item.id);
    setQuery(item.label);
    setOpen(false);
  }

  // Clicking an already-focused (but closed) input doesn't re-fire focus, so
  // both onFocus and onClick open the list; the guard keeps a second call
  // (e.g. focus immediately followed by click) from resetting live typing.
  function openDropdown() {
    if (open) return;
    setQuery(selected?.label ?? "");
    const selectedIndex = selected ? items.findIndex((i) => i.id === selected.id) : -1;
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name={name} value={value} />
      <input
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
          setOpen(true);
          if (value) onChange("");
        }}
        onFocus={(e) => {
          openDropdown();
          e.target.select();
        }}
        onClick={() => openDropdown()}
        onKeyDown={(e) => {
          if (!open) {
            if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const item = filtered[highlighted];
            if (item) selectItem(item);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className={`w-full ${className ?? ""}`}
        autoComplete="off"
      />
      {open &&
        (filtered.length === 0 ? (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-hairline bg-surface-raised p-3 text-sm text-ink-muted shadow-sm">
            No matches.
          </div>
        ) : (
          <ul
            ref={listRef}
            className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-hairline bg-surface-raised shadow-sm"
          >
            {rows.map(({ item, showGroupHeader }, index) => (
              <li key={item.id}>
                {showGroupHeader && item.groupLabel && (
                  <div className="sticky top-0 bg-surface-raised px-3 pt-2 pb-1 text-xs font-medium text-ink-muted">
                    {item.groupLabel}
                  </div>
                )}
                <button
                  type="button"
                  data-index={index}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectItem(item)}
                  className={`block w-full px-3 py-2.5 text-left text-sm ${
                    index === highlighted ? "bg-sage text-white" : "text-ink"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
