import {
  useCallback, useEffect, useRef,
} from 'react';

interface Handlers {
  startObserving(): void;
  stopObserving(): void;
}

const useStickyScroll = (
  stickyElement: HTMLElement | null,
  onResizeOf: HTMLElement | null,
  operator: 'ne' | 'gt' = 'gt',
) => {
  const elHeight = useRef(stickyElement?.offsetHeight ?? 0);
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
          let elementHeightChanged = false;
          switch (operator) {
            case 'ne': {
              elementHeightChanged = target.offsetHeight !== elHeight.current;
              break;
            }
            case 'gt':
            default: {
              elementHeightChanged = target.offsetHeight > elHeight.current;
              break;
            }
          }
          if (elementHeightChanged) {
            elHeight.current = target.offsetHeight;
            if (stickyElement) {
              // eslint-disable-next-line no-param-reassign
              stickyElement.scrollTop = stickyElement.scrollHeight + stickyElement.clientHeight;
            }
          }
        }
      });
    });
  }, [stickyElement, operator]);

  handlers.current.startObserving = useCallback(() => {
    if (!onResizeOf) return;
    clearTimeout(timeout.current);
    observer.current?.observe(onResizeOf);
  }, [onResizeOf]);

  handlers.current.stopObserving = useCallback(() => {
    if (!onResizeOf) return;
    timeout.current = setTimeout(() => {
      observer.current?.unobserve(onResizeOf);
    }, 500);
  }, [onResizeOf]);

  useEffect(
    () => () => {
      observer.current?.disconnect();
    },
    [],
  );

  return handlers.current;
};

export default useStickyScroll;
