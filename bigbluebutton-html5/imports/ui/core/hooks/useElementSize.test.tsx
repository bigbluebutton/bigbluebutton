import React, { useCallback } from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { act, render } from '@testing-library/react';
import useElementSize, { ElementSize } from './useElementSize';
import { ResizeObserverMock } from '../../../../test/setup';

// The element's border box is what the hook reports; jsdom has no layout, so tests set it.
const setBox = (element: Element, width: number, height: number) => {
  // eslint-disable-next-line no-param-reassign
  element.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}),
  });
};

const observe = (element: Element, width: number, height: number) => {
  setBox(element, width, height);
  act(() => ResizeObserverMock.trigger(element, { width, height }));
};

const flushFrame = () => act(() => {
  vi.advanceTimersByTime(20);
});

describe('useElementSize', () => {
  let sizes: (ElementSize | null)[];
  let element: HTMLDivElement | null;

  // Renders a div whose size the hook reports, and records every render's value
  const Probe = ({ show = true, initial = [100, 50] }: { show?: boolean; initial?: [number, number] }) => {
    const [ref, size] = useElementSize<HTMLDivElement>();
    sizes.push(size);
    // a stable callback, as components must pass: a new one per render re-attaches the element
    const attach = useCallback((node: HTMLDivElement | null) => {
      if (node) setBox(node, initial[0], initial[1]);
      element = node;
      ref(node);
    }, []);
    return show ? <div ref={attach} /> : null;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    sizes = [];
    element = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('measures the element as soon as it attaches, before the first paint', () => {
    render(<Probe initial={[982, 619]} />);
    expect(sizes[0]).toBeNull();
    expect(sizes.at(-1)).toEqual({ width: 982, height: 619 });
  });

  it('follows size changes once per animation frame', () => {
    render(<Probe />);
    const rendersBefore = sizes.length;
    observe(element!, 200, 80);
    observe(element!, 300, 90);
    observe(element!, 400, 100);
    expect(sizes.length, 'nothing until the frame').toBe(rendersBefore);
    flushFrame();
    expect(sizes.at(-1)).toEqual({ width: 400, height: 100 });
    expect(sizes.length, 'one render for the three changes').toBe(rendersBefore + 1);
  });

  it('does not re-render when the size did not change', () => {
    render(<Probe />);
    const rendersBefore = sizes.length;
    observe(element!, 100, 50);
    flushFrame();
    expect(sizes.length).toBe(rendersBefore);
  });

  it('keeps fractional sizes as the browser reports them', () => {
    render(<Probe initial={[981.8125, 123.71875]} />);
    expect(sizes.at(-1)).toEqual({ width: 981.8125, height: 123.71875 });
  });

  it('answers null and stops observing when the element goes away', () => {
    const { rerender } = render(<Probe />);
    const node = element!;
    rerender(<Probe show={false} />);
    expect(sizes.at(-1)).toBeNull();
    const rendersBefore = sizes.length;
    observe(node, 500, 500);
    flushFrame();
    expect(sizes.length, 'no update from a detached element').toBe(rendersBefore);
  });

  it('cancels a pending frame on unmount', () => {
    const { unmount } = render(<Probe />);
    observe(element!, 250, 125);
    unmount();
    const rendersBefore = sizes.length;
    flushFrame();
    expect(sizes.length).toBe(rendersBefore);
    expect(ResizeObserverMock.instances.size).toBe(0);
  });
});
