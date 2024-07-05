import {
  useCallback, useEffect, useMemo, useRef,
} from 'react';

interface Handlers {
  startObserving(): void;
  stopObserving(): void;
}

const useStickyScroll = (el: HTMLElement | null) => {
  const elHeight = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const handlers = useRef<Handlers>({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    startObserving: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    stopObserving: () => {},
  });

  const observer = useMemo(
    () => new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { target } = entry;
        if (target instanceof HTMLElement) {
          if (target.offsetHeight > elHeight.current) {
            elHeight.current = target.offsetHeight;
            target.scrollTop = target.scrollHeight + target.clientHeight;
          } else {
            elHeight.current = 0;
          }
        }
      });
    }),
    [],
  );

  handlers.current.startObserving = useCallback(() => {
    if (!el) return;
    clearTimeout(timeout.current);
    observer.observe(el);
  }, [el]);

  handlers.current.stopObserving = useCallback(() => {
    if (!el) return;
    timeout.current = setTimeout(() => {
      observer.unobserve(el);
    }, 500);
  }, [el]);

  useEffect(
    () => () => {
      observer.disconnect();
    },
    [],
  );

  return handlers.current;
};

export default useStickyScroll;
