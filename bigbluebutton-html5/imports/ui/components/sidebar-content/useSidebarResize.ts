import { useCallback, useRef } from 'react';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';

/**
 * Resizing a sidebar panel from its handle. The width the user drags to is stored in the layout state;
 * the CSS layout renders it. Like the re-resizable panel it replaces, the stored width stays within the
 * sidebar's limits (283.2 px to 800 px), so a later drag starts from what the user sees.
 */
const useSidebarResize = (
  actionType: string,
  dispatch: DispatcherFunction,
  attach: (element: HTMLDivElement | null) => void,
) => {
  const backdrop = useRef<HTMLDivElement | null>(null);
  const start = useRef({ width: 0, height: 0 });

  const setBackdrop = useCallback((element: HTMLDivElement | null) => {
    backdrop.current = element;
    attach(element);
  }, [attach]);

  const report = useCallback((delta: number) => {
    const width = Math.min(
      Math.max(start.current.width + delta, DEFAULT_VALUES.sidebarContentMinWidth),
      DEFAULT_VALUES.sidebarContentMaxWidth,
    );
    dispatch({
      type: actionType,
      value: {
        width,
        height: start.current.height,
      },
    });
  }, [actionType, dispatch]);

  const onResizeStart = useCallback(() => {
    const box = backdrop.current?.getBoundingClientRect();
    start.current = { width: box?.width ?? 0, height: box?.height ?? 0 };
  }, []);

  return {
    setBackdrop, onResizeStart, onResize: report, onResizeEnd: report,
  };
};

export default useSidebarResize;
