import {
  useCallback, useEffect, useRef,
} from 'react';

interface Handlers {
  startObserving(): void;
  stopObserving(): void;
}

const useStickyScroll = (stickyElement: HTMLElement | null, onResizeOf: HTMLElement | null) => {
  const elHeight = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const observer = useRef<ResizeObserver | null>(null);
  const handlers = useRef<Handlers>({
    startObserving: () => {},
    stopObserving: () => {},
  });

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { target } = entry;
        if (target instanceof HTMLElement) {
          if (target.offsetHeight !== elHeight.current) {
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
    });
  }, [stickyElement]);

  handlers.current.startObserving = useCallback(() => {
    if (!onResizeOf) return;
    clearTimeout(timeout.current);
    observer.current?.observe(onResizeOf);
  }, [onResizeOf, observer.current]);

  handlers.current.stopObserving = useCallback(() => {
    if (!onResizeOf) return;
    timeout.current = setTimeout(() => {
      observer.current?.unobserve(onResizeOf);
    }, 500);
  }, [onResizeOf, observer.current]);

  useEffect(
    () => () => {
      observer.current?.disconnect();
    },
    [],
  );

  return handlers.current;
};

export default useStickyScroll;
