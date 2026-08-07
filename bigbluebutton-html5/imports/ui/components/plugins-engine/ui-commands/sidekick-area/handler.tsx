import { useCallback, useEffect } from 'react';
import {
  SidekickAreaCorePanelEnum,
  SidekickAreaPanelEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/panel/enums';
import {
  OpenSidekickAreaCorePanelCommandArguments,
  OpenSidekickAreaPanelCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/panel/types';
import logger from '/imports/startup/client/logger';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { useIsMultiFunctionalModeEnabled } from '/imports/ui/services/features';

// A plugin can dispatch the raw event, so the enum is not a boundary on its own.
const ALLOWED_CORE_PANELS: string[] = Object.values(SidekickAreaCorePanelEnum);

// These are the only core panels held in registeredApps, where registration already
// accounts for the user's role and for the feature being enabled.
const REGISTRY_BACKED_CORE_PANELS: string[] = [
  PANELS.POLL,
  PANELS.TIMER,
  PANELS.BREAKOUT,
];

const PluginSidekickAreaUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();
  const { registeredApps } = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const {
    sidebarContentPanel: sidebarContentPanelAuxiliary,
    isOpen: isAuxiliaryOpen,
  } = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);
  const isMultiFunctionalModeEnabled = useIsMultiFunctionalModeEnabled();

  const selectPanel = useCallback((panel: string) => {
    // Mirrors the navigation button: keep it in the auxiliary area, do not duplicate.
    const isInAuxiliaryPanel = isAuxiliaryOpen && sidebarContentPanelAuxiliary === panel;
    if (isMultiFunctionalModeEnabled && isInAuxiliaryPanel) return;

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: panel,
    });
  }, [
    layoutContextDispatch,
    isMultiFunctionalModeEnabled,
    isAuxiliaryOpen,
    sidebarContentPanelAuxiliary,
  ]);

  const handlePanelOpen = useCallback((
    event: CustomEvent<OpenSidekickAreaPanelCommandArguments>,
  ) => {
    const genericContentId = event.detail?.id;

    if (!genericContentId) {
      logger.info({
        logCode: 'plugin_sidekick_panel_open_without_id',
      }, 'Plugin tried to open a sidekick panel without an id. Ignored.');
      return;
    }

    const panel = PANELS.GENERIC_CONTENT_SIDEKICK + genericContentId;

    // An unregistered panel would open the sidebar content area empty.
    if (!registeredApps?.[panel]) {
      logger.warn({
        logCode: 'plugin_sidekick_panel_open_unknown_id',
        extraInfo: { genericContentId },
      }, 'Plugin tried to open a sidekick panel that is not registered');
      return;
    }

    selectPanel(panel);
  }, [registeredApps, selectPanel]);

  const handleCorePanelOpen = useCallback((
    event: CustomEvent<OpenSidekickAreaCorePanelCommandArguments>,
  ) => {
    const panel = event.detail?.panel;

    if (!panel || !ALLOWED_CORE_PANELS.includes(panel)) {
      logger.warn({
        logCode: 'plugin_core_panel_open_not_allowed',
        extraInfo: { panel },
      }, 'Plugin tried to open a core panel that is not allowed');
      return;
    }

    // Registration encodes role and feature flag, so an absent entry means the user
    // could not open this panel from the sidebar navigation either.
    if (REGISTRY_BACKED_CORE_PANELS.includes(panel) && !registeredApps?.[panel]) {
      logger.info({
        logCode: 'plugin_core_panel_open_unavailable',
        extraInfo: { panel },
      }, 'Plugin tried to open a core panel unavailable to this user. Ignored.');
      return;
    }

    selectPanel(panel);
  }, [registeredApps, selectPanel]);

  const handlePanelClose = useCallback(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }, [layoutContextDispatch]);

  useEffect(() => {
    window.addEventListener(
      SidekickAreaPanelEnum.OPEN,
      handlePanelOpen as EventListener,
    );
    window.addEventListener(
      SidekickAreaPanelEnum.OPEN_CORE_PANEL,
      handleCorePanelOpen as EventListener,
    );
    window.addEventListener(
      SidekickAreaPanelEnum.CLOSE,
      handlePanelClose,
    );

    return () => {
      window.removeEventListener(
        SidekickAreaPanelEnum.OPEN,
        handlePanelOpen as EventListener,
      );
      window.removeEventListener(
        SidekickAreaPanelEnum.OPEN_CORE_PANEL,
        handleCorePanelOpen as EventListener,
      );
      window.removeEventListener(
        SidekickAreaPanelEnum.CLOSE,
        handlePanelClose,
      );
    };
  }, [handlePanelOpen, handleCorePanelOpen, handlePanelClose]);
  return null;
};

export default PluginSidekickAreaUiCommandsHandler;
