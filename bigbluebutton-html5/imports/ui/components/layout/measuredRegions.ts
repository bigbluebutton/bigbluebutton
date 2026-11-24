import { useLayoutEffect, useSyncExternalStore } from 'react';
import useElementSize, { ElementSize } from '/imports/ui/core/hooks/useElementSize';

/**
 * Measured boxes of layout regions that components outside the region need: the camera dock (the
 * push-layout rate) and the sidebar content (the poll charts and the user list's crowd buttons). The
 * component that renders a region measures its own element and publishes the size here; readers get
 * the rendered size instead of a number computed from the window.
 */
export type MeasuredRegion = 'cameraDock' | 'sidebarContent';

const sizes = new Map<MeasuredRegion, ElementSize | null>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const setRegionSize = (region: MeasuredRegion, size: ElementSize | null) => {
  if ((sizes.get(region) ?? null) === size) return;
  sizes.set(region, size);
  notify();
};

export const getRegionSize = (region: MeasuredRegion): ElementSize | null => sizes.get(region) ?? null;

export const resetRegionSizes = () => {
  sizes.clear();
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The measured size of a region, or null while nothing renders it. */
export const useRegionSize = (region: MeasuredRegion): ElementSize | null => useSyncExternalStore(
  subscribe,
  () => getRegionSize(region),
);

/**
 * For the component that renders a region: a callback ref that measures and publishes its box. While
 * `hold` is true the last published size stays (a dock being dragged shrinks to one tile, but its
 * committed size is the one that counts); the current size is published again when it is released.
 */
export function useMeasureRegion<T extends Element>(
  region: MeasuredRegion,
  { hold = false }: { hold?: boolean } = {},
): (element: T | null) => void {
  const [ref, size] = useElementSize<T>();
  useLayoutEffect(() => {
    if (!hold) setRegionSize(region, size);
  }, [region, size, hold]);
  useLayoutEffect(() => () => setRegionSize(region, null), [region]);
  return ref;
}

export default {
  getRegionSize,
  useRegionSize,
  useMeasureRegion,
};
