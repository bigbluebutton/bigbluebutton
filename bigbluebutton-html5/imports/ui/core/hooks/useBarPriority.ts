import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import {
  BarPriorityState,
  barPriorityController,
  isBarsOverflowEnabled,
  subscribeToBarPriorityState,
} from '/imports/ui/core/singletons/barPriorityController';
import {
  computeOverflow,
  countMenuEntries,
  itemsSignature,
  needsOverflowButton,
  OVERFLOWED_ATTRIBUTE,
} from '/imports/ui/components/common/bar-overflow/service';
import {
  LayoutNode,
  buildBarLayout,
  layoutBoxes,
  layoutRows,
  layoutWidth,
  measureContentWidth,
  measureOuterWidth,
} from '/imports/ui/components/common/bar-overflow/layout';
import {
  BarItemDescriptor,
  BarKey,
  OverflowMenuEntry,
} from '/imports/ui/components/common/bar-overflow/types';

interface UseBarPriorityParams {
  bar: BarKey;
  containerRef: RefObject<HTMLElement>;
  items: BarItemDescriptor[];
  reservedWidth?: number;
  // An in-flow element whose room is held by reservedWidth instead of its own (shrinking) width.
  excludedRef?: RefObject<HTMLElement>;
  overflowButtonRef?: RefObject<HTMLElement>;
}

interface UseBarPriorityResult {
  overflowIds: Set<string>;
  menuIds: string[];
  expandIds: string[];
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  isHidden: (id: string) => boolean;
  registerItem: (id: string) => ItemRefCallback;
  entriesById: ReadonlyMap<string, OverflowMenuEntry[]>;
}

type ItemRefCallback = (el: HTMLElement | null) => void;

const OVERFLOW_BUTTON_LAYOUT_ID = '\u0000overflowButton';

const STYLE_MUTATIONS = { attributes: true, attributeFilter: ['class', 'style'] };

const sameElements = (a: Element[], b: Element[]) => a.length === b.length
  && a.every((element, i) => element === b[i]);

// Re-observing an element already observed queues a fresh notification, which would
// schedule another recompute every frame, so each target is observed only when it changes.
const retarget = (
  observer: ResizeObserver | null,
  current: HTMLElement | null,
  next: HTMLElement | null,
): HTMLElement | null => {
  if (!observer || current === next) return current;
  if (current) observer.unobserve(current);
  if (next) observer.observe(next);
  return next;
};

// One snapshot per field: the items are written to the store after every change to them, and a
// snapshot of the whole bar state would render the bar once more each time.
const useBarState = <T>(bar: BarKey, select: (state: BarPriorityState) => T): T => (
  useSyncExternalStore(subscribeToBarPriorityState, () => select(barPriorityController.getBar(bar)))
);

