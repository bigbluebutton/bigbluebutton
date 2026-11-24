import React, { useCallback, useEffect, useRef } from 'react';

export type ResizeEdge = 'top' | 'right' | 'bottom' | 'left';

export interface ResizeHandleProps {
  /** the physical edge of the box the handle sits on; dragging away from the box grows it */
  edge: ResizeEdge;
  dataTest: string;
  disabled?: boolean;
  /** renders the handle inside a div with this class (the markup re-resizable used) */
  wrapperClassName?: string;
  /** overrides the default handle box (10 px across the edge, centred on it) */
  handleStyle?: React.CSSProperties;
  onResizeStart?: () => void;
  /** the growth in px since the drag started, at most once per animation frame */
  onResize?: (delta: number) => void;
  onResizeEnd?: (delta: number) => void;
}

const DEFAULT_STYLES: Record<ResizeEdge, React.CSSProperties> = {
  top: {
    width: '100%', height: 10, top: -5, left: 0, cursor: 'row-resize',
  },
  bottom: {
    width: '100%', height: 10, bottom: -5, left: 0, cursor: 'row-resize',
  },
  left: {
    width: 10, height: '100%', top: 0, left: -5, cursor: 'col-resize',
  },
  right: {
    width: 10, height: '100%', top: 0, right: -5, cursor: 'col-resize',
  },
};

const growth = (edge: ResizeEdge, dx: number, dy: number) => {
  switch (edge) {
    case 'right': return dx;
    case 'left': return -dx;
    case 'bottom': return dy;
    default: return -dy;
  }
};

/**
 * A resize handle on one edge of a box, on Pointer Events with pointer capture. It reports how far the
 * user dragged; the box's size and its limits live in the layout state and the CSS. Primary button only.
 */
const ResizeHandle: React.FC<ResizeHandleProps> = ({
  edge,
  dataTest,
  disabled = false,
  wrapperClassName,
  handleStyle,
  onResizeStart,
  onResize,
  onResizeEnd,
}) => {
  const start = useRef<{ x: number; y: number } | null>(null);
  const latest = useRef(0);
  const frame = useRef<number | null>(null);

  const cancelFrame = () => {
    if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    frame.current = null;
  };

  useEffect(() => cancelFrame, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    latest.current = 0;
    onResizeStart?.();
  }, [onResizeStart]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    latest.current = growth(edge, e.clientX - start.current.x, e.clientY - start.current.y);
    if (frame.current !== null) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = null;
      onResize?.(latest.current);
    });
  }, [edge, onResize]);

  const finish = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const delta = growth(edge, e.clientX - start.current.x, e.clientY - start.current.y);
    start.current = null;
    cancelFrame();
    if (e.currentTarget.releasePointerCapture && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    onResizeEnd?.(delta);
  }, [edge, onResizeEnd]);

  if (disabled) return null;

  const handle = (
    <div
      data-test={dataTest}
      role="presentation"
      style={{
        position: 'absolute',
        userSelect: 'none',
        touchAction: 'none',
        ...DEFAULT_STYLES[edge],
        ...handleStyle,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
    />
  );
  return wrapperClassName ? <div className={wrapperClassName}>{handle}</div> : handle;
};

export default ResizeHandle;
