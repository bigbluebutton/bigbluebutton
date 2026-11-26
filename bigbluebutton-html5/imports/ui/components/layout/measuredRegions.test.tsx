import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { act, render } from '@testing-library/react';
import {
  getRegionSize, resetRegionSizes, useMeasureRegion, useRegionSize,
} from './measuredRegions';
import { ElementSize } from '/imports/ui/core/hooks/useElementSize';
import { ResizeObserverMock } from '../../../../test/setup';

const setBox = (element: Element, width: number, height: number) => {
  // eslint-disable-next-line no-param-reassign
  element.getBoundingClientRect = () => ({
    x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON: () => ({}),
  });
};

// The owner of a region measures its own element and publishes the size under the region's name
const Owner = ({ box }: { box: [number, number] }) => {
  const measure = useMeasureRegion<HTMLDivElement>('sidebarContent');
  const ref = React.useCallback((node: HTMLDivElement | null) => {
    if (node) setBox(node, box[0], box[1]);
    measure(node);
  }, []);
  return <div ref={ref} id="owner" />;
};

describe('measured regions', () => {
  let seen: (ElementSize | null)[];
  const Reader = () => {
    seen.push(useRegionSize('sidebarContent'));
    return null;
  };
  const withReader = (box: [number, number]) => (
    <>
      <Owner box={box} />
      <Reader />
    </>
  );

  beforeEach(() => {
    vi.useFakeTimers();
    seen = [];
    resetRegionSizes();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('has no size for a region nobody measures', () => {
    render(<Reader />);
    expect(seen.at(-1)).toBeNull();
    expect(getRegionSize('sidebarContent')).toBeNull();
  });

  it('publishes the owner size to readers elsewhere in the tree', () => {
    render(withReader([982, 124]));
    expect(seen.at(-1)).toEqual({ width: 982, height: 124 });
    expect(getRegionSize('sidebarContent')).toEqual({ width: 982, height: 124 });
  });

  it('updates readers when the owner box changes', () => {
    const { container } = render(withReader([982, 124]));
    const owner = container.querySelector('#owner')!;
    setBox(owner, 982, 244);
    act(() => ResizeObserverMock.trigger(owner, { width: 982, height: 244 }));
    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(seen.at(-1)).toEqual({ width: 982, height: 244 });
  });

  it('clears the size when the owner unmounts', () => {
    const { rerender } = render(withReader([196, 599]));
    rerender(<Reader />);
    expect(seen.at(-1)).toBeNull();
    expect(getRegionSize('sidebarContent')).toBeNull();
  });
});
