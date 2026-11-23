import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { act, render } from '@testing-library/react';
import { NavBarEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/nav-bar/enums';
import { ActionsBarEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/actions-bar/enums';
import { SidekickAreaPanelEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/panel/enums';
import PluginNavBarUiCommandsHandler from './nav-bar/handler';
import PluginActionsBarUiCommandsHandler from './actions-bar/handler';
import PluginSidekickAreaUiCommandsHandler from './sidekick-area/handler';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { INITIAL_INPUT_STATE } from '/imports/ui/components/layout/initState';

// The plugin ui-commands that drive layout state. They only dispatch semantic actions; today only
// the layout engine reads SET_HAS_NAVBAR and SET_HAS_ACTIONBAR, so the CSS layout must keep
// honouring these dispatches.

const dispatch = vi.fn();
let input: typeof INITIAL_INPUT_STATE;

vi.mock('/imports/ui/components/layout/context', () => ({
  layoutDispatch: () => dispatch,
  layoutSelectInput: (selector: (i: unknown) => unknown) => selector(input),
}));

vi.mock('/imports/ui/services/features', () => ({
  useIsChatEnabled: () => true,
  useIsMultiFunctionalModeEnabled: () => false,
  useIsSharedNotesEnabled: () => true,
}));

const fire = (name: string, detail: unknown) => act(() => {
  window.dispatchEvent(new CustomEvent(name, { detail }));
});

describe('plugin layout ui-commands', () => {
  beforeEach(() => {
    dispatch.mockReset();
    input = structuredClone(INITIAL_INPUT_STATE);
  });

  afterEach(() => vi.clearAllMocks());

  it('navBar.setDisplayNavBar dispatches SET_HAS_NAVBAR', () => {
    const { unmount } = render(<PluginNavBarUiCommandsHandler />);
    fire(NavBarEnum.SET_DISPLAY_NAV_BAR, { displayNavBar: false });
    expect(dispatch).toHaveBeenCalledWith({ type: ACTIONS.SET_HAS_NAVBAR, value: false });
    unmount();
    fire(NavBarEnum.SET_DISPLAY_NAV_BAR, { displayNavBar: true });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('actionsBar.setDisplayActionBar dispatches SET_HAS_ACTIONBAR', () => {
    render(<PluginActionsBarUiCommandsHandler />);
    fire(ActionsBarEnum.SET_DISPLAY_ACTIONS_BAR, { displayActionBar: false });
    expect(dispatch).toHaveBeenCalledWith({ type: ACTIONS.SET_HAS_ACTIONBAR, value: false });
  });

  it('a sidekick panel opens the sidebar content on that panel', () => {
    input.sidebarContent.isOpen = false;
    render(<PluginSidekickAreaUiCommandsHandler />);
    fire(SidekickAreaPanelEnum.OPEN, { id: PANELS.CHAT });
    expect(dispatch.mock.calls.map(([a]) => a.type)).toEqual([
      ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN, ACTIONS.SET_ID_CHAT_OPEN, ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    ]);
    expect(dispatch).toHaveBeenCalledWith({ type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL, value: PANELS.CHAT });
  });

  it('closing the displayed sidekick panel closes the sidebar content', () => {
    input.sidebarContent.isOpen = true;
    input.sidebarContent.sidebarContentPanel = PANELS.CHAT;
    render(<PluginSidekickAreaUiCommandsHandler />);
    fire(SidekickAreaPanelEnum.CLOSE, { id: PANELS.CHAT });
    expect(dispatch).toHaveBeenCalledWith({ type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN, value: false });
    expect(dispatch).toHaveBeenCalledWith({ type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL, value: PANELS.NONE });
  });
});