export const useBarPriority = ({
  bar,
  containerRef,
  items,
  reservedWidth = 0,
  excludedRef,
  overflowButtonRef,
}: UseBarPriorityParams): UseBarPriorityResult => {
  const entriesById = useBarState(bar, (state) => state.entriesById);
  const overflowList = useBarState(bar, (state) => state.overflowIds);
  const expandedState = useBarState(bar, (state) => state.expanded);
  const setExpanded = useCallback(
    (value: boolean) => barPriorityController.setExpanded(bar, value),
    [bar],
  );

  // Callers build `items` inline, so it is keyed by content to keep recomputes off idle renders;
  // `items` is left out of the deps on purpose.
  const itemsKey = itemsSignature(items);
  const barItems = useMemo(() => items, [itemsKey]);
  const kindById = useMemo(
    () => new Map(barItems.map((item) => [item.id, item.kind ?? 'menu'])),
    [barItems],
  );

  const enabled = isBarsOverflowEnabled();
  const elementsRef = useRef(new Map<string, HTMLElement>());
  const widthsRef = useRef(new Map<string, number>());
  const refCallbacksRef = useRef(new Map<string, ItemRefCallback>());
  const observerRef = useRef<ResizeObserver | null>(null);
  const observedContainerRef = useRef<HTMLElement | null>(null);
  const observedButtonRef = useRef<HTMLElement | null>(null);
  const observedLayoutRef = useRef(new Set<Element>());
  const freshBoxesRef = useRef(new Set<Element>());
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const watchedLayoutRef = useRef<Element[]>([]);
  const frameRef = useRef(0);
  const expandedRef = useRef(false);
  const regularLayoutRef = useRef<{ layout: LayoutNode; items: BarItemDescriptor[] } | null>(null);
  const committedOverflowListRef = useRef<string[]>([]);
  const buttonWidthRef = useRef(0);
  const latestRef = useRef({ kindById, reservedWidth });

  const recompute = useCallback(() => {
    frameRef.current = 0;
    const container = containerRef.current;
    observedContainerRef.current = retarget(observerRef.current, observedContainerRef.current, container);
    if (!container) return;

    elementsRef.current.forEach((el, id) => {
      // A hidden item is laid out out of flow, so measuring it there would make the result
      // depend on its own visibility and oscillate at the threshold.
      if (el.hasAttribute(OVERFLOWED_ATTRIBUTE) && widthsRef.current.has(id)) return;
      widthsRef.current.set(id, measureOuterWidth(el));
    });

    const button = overflowButtonRef?.current ?? null;
    observedButtonRef.current = retarget(observerRef.current, observedButtonRef.current, button);
    const { kindById: currentKinds, reservedWidth: reserved } = latestRef.current;
    const { items: currentItems, entriesById: currentEntries } = barPriorityController.getBar(bar);
    // The button is content-aware, so its width depends on the result; it is only measured while
    // it is the idle placeholder, otherwise a single-entry icon would flip the result back and forth.
    const buttonInUse = committedOverflowListRef.current
      .some((id) => needsOverflowButton(currentKinds.get(id)));
    if (!buttonInUse) {
      buttonWidthRef.current = button ? measureOuterWidth(button) : 0;
    }

    // The expanded mode hides the regular items, and the bar may drop what only goes with them (the
    // presentation divider); priced from that DOM, the regular layout would look narrower and
    // restore the expanded items by itself. So it keeps the layout last seen outside of it, until
    // the items change.
    const regularLayout = regularLayoutRef.current;
    const keepRegularLayout = expandedRef.current && regularLayout?.items === currentItems;
    const idByElement = new Map(Array.from(elementsRef.current, ([id, el]) => [el, id]));
    const excluded = excludedRef?.current ?? null;
    const layout = keepRegularLayout ? regularLayout.layout : buildBarLayout(container, {
      itemIdOf: (element) => (element === button
        ? OVERFLOW_BUTTON_LAYOUT_ID
        : idByElement.get(element as HTMLElement)),
      excluded,
    });
    if (!expandedRef.current) regularLayoutRef.current = { layout, items: currentItems };
    // A divider or wrapper can appear, resize or change its margins without resizing any item or
    // the container: boxes are resize-observed, and rows and boxes are watched for new children
    // and for class or style changes (which is how a re-render restyles them).
    const rows = layoutRows(layout);
    const boxes = new Set(layoutBoxes(layout).filter((element) => element !== excluded));
    const observer = observerRef.current;
    if (observer && !keepRegularLayout) {
      observedLayoutRef.current.forEach((element) => {
        if (boxes.has(element)) return;
        observer.unobserve(element);
        freshBoxesRef.current.delete(element);
      });
      boxes.forEach((element) => {
        if (observedLayoutRef.current.has(element)) return;
        observer.observe(element);
        // Its first notification only reports the size this recompute just measured.
        freshBoxesRef.current.add(element);
      });
      observedLayoutRef.current = boxes;
    }
    const mutationObserver = mutationObserverRef.current;
    const watched = [...rows, ...boxes];
    if (mutationObserver && !keepRegularLayout && !sameElements(watchedLayoutRef.current, watched)) {
      mutationObserver.disconnect();
      rows.forEach((row) => mutationObserver.observe(row, { childList: true, ...STYLE_MUTATIONS }));
      boxes.forEach((box) => mutationObserver.observe(box, STYLE_MUTATIONS));
      watchedLayoutRef.current = watched;
    }
    const requiredWidth = (hidden: ReadonlySet<string>, withButton: boolean) => reserved
      + (layoutWidth(layout, {
        itemWidth: (id) => {
          if (id === OVERFLOW_BUTTON_LAYOUT_ID) return withButton ? buttonWidthRef.current : undefined;
          return hidden.has(id) ? undefined : (widthsRef.current.get(id) ?? 0);
        },
      }) ?? 0);

    const next = computeOverflow({
      items: currentItems,
      canOverflow: (id) => currentKinds.get(id) !== 'menu' || (currentEntries.get(id)?.length ?? 0) > 0,
      availableWidth: measureContentWidth(container),
      requiredWidth,
      previousOverflow: committedOverflowListRef.current,
      menuEntryCount: overflowButtonRef ? (id) => countMenuEntries(currentEntries.get(id)) : undefined,
    });
    barPriorityController.setOverflow(bar, next);
  }, [bar, containerRef, excludedRef, overflowButtonRef]);

  const scheduleRecompute = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(recompute);
  }, [recompute]);
  const scheduleRecomputeRef = useRef(scheduleRecompute);

  // Read after the commit by frame callbacks, or during it by a ref callback that only schedules
  // one, so a render React discards never reaches them.
  useLayoutEffect(() => {
    latestRef.current = { kindById, reservedWidth };
    scheduleRecomputeRef.current = scheduleRecompute;
  });

  useLayoutEffect(() => {
    barPriorityController.setItems(bar, barItems);
  }, [bar, barItems]);

  // The controller outlives the bar, which would otherwise mount again into the old overflow and
  // expanded mode.
  useEffect(() => () => barPriorityController.reset(bar), [bar]);

  useEffect(() => {
    if (!enabled || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver((entries) => {
      const changed = entries.filter(({ target }) => !freshBoxesRef.current.delete(target));
      if (changed.length > 0) scheduleRecompute();
    });
    observerRef.current = observer;
    elementsRef.current.forEach((el) => observer.observe(el));
    const mutationObserver = typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(scheduleRecompute);
    mutationObserverRef.current = mutationObserver;
    scheduleRecompute();
    return () => {
      observer.disconnect();
      mutationObserver?.disconnect();
      observerRef.current = null;
      mutationObserverRef.current = null;
      observedContainerRef.current = null;
      observedButtonRef.current = null;
      observedLayoutRef.current = new Set();
      freshBoxesRef.current = new Set();
      watchedLayoutRef.current = [];
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [enabled, scheduleRecompute]);

  useEffect(() => {
    if (enabled) scheduleRecompute();
  }, [enabled, barItems, entriesById, reservedWidth, scheduleRecompute]);

  const registerItem = useCallback((id: string) => {
    let callback = refCallbacksRef.current.get(id);
    if (!callback) {
      callback = (el) => {
        const previous = elementsRef.current.get(id);
        if (previous === el) return;
        const observer = observerRef.current;
        if (previous) observer?.unobserve(previous);
        if (el) {
          elementsRef.current.set(id, el);
          observer?.observe(el);
        } else {
          elementsRef.current.delete(id);
          widthsRef.current.delete(id);
          // Observing a new element already notifies, but a removal does not.
          if (observer) scheduleRecomputeRef.current();
        }
      };
      refCallbacksRef.current.set(id, callback);
    }
    return callback;
  }, []);

  useLayoutEffect(() => {
    committedOverflowListRef.current = overflowList;
  }, [overflowList]);

  const overflowIds = useMemo(() => new Set(overflowList), [overflowList]);
  const menuIds = useMemo(
    () => overflowList.filter((id) => kindById.get(id) === 'menu'),
    [overflowList, kindById],
  );
  const expandIds = useMemo(
    () => overflowList.filter((id) => kindById.get(id) === 'expand'),
    [overflowList, kindById],
  );

  useEffect(() => {
    if (expandedState && expandIds.length === 0) setExpanded(false);
  }, [expandedState, expandIds]);

  const expanded = expandedState && expandIds.length > 0;
  useLayoutEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);

  const isHidden = useCallback(
    (id: string) => (expanded ? !expandIds.includes(id) : overflowIds.has(id)),
    [expanded, expandIds, overflowIds],
  );

  return {
    overflowIds,
    menuIds,
    expandIds,
    expanded,
    setExpanded,
    isHidden,
    registerItem,
    entriesById,
  };
};

export default useBarPriority;
