"use client";

import { useEffect, useRef, useState } from "react";

import { inputClass, labelClass, primaryButtonClass } from "@/lib/utils";

interface SearchResult {
  label: string;
  lat: number;
  lng: number;
}

export function PlaceAutocompleteForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isSelectedQuery = Boolean(selected && selected.label === query);
  const showResults = !isSelectedQuery && query.trim().length >= 2 && results.length > 0;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2 || isSelectedQuery) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isSelectedQuery]);

  function selectResult(result: SearchResult) {
    setSelected(result);
    setQuery(result.label);
  }

  async function handleSubmit(formData: FormData) {
    await action(formData);
    formRef.current?.reset();
    setQuery("");
    setSelected(null);
    setResults([]);
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <label htmlFor="place-search" className={labelClass}>
          Place name
        </label>
        <input
          id="place-search"
          type="text"
          autoComplete="off"
          required
          placeholder="Search for a place, e.g. Eiffel Tower"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          className={inputClass}
        />
        {loading && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Searching…</p>
        )}
        {showResults && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-black/[.08] bg-white shadow-lg dark:border-white/[.145] dark:bg-zinc-900">
            {results.map((result, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => selectResult(result)}
                  className="block w-full px-3 py-2 text-left text-sm text-black hover:bg-black/[.04] dark:text-zinc-50 dark:hover:bg-white/[.06]"
                >
                  {result.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {!selected && query.trim().length >= 2 && !loading && results.length === 0 && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            No matches yet — keep typing or try a different spelling.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes (optional)
        </label>
        <textarea id="notes" name="notes" rows={2} className={inputClass} />
      </div>

      <input type="hidden" name="name" value={selected?.label ?? query} />
      <input type="hidden" name="formattedAddress" value={selected?.label ?? ""} />
      <input type="hidden" name="lat" value={selected?.lat ?? ""} />
      <input type="hidden" name="lng" value={selected?.lng ?? ""} />

      <div>
        <button type="submit" disabled={!selected} className={`${primaryButtonClass} disabled:opacity-40`}>
          Add place
        </button>
        {!selected && query.trim().length > 0 && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            Select a place from the search results above to add it.
          </p>
        )}
      </div>
    </form>
  );
}
