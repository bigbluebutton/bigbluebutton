import {
  afterEach, beforeEach, describe, expect, it,
} from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { LayoutPresentationAreaUiDataNames, UiLayouts } from 'bigbluebutton-html-plugin-sdk';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data/hooks/consts';
import { UI_DATA_GETTER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data/getters/consts';
import useUpdatePresentationAreaContentForPlugin from './utils';
import { ACTIONS, PRESENTATION_AREA } from '/imports/ui/components/layout/enums';
import { Layout } from '/imports/ui/components/layout/layoutTypes';

// Characterization of the CURRENT_ELEMENT ui-data the plugins get. Today it is re-emitted on
// every layout-state change, geometry included, and getUiData() resolves only because of that
// churn: nothing answers the SDK's getter request. The listener-subscribed answer comes from a
// mount-time closure that stays current only because the reducer mutates the pile in place.

const CURRENT = LayoutPresentationAreaUiDataNames.CURRENT_ELEMENT;
type Pile = Layout['presentationAreaContentActions'];

const item = (content: string, open = true, genericContentId?: string) => ({
  type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
  value: { content, open, genericContentId },
});

const stateWith = (pile: Pile) => ({ presentationAreaContentActions: pile } as unknown as Layout);

describe('presentation-area CURRENT_ELEMENT ui-data', () => {
  let events: unknown[];
  const record = (e: Event) => events.push((e as CustomEvent).detail);

  beforeEach(() => {
    events = [];
    window.addEventListener(CURRENT, record);
  });

  afterEach(() => window.removeEventListener(CURRENT, record));

  it('emits the mapped pile on mount', () => {
    const pile = [item(PRESENTATION_AREA.WHITEBOARD_OPEN)] as unknown as Pile;
    const state = stateWith(pile);
    renderHook(() => useUpdatePresentationAreaContentForPlugin(state));
    expect(events.at(-1)).toEqual([
      { isOpen: true, currentElement: UiLayouts.WHITEBOARD, genericContentId: undefined },
    ]);
  });

  it('maps every content type', () => {
    const pile = [
      item(PRESENTATION_AREA.WHITEBOARD_OPEN),
      item(PRESENTATION_AREA.GENERIC_CONTENT, true, 'g1'),
      item(PRESENTATION_AREA.PINNED_NOTES),
      item(PRESENTATION_AREA.EXTERNAL_VIDEO),
      item(PRESENTATION_AREA.SCREEN_SHARE, false),
    ] as unknown as Pile;
    const state = stateWith(pile);
    renderHook(() => useUpdatePresentationAreaContentForPlugin(state));
    expect(events.at(-1)).toEqual([
      { isOpen: true, currentElement: UiLayouts.WHITEBOARD, genericContentId: undefined },
      { isOpen: true, currentElement: UiLayouts.GENERIC_CONTENT, genericContentId: 'g1' },
      { isOpen: true, currentElement: UiLayouts.PINNED_SHARED_NOTES, genericContentId: undefined },
      { isOpen: true, currentElement: UiLayouts.EXTERNAL_VIDEO, genericContentId: undefined },
      { isOpen: false, currentElement: UiLayouts.SCREEN_SHARE, genericContentId: undefined },
    ]);
  });

  it('re-emits on every new layout state, even when the pile is unchanged', () => {
    const pile = [item(PRESENTATION_AREA.WHITEBOARD_OPEN)] as unknown as Pile;
    const { rerender } = renderHook(({ s }) => useUpdatePresentationAreaContentForPlugin(s), {
      initialProps: { s: stateWith(pile) },
    });
    const before = events.length;
    rerender({ s: stateWith(pile) });
    rerender({ s: stateWith(pile) });
    expect(events.length).toBe(before + 2);
  });

  it('answers a listener subscription with the current pile, through the in-place mutation', () => {
    const pile = [item(PRESENTATION_AREA.WHITEBOARD_OPEN)] as unknown as Pile;
    const state = stateWith(pile);
    renderHook(() => useUpdatePresentationAreaContentForPlugin(state));
    pile.push(item(PRESENTATION_AREA.SCREEN_SHARE) as unknown as Pile[number]);
    events = [];
    act(() => {
      window.dispatchEvent(new CustomEvent(`${UI_DATA_LISTENER_SUBSCRIBED}-${CURRENT}`));
    });
    expect(events).toHaveLength(1);
    expect((events[0] as { currentElement: string }[]).map((e) => e.currentElement))
      .toEqual([UiLayouts.WHITEBOARD, UiLayouts.SCREEN_SHARE]);
  });

  it('answers a listener subscription with a stale pile when the pile is replaced instead', () => {
    const { rerender } = renderHook(({ s }) => useUpdatePresentationAreaContentForPlugin(s), {
      initialProps: { s: stateWith([item(PRESENTATION_AREA.WHITEBOARD_OPEN)] as unknown as Pile) },
    });
    rerender({
      s: stateWith([
        item(PRESENTATION_AREA.WHITEBOARD_OPEN), item(PRESENTATION_AREA.SCREEN_SHARE),
      ] as unknown as Pile),
    });
    events = [];
    act(() => {
      window.dispatchEvent(new CustomEvent(`${UI_DATA_LISTENER_SUBSCRIBED}-${CURRENT}`));
    });
    expect((events[0] as unknown[]).length).toBe(1);
  });

  it('does not answer the getter request that getUiData() sends', () => {
    const state = stateWith([item(PRESENTATION_AREA.WHITEBOARD_OPEN)] as unknown as Pile);
    renderHook(() => useUpdatePresentationAreaContentForPlugin(state));
    events = [];
    act(() => {
      window.dispatchEvent(new CustomEvent(`${UI_DATA_GETTER_SUBSCRIBED}-${CURRENT}`));
    });
    expect(events).toHaveLength(0);
  });
});
