// A bar's required width comes from how its groups actually lay out (gaps between items, margins,
// paddings, dividers and wrappers), with the overflow items as leaves the caller prices, so any
// set of hidden items can be priced without touching the DOM.

export type LayoutNode =
  | { type: 'item'; id: string }
  | { type: 'box'; element: Element; width: number }
  | { type: 'row'; element: Element; extra: number; gap: number; children: LayoutNode[] };

interface BuildOptions {
  itemIdOf: (element: Element) => string | undefined;
  // Priced as an empty in-flow box: the caller reserves its room another way.
  excluded?: Element | null;
}

interface WidthOptions {
  // undefined for an item that is not shown, so it takes no gap either.
  itemWidth: (id: string) => number | undefined;
}

const HORIZONTAL_PROPERTIES = {
  margin: ['marginLeft', 'marginRight'],
  padding: ['paddingLeft', 'paddingRight'],
  border: ['borderLeftWidth', 'borderRightWidth'],
} as const;

const horizontalSum = (style: CSSStyleDeclaration, box: keyof typeof HORIZONTAL_PROPERTIES) => (
  HORIZONTAL_PROPERTIES[box].reduce((sum, property) => sum + (parseFloat(style[property]) || 0), 0)
);

export const measureOuterWidth = (el: Element): number => el.getBoundingClientRect().width
  + horizontalSum(getComputedStyle(el), 'margin');

export const measureContentWidth = (el: HTMLElement): number => el.clientWidth
  - horizontalSum(getComputedStyle(el), 'padding');

const isOutOfFlow = (style: CSSStyleDeclaration) => style.display === 'none'
  || style.position === 'absolute'
  || style.position === 'fixed';

// The container's own children are always rows: the bar's groups stretch to share the free room,
// so their box says nothing about what they need.
export const buildBarLayout = (container: HTMLElement, options: BuildOptions): LayoutNode => {
  const { itemIdOf, excluded = null } = options;
  const items = Array.from(container.querySelectorAll('[data-overflow-item]'))
    .filter((element) => itemIdOf(element) !== undefined);

  const childNodes = (parent: Element, isGroupLevel: boolean): LayoutNode[] => Array.from(parent.children)
    .flatMap((child): LayoutNode[] => {
      const style = getComputedStyle(child);
      const id = itemIdOf(child);
      // A collapsed item is out of flow, but it is still priced by its last visible width.
      if (id !== undefined) return style.display === 'none' ? [] : [{ type: 'item', id }];
      if (isOutOfFlow(style)) return [];
      if (style.display === 'contents') return childNodes(child, false);
      if (child === excluded) return [{ type: 'box', element: child, width: horizontalSum(style, 'margin') }];
      if (isGroupLevel || items.some((item) => child.contains(item))) {
        return [{
          type: 'row',
          element: child,
          extra: horizontalSum(style, 'margin') + horizontalSum(style, 'padding')
            + horizontalSum(style, 'border'),
          gap: parseFloat(style.columnGap) || 0,
          children: childNodes(child, false),
        }];
      }
      return [{ type: 'box', element: child, width: measureOuterWidth(child) }];
    });

  return {
    type: 'row',
    element: container,
    extra: 0,
    gap: parseFloat(getComputedStyle(container).columnGap) || 0,
    children: childNodes(container, true),
  };
};

export const layoutWidth = (node: LayoutNode, options: WidthOptions): number | undefined => {
  if (node.type === 'item') return options.itemWidth(node.id);
  if (node.type === 'box') return node.width;
  const widths = node.children
    .map((child) => layoutWidth(child, options))
    .filter((width): width is number => width !== undefined);
  return node.extra
    + widths.reduce((sum, width) => sum + width, 0)
    + node.gap * Math.max(widths.length - 1, 0);
};

export const layoutRows = (node: LayoutNode): Element[] => (node.type === 'row'
  ? [node.element, ...node.children.flatMap(layoutRows)]
  : []);

export const layoutBoxes = (node: LayoutNode): Element[] => {
  if (node.type === 'box') return [node.element];
  return node.type === 'row' ? node.children.flatMap(layoutBoxes) : [];
};

// What the container's content needs as laid out now; collapsed items take no room.
export const measureCurrentLayoutWidth = (
  container: HTMLElement,
  excluded: Element | null = null,
): number => {
  const shownWidths = new Map<string, number>();
  container.querySelectorAll('[data-overflow-item]').forEach((element) => {
    const id = element.getAttribute('data-overflow-item');
    if (id !== null && !isOutOfFlow(getComputedStyle(element))) {
      shownWidths.set(id, measureOuterWidth(element));
    }
  });
  const layout = buildBarLayout(container, {
    itemIdOf: (element) => element.getAttribute('data-overflow-item') ?? undefined,
    excluded,
  });
  return layoutWidth(layout, { itemWidth: (id) => shownWidths.get(id) }) ?? 0;
};
