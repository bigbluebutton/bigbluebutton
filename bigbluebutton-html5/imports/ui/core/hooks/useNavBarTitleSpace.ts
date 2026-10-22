import {
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  measureContentWidth,
  measureCurrentLayoutWidth,
} from '/imports/ui/components/common/bar-overflow/layout';
import { NAV_BAR_TITLE_RESERVED_WIDTH_MAX } from '/imports/ui/components/nav-bar/service';

// Natural width of the title, including the part its ellipsis hides, so the reservation does not
// shrink along with the title it reserves room for.
export const useTitleReservedWidth = (
  titleRef: RefObject<HTMLElement>,
  titleTextRef: RefObject<HTMLElement>,
  enabled: boolean,
  title?: string,
) => {
  const [naturalWidth, setNaturalWidth] = useState(0);

  useEffect(() => {
    const titleElement = titleRef.current;
    const textElement = titleTextRef.current;
    if (!enabled || !titleElement || !textElement || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const hiddenTextWidth = textElement.scrollWidth - textElement.clientWidth;
      setNaturalWidth(Math.ceil(titleElement.getBoundingClientRect().width + hiddenTextWidth));
    };
    const scheduleMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(titleElement);
    observer.observe(textElement);
    scheduleMeasure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [enabled, title]);

  return Math.min(naturalWidth, NAV_BAR_TITLE_RESERVED_WIDTH_MAX);
};

// Room the visible items leave for the title. It does not depend on the title's own width, so
// capping the title with it cannot feed back into the measurement.
export const useTitleRoom = (
  enabled: boolean,
  topRef: RefObject<HTMLElement>,
  titleRef: RefObject<HTMLElement>,
  overflowIds: ReadonlySet<string>,
  itemsKey: string,
) => {
  const [room, setRoom] = useState<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const observedRef = useRef(new Set<Element>());
  const frameRef = useRef(0);

  const measure = () => {
    frameRef.current = 0;
    const top = topRef.current;
    if (!top || !titleRef.current) return;
    const available = measureContentWidth(top) - measureCurrentLayoutWidth(top, titleRef.current);
    setRoom(Math.max(0, Math.floor(available)));
  };
  const measureRef = useRef(measure);
  useLayoutEffect(() => {
    measureRef.current = measure;
  });

  // A layout effect, so the observer exists when the effect below first runs.
  useLayoutEffect(() => {
    if (!enabled || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(() => measureRef.current());
    });
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
      observedRef.current = new Set();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [enabled]);

  // Items come and go, and an item collapsing changes the room without resizing anything the
  // observer watches.
  useLayoutEffect(() => {
    const observer = observerRef.current;
    const top = topRef.current;
    if (!observer || !top) return;
    const targets = new Set<Element>([top, ...Array.from(top.querySelectorAll('[data-overflow-item]'))]);
    observedRef.current.forEach((element) => {
      if (!targets.has(element)) observer.unobserve(element);
    });
    targets.forEach((element) => {
      if (!observedRef.current.has(element)) observer.observe(element);
    });
    observedRef.current = targets;
    if (!frameRef.current) frameRef.current = requestAnimationFrame(() => measureRef.current());
  }, [enabled, topRef, overflowIds, itemsKey]);

  return enabled ? room : null;
};
