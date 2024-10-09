import {
  useCallback, useEffect, useMemo, useRef,
} from 'react';

interface Handlers {
  startObserving(): void;
  stopObserving(): void;
}

const useStickyScroll = (stickyElement: HTMLElement | null, onResizeOf: HTMLElement | null) => {
  const elHeight = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const handlers = useRef<Handlers>({
    startObserving: () => {},
    stopObserving: () => {},
  });

  const observer = useMemo(
    () => new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { target } = entry;
        if (target instanceof HTMLElement) {
          if (target.offsetHeight > elHeight.current) {
            elHeight.current = target.offsetHeight;
            if (stickyElement) {
              // eslint-disable-next-line no-param-reassign
              stickyElement.scrollTop = stickyElement.scrollHeight + stickyElement.clientHeight;
            }
          } else {
            elHeight.current = 0;
          }
        }
      });
    }),
    [],
  );

  handlers.current.startObserving = useCallback(() => {
    if (!onResizeOf) return;
    clearTimeout(timeout.current);
    observer.observe(onResizeOf);
  }, [onResizeOf]);

  handlers.current.stopObserving = useCallback(() => {
    if (!onResizeOf) return;
    timeout.current = setTimeout(() => {
      observer.unobserve(onResizeOf);
    }, 500);
  }, [onResizeOf]);

  useEffect(
    () => () => {
      observer.disconnect();
    },
    [],
  );

  return handlers.current;
};

export default useStickyScroll;
