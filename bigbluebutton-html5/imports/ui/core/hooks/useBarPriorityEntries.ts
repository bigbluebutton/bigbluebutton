import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  barPriorityController,
  isBarsOverflowEnabled,
} from '/imports/ui/core/singletons/barPriorityController';
import { entriesSignature } from '/imports/ui/components/common/bar-overflow/service';
import { BarKey, LooseEntry, OverflowMenuEntry } from '/imports/ui/components/common/bar-overflow/types';

export const useBarPriorityEntries = (bar: BarKey, id: string, entries: OverflowMenuEntry[]): void => {
  const enabled = isBarsOverflowEnabled();
  const latestEntriesRef = useRef(entries);
  const signature = entriesSignature(entries);

  // Layout effects run before the publishing effect below, which reads the ref too.
  useLayoutEffect(() => {
    latestEntriesRef.current = entries;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    // Callers pass inline onClick handlers; publishing them as-is would change the entries on
    // every render, so the published entries call whatever handler is current instead.
    const stableEntries = (latestEntriesRef.current as LooseEntry[]).map((entry) => {
      if (typeof entry.onClick !== 'function') return entry;
      return {
        ...entry,
        onClick: () => {
          const latest = (latestEntriesRef.current as LooseEntry[]).find((e) => e.key === entry.key);
          latest?.onClick?.();
        },
      };
    }) as OverflowMenuEntry[];

    barPriorityController.setEntries(bar, id, stableEntries);
    return () => barPriorityController.setEntries(bar, id, null);
  }, [enabled, bar, id, signature]);
};

interface RegisterBarPriorityEntriesProps {
  bar: BarKey;
  id: string;
  entries: OverflowMenuEntry[];
}

export const RegisterBarPriorityEntries = ({
  bar,
  id,
  entries,
}: RegisterBarPriorityEntriesProps): null => {
  useBarPriorityEntries(bar, id, entries);
  return null;
};

export default useBarPriorityEntries;
