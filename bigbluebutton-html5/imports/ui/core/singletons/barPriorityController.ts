import { makeVar } from '@apollo/client';
import {
  BarItemDescriptor,
  BarItemPriority,
  BarKey,
  OverflowMenuEntry,
} from '/imports/ui/components/common/bar-overflow/types';

// Higher is more important: the lowest priority collapses first, and ESSENTIAL never does.
export const BAR_PRIORITY_WEIGHTS = {
  PLUGIN: 0,
  NORMAL: 50,
  ESSENTIAL: 100,
} as const;

export const PLUGIN_ID_PREFIX = 'plugin:';

export type BarPriorityState = {
  items: BarItemDescriptor[];
  entriesById: ReadonlyMap<string, OverflowMenuEntry[]>;
  overflowIds: string[];
  expanded: boolean;
};

type BarsPriorityState = Record<BarKey, BarPriorityState>;

const createBarState = (): BarPriorityState => ({
  items: [],
  entriesById: new Map(),
  overflowIds: [],
  expanded: false,
});

const barsPriorityStateVar = makeVar<BarsPriorityState>({
  navBar: createBarState(),
  actionsBar: createBarState(),
});

const getBarsOverflowSettings = () => window.meetingClientSettings?.public?.layout?.barsOverflow;

export const isBarsOverflowEnabled = (): boolean => getBarsOverflowSettings()?.enabled !== false;

export const getBarItemPriority = (
  bar: BarKey,
  id: string,
  fallback: BarItemPriority,
): BarItemPriority => {
  const settings = getBarsOverflowSettings();
  if (settings?.enabled === false) return BAR_PRIORITY_WEIGHTS.ESSENTIAL;
  // Plugin items always give up their place before native ones, whatever the config says.
  if (id.startsWith(PLUGIN_ID_PREFIX)) return BAR_PRIORITY_WEIGHTS.PLUGIN;

  const configured = settings?.priority?.[bar]?.[id];
  return Number.isInteger(configured)
    ? Math.max(configured, BAR_PRIORITY_WEIGHTS.PLUGIN + 1)
    : fallback;
};

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id, i) => id === b[i]);

class BarPriorityController {
  // eslint-disable-next-line class-methods-use-this
  getBar(bar: BarKey): BarPriorityState {
    return barsPriorityStateVar()[bar];
  }

  setItems(bar: BarKey, items: BarItemDescriptor[]): void {
    this.update(bar, () => ({
      items: items.map((item) => ({
        ...item,
        priority: getBarItemPriority(bar, item.id, item.priority),
      })),
    }));
  }

  setEntries(bar: BarKey, id: string, entries: OverflowMenuEntry[] | null): void {
    this.update(bar, ({ entriesById }) => {
      if (entries === null) {
        if (!entriesById.has(id)) return null;
        const next = new Map(entriesById);
        next.delete(id);
        return { entriesById: next };
      }
      if (entriesById.get(id) === entries) return null;
      return { entriesById: new Map(entriesById).set(id, entries) };
    });
  }

  setOverflow(bar: BarKey, overflowIds: string[]): void {
    this.update(bar, (previous) => (sameIds(previous.overflowIds, overflowIds) ? null : { overflowIds }));
  }

  setExpanded(bar: BarKey, expanded: boolean): void {
    this.update(bar, (previous) => (previous.expanded === expanded ? null : { expanded }));
  }

  // eslint-disable-next-line class-methods-use-this
  reset(bar: BarKey): void {
    barsPriorityStateVar({ ...barsPriorityStateVar(), [bar]: createBarState() });
  }

  // eslint-disable-next-line class-methods-use-this
  private update(
    bar: BarKey,
    updater: (previous: BarPriorityState) => Partial<BarPriorityState> | null,
  ): void {
    const state = barsPriorityStateVar();
    const changes = updater(state[bar]);
    if (!changes) return;
    barsPriorityStateVar({ ...state, [bar]: { ...state[bar], ...changes } });
  }
}

export const barPriorityController = new BarPriorityController();

// onNextChange calls a listener once, so it re-adds itself; being the same
// function, the remover returned by the first call still removes it.
export const subscribeToBarPriorityState = (onStoreChange: () => void) => {
  const onNext = () => {
    onStoreChange();
    barsPriorityStateVar.onNextChange(onNext);
  };
  return barsPriorityStateVar.onNextChange(onNext);
};

export default barPriorityController;
