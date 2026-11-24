import {
  describe, expect, it, vi,
} from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useSidebarResize from './useSidebarResize';

describe('useSidebarResize', () => {
  const setup = () => {
    const dispatch = vi.fn();
    const attach = vi.fn();
    const { result } = renderHook(() => useSidebarResize('SET_WIDTH', dispatch, attach));
    const backdrop = document.createElement('div');
    backdrop.getBoundingClientRect = () => ({ width: 300, height: 700 }) as DOMRect;
    act(() => result.current.setBackdrop(backdrop));
    return {
      result, dispatch, attach, backdrop,
    };
  };

  it('hands the backdrop to the measuring ref', () => {
    const { attach, backdrop } = setup();
    expect(attach).toHaveBeenCalledWith(backdrop);
  });

  it('stores the dragged width from the drawn one, within 283.2 and 800 px', () => {
    const { result, dispatch } = setup();
    result.current.onResizeStart();
    result.current.onResize(50);
    expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
      type: 'SET_WIDTH',
      value: expect.objectContaining({ width: 350, height: 700 }),
    }));
    result.current.onResizeEnd(-100);
    expect(dispatch.mock.lastCall?.[0].value.width).toBe(283.2);
    result.current.onResizeEnd(900);
    expect(dispatch.mock.lastCall?.[0].value.width).toBe(800);
  });
});
