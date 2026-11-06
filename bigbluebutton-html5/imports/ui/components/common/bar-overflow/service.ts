import { BAR_PRIORITY_WEIGHTS, PLUGIN_ID_PREFIX } from '/imports/ui/core/singletons/barPriorityController';
import {
  BarItemDescriptor,
  BarItemKind,
  ComputeOverflowParams,
  OverflowMenuEntry,
  OverflowMenuOptionEntry,
  PluginBarButton,
  PluginBarItem,
  UnorderedBarItemDescriptor,
} from './types';

export const OVERFLOWED_ATTRIBUTE = 'data-overflowed';

// Items change width on their own (a ticking recording timer, a plugin label), so restoring an
// item only when it fits exactly would toggle it, or a neighbour, on every 1px change.
export const RESTORE_HYSTERESIS = 4;

export const findOverflowSlot = (container: Element | null, id: string) => container?.querySelector(
  `[data-overflow-item="${CSS.escape(id)}"]`,
);

export const focusFirstIn = (element: Element | null | undefined, selector: string): boolean => {
  const target = element?.matches(selector) ? element : element?.querySelector(selector);
  if (!target) return false;
  (target as HTMLElement).focus();
  return document.activeElement === target;
};

export const focusFirstVisibleIn = (container: Element, selector: string) => {
  Array.from(container.querySelectorAll<HTMLElement>(selector))
    .find((element) => !element.closest(`[${OVERFLOWED_ATTRIBUTE}]`))
    ?.focus();
};

export const isBarItemDescriptor = (
  item: UnorderedBarItemDescriptor | false | undefined,
): item is UnorderedBarItemDescriptor => Boolean(item);

export const getPluginSlotId = (pluginItem: PluginBarItem): string => `${PLUGIN_ID_PREFIX}${pluginItem.id}`;

// The collapsed item stays mounted next to its (also mounted) menu row, so their data-test must differ.
export const getPluginOptionDataTest = (dataTest?: string): string | undefined => (
  dataTest ? `${dataTest}Option` : undefined
);

export const getPluginButtonOverflowEntry = (pluginItem: PluginBarButton): OverflowMenuOptionEntry => ({
  key: getPluginSlotId(pluginItem),
  label: pluginItem.label || pluginItem.tooltip,
  icon: pluginItem.icon,
  onClick: pluginItem.onClick,
  disabled: pluginItem.disabled,
  dataTest: getPluginOptionDataTest(pluginItem.dataTest),
});

const svgIdentities = new WeakMap<object, number>();
let nextSvgIdentity = 0;

const iconSignature = (icon: unknown): unknown => {
  if (!icon || typeof icon !== 'object') return icon;
  if ('iconName' in icon) return icon.iconName;
  // svgContent is a React element, which cannot be serialized, so its identity stands in for it.
  const svg = 'svgContent' in icon && icon.svgContent && typeof icon.svgContent === 'object'
    ? icon.svgContent
    : icon;
  if (!svgIdentities.has(svg)) {
    nextSvgIdentity += 1;
    svgIdentities.set(svg, nextSvgIdentity);
  }
  return `svg:${svgIdentities.get(svg)}`;
};

// Every field is serialized, so a field added to the entry types later changes the signature too.
const entrySignatureReplacer = (key: string, value: unknown): unknown => {
  // Handlers are called through a ref, so only their presence counts: BBBMenu renders an entry
  // without onClick as plain text.
  if (typeof value === 'function') return true;
  if (key === 'icon' || key === 'iconRight') return iconSignature(value);
  return value;
};

export const entriesSignature = (entries: OverflowMenuEntry[]): string => JSON.stringify(
  entries,
  entrySignatureReplacer,
);

export const itemsSignature = (items: BarItemDescriptor[]) => JSON.stringify(
  items.map(({
    id, priority, order, kind,
  }) => [id, priority, order, kind]),
);

export const isActiveEntry = (entry: OverflowMenuEntry) => 'active' in entry && !!entry.active;

export const isSeparatorEntry = (entry: OverflowMenuEntry) => 'isSeparator' in entry && !!entry.isSeparator;

// Text rows (no onClick) are not actionable, but they still count as menu entries.
export const isActionableEntry = (entry: OverflowMenuEntry) => (
  !isSeparatorEntry(entry) && 'onClick' in entry && typeof entry.onClick === 'function'
);

export const countMenuEntries = (entries: OverflowMenuEntry[] = []) => entries
  .filter((entry) => !isSeparatorEntry(entry)).length;

export const normalizeSeparators = (entries: OverflowMenuEntry[]): OverflowMenuEntry[] => {
  const result: OverflowMenuEntry[] = [];
  entries.forEach((entry) => {
    const previous = result[result.length - 1];
    if (isSeparatorEntry(entry) && (!previous || isSeparatorEntry(previous))) return;
    result.push(entry);
  });
  while (result.length && isSeparatorEntry(result[result.length - 1])) result.pop();
  return result;
};

const byOrder = (a: BarItemDescriptor, b: BarItemDescriptor) => a.order - b.order;

export const needsOverflowButton = (kind?: BarItemKind) => kind !== 'hide';

const isMenuItem = (item: BarItemDescriptor) => (item.kind ?? 'menu') === 'menu';

const byCollapseOrder = (a: BarItemDescriptor, b: BarItemDescriptor) => (
  a.priority - b.priority || b.order - a.order
);

export const computeOverflow = ({
  items,
  canOverflow,
  availableWidth,
  requiredWidth,
  previousOverflow,
  menuEntryCount,
}: ComputeOverflowParams): string[] => {
  const candidates = items
    .filter((item) => item.priority < BAR_PRIORITY_WEIGHTS.ESSENTIAL && canOverflow(item.id))
    .sort(byCollapseOrder);
  const wasOverflowed = new Set(previousOverflow);

  const entriesOf = (overflowed: BarItemDescriptor[]) => (menuEntryCount
    ? overflowed.reduce((sum, item) => sum + (isMenuItem(item) ? menuEntryCount(item.id) : 0), 0)
    : 0);
  const showsButton = (overflowed: BarItemDescriptor[]) => {
    const buttonItems = overflowed.filter((item) => needsOverflowButton(item.kind));
    if (!menuEntryCount) return buttonItems.length > 0;
    return buttonItems.some((item) => item.kind === 'expand') || entriesOf(buttonItems) > 0;
  };

  // A lone menu entry would turn the overflow button into that item's own button: nothing is
  // freed and the item seems to morph into the button, so it stays in place until a second one
  // joins it. Expanded-mode items add a "More tools" entry, which keeps the button a button.
  const collapse = (count: number) => {
    const overflowed = candidates.slice(0, count);
    if (!menuEntryCount || overflowed.some((item) => item.kind === 'expand')) return overflowed;
    if (entriesOf(overflowed) !== 1) return overflowed;
    return overflowed.filter((item) => !isMenuItem(item) || menuEntryCount(item.id) !== 1);
  };

  const fits = (overflowed: BarItemDescriptor[]) => {
    const hidden = new Set(overflowed.map((item) => item.id));
    const width = requiredWidth(hidden, showsButton(overflowed));
    const restoresAny = candidates.some((item) => !hidden.has(item.id) && wasOverflowed.has(item.id));
    return width <= availableWidth - (restoresAny ? RESTORE_HYSTERESIS : 0);
  };

  let overflowed = collapse(0);
  for (let count = 1; count <= candidates.length && !fits(overflowed); count += 1) {
    overflowed = collapse(count);
  }

  return [...overflowed].sort(byOrder).map((item) => item.id);
};
