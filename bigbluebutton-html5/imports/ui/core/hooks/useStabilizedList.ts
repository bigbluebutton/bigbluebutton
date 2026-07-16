import { useEffect, useRef, useState } from 'react';

type GetId<T> = (t: T) => string | number;

export type UseStabilizedListOptions<T> = {
  getId: GetId<T>;
  expectedIds?: Array<string | number> | undefined;
  fallbackMs?: number;
  areEqual?: (a: T[], b: T[]) => boolean;
};

/**
 * useStabilizedList
 * - Stabilizes list updates coming from subscriptions by avoiding state updates
 *   when the logical set (by id) hasn't changed.
 * - When `expectedIds` is provided the hook will wait until *all* expected ids
 *   are present in `items` before switching the visible set (with an optional
 *   fallback timeout). This is useful for "pinned" / partial-subscription cases.
 * - When `expectedIds` is omitted the hook simply keeps `items` stable by id
 *   (prevents re-renders due to new array references with identical contents).
 */
export default function useStabilizedList<T>(
  items: T[],
  options: UseStabilizedListOptions<T>,
): T[] {
  const {
    getId,
    expectedIds,
    fallbackMs = 2000,
    areEqual,
  } = options;

  const [displayed, setDisplayed] = useState<T[]>([]);

  const displayedRef = useRef<T[]>(displayed);
  const fallbackTimerRef = useRef<number | null>(null);
  const pendingIdsRef = useRef<Array<string | number> | null>(null);

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  const defaultEqual = (a: T[], b: T[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      // Check both reference equality and ID to detect content updates with same ID
      if (a[i] !== b[i] || getId(a[i]) !== getId(b[i])) return false;
    }
    return true;
  };

  const equal = areEqual ?? defaultEqual;

  useEffect(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    const ids = expectedIds ?? null;

    // If no expectedIds provided -> just keep `items` stable by id
    if (!ids) {
      pendingIdsRef.current = null;
      if (!equal(displayedRef.current, items)) setDisplayed(items);
      return;
    }

    const expected = ids || [];

    // clear fallback timer when expectedIds becomes empty
    if (expected.length === 0) {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      pendingIdsRef.current = null;
      if (!equal(displayedRef.current, [])) setDisplayed([]);
      return;
    }

    const loadedIds = items.map(getId);
    const missing = expected.filter((id) => !loadedIds.includes(id));

    // if no missing ids -> we have a complete set; update displayed
    if (missing.length === 0) {
      const filtered = items.filter((m) => expected.includes(getId(m)));
      pendingIdsRef.current = null;
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (!equal(displayedRef.current, filtered)) setDisplayed(filtered);
      return;
    }

    // incomplete: set pending marker and keep current displayed
    pendingIdsRef.current = expected;

    // fallback: accept whatever we have after timeout
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    fallbackTimerRef.current = window.setTimeout(() => {
      const filtered = items.filter((m) => expected.includes(getId(m)));
      pendingIdsRef.current = null;
      fallbackTimerRef.current = null;
      if (!equal(displayedRef.current, filtered)) setDisplayed(filtered);
    }, fallbackMs);
  }, [items, expectedIds, fallbackMs, areEqual, getId]);

  // cleanup timer on unmount
  useEffect(() => () => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  return displayed;
}
