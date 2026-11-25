import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import ResizeHandle, { ResizeHandleProps } from './ResizeHandle';

const setup = (props: Partial<ResizeHandleProps> = {}) => {
  const onResizeStart = vi.fn();
  const onResize = vi.fn();
  const onResizeEnd = vi.fn();
  const utils = render(
    <ResizeHandle
      edge={props.edge ?? 'right'}
      dataTest="handle"
      wrapperClassName={props.wrapperClassName}
      onResizeStart={onResizeStart}
      onResize={onResize}
      onResizeEnd={onResizeEnd}
    />,
  );
  const handle = utils.container.querySelector('[data-test="handle"]') as HTMLElement;
  return {
    ...utils, handle, onResizeStart, onResize, onResizeEnd,
  };
};

const frame = () => act(() => {
  vi.advanceTimersByTime(20);
});

describe('ResizeHandle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('reports the drag along its edge, once per animation frame, and the end', () => {
    const {
      handle, onResizeStart, onResize, onResizeEnd,
    } = setup();
    fireEvent.pointerDown(handle, { button: 0, clientX: 100, clientY: 50 });
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(handle, { clientX: 110, clientY: 50 });
    fireEvent.pointerMove(handle, { clientX: 130, clientY: 80 });
    expect(onResize).not.toHaveBeenCalled();
    frame();
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenLastCalledWith(30);
    fireEvent.pointerUp(handle, { clientX: 140, clientY: 80 });
    expect(onResizeEnd).toHaveBeenCalledWith(40);
  });

  it.each([
    ['right', 10, 0, 10],
    ['left', 10, 0, -10],
    ['bottom', 0, 10, 10],
    ['top', 0, 10, -10],
  ] as const)('a %s handle grows with the pointer moving away from the box', (edge, dx, dy, expected) => {
    const { handle, onResizeEnd } = setup({ edge });
    fireEvent.pointerDown(handle, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerUp(handle, { clientX: 100 + dx, clientY: 100 + dy });
    expect(onResizeEnd).toHaveBeenCalledWith(expected);
  });

  it('ignores buttons other than the primary one, and does nothing while disabled', () => {
    const { handle, onResizeStart, rerender } = setup();
    fireEvent.pointerDown(handle, { button: 2, clientX: 100, clientY: 100 });
    expect(onResizeStart).not.toHaveBeenCalled();
    rerender(<ResizeHandle edge="right" dataTest="handle" disabled onResizeStart={onResizeStart} />);
    expect(document.querySelector('[data-test="handle"]')).toBeNull();
  });

  it('wraps the handle when asked, keeping the old markup for selectors', () => {
    const { container } = setup({ wrapperClassName: 'resizeSidebarContentWrapper' });
    expect(container.querySelector('.resizeSidebarContentWrapper > [data-test="handle"]')).not.toBeNull();
  });

  it('cancels a pending frame when the drag ends', () => {
    const { handle, onResize, onResizeEnd } = setup();
    fireEvent.pointerDown(handle, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 5, clientY: 0 });
    fireEvent.pointerCancel(handle, { clientX: 5, clientY: 0 });
    frame();
    expect(onResize).not.toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalledWith(5);
  });

  it('captures the pointer for the drag and releases it at the end', () => {
    const capture = vi.fn();
    const release = vi.fn();
    const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
    proto.setPointerCapture = capture;
    proto.releasePointerCapture = release;
    proto.hasPointerCapture = () => true;
    const { handle, onResizeEnd } = setup({ edge: 'bottom' });
    fireEvent.pointerDown(handle, {
      button: 0, clientX: 0, clientY: 0, pointerId: 7,
    });
    fireEvent.pointerUp(handle, { clientX: 0, clientY: 12, pointerId: 7 });
    expect(capture).toHaveBeenCalled();
    expect(release).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalledWith(12);
    delete proto.setPointerCapture;
    delete proto.releasePointerCapture;
    delete proto.hasPointerCapture;
  });

  it('ends a cancelled drag where the last move left it, not at the cancel event\'s position', () => {
    const { handle, onResizeEnd } = setup();
    fireEvent.pointerDown(handle, { button: 0, clientX: 100, clientY: 50 });
    fireEvent.pointerMove(handle, { clientX: 130, clientY: 50 });
    fireEvent.pointerCancel(handle, { clientX: 0, clientY: 0 });
    expect(onResizeEnd).toHaveBeenCalledWith(30);
  });

  it('ends the drag when the pointer capture is lost', () => {
    const { handle, onResizeEnd } = setup();
    fireEvent.pointerDown(handle, { button: 0, clientX: 100, clientY: 50 });
    fireEvent.pointerMove(handle, { clientX: 120, clientY: 50 });
    fireEvent(handle, new Event('lostpointercapture', { bubbles: true }));
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).toHaveBeenCalledWith(20);
    fireEvent.pointerUp(handle, { clientX: 300, clientY: 50 });
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  });

  it('ends the drag on a move with no button pressed (the release happened elsewhere)', () => {
    const { handle, onResize, onResizeEnd } = setup();
    fireEvent.pointerDown(handle, { button: 0, clientX: 100, clientY: 50 });
    fireEvent.pointerMove(handle, {
      clientX: 120, clientY: 50, buttons: 1, pointerType: 'mouse',
    });
    fireEvent.pointerMove(handle, {
      clientX: 400, clientY: 50, buttons: 0, pointerType: 'mouse',
    });
    frame();
    expect(onResizeEnd).toHaveBeenCalledWith(20);
    expect(onResize).not.toHaveBeenCalledWith(300);
  });

  it('ignores moves and ends without a drag', () => {
    const { handle, onResize, onResizeEnd } = setup();
    fireEvent.pointerMove(handle, { clientX: 5, clientY: 0 });
    fireEvent.pointerUp(handle, { clientX: 5, clientY: 0 });
    frame();
    expect(onResize).not.toHaveBeenCalled();
    expect(onResizeEnd).not.toHaveBeenCalled();
  });
});
