import { useCallback, useEffect } from 'react';
import {
  SidekickAreaCorePanelEnum,
  SidekickAreaOptionsPanelEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/panel/enums';
import {
  OpenSidekickAreaCorePanelCommandArguments,
  OpenSidekickAreaOptionsPanelCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/panel/types';
import logger from '/imports/startup/client/logger';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { useIsMultiFunctionalModeEnabled } from '/imports/ui/services/features';

const ALLOWED_CORE_PANELS: string[] = Object.values(SidekickAreaCorePanelEnum);

const REGISTRY_BACKED_CORE_PANELS: string[] = [
  PANELS.POLL,
  PANELS.TIMER,
  PANELS.BREAKOUT,
];

const PluginSidekickOptionsContainerUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();
  const { registeredApps } = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const {
    sidebarContentPanel: sidebarContentPanelAuxiliary,
    isOpen: isAuxiliaryOpen,
  } = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);
  const isMultiFunctionalModeEnabled = useIsMultiFunctionalModeEnabled();

  const selectPanel = useCallback((panel: string) => {
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

  const handleSidekickOptionsContainerOpen = useCallback((
    event: CustomEvent<OpenSidekickAreaOptionsPanelCommandArguments>,
  ) => {
    const genericContentId = event.detail?.id;

    if (!genericContentId) {
      logger.info({
        logCode: 'navigation_open_called_by_plugin',
      }, 'Plugin tried to open the navigation sidebar. Intentionally ignored.');
      return;
    }

    const panel = PANELS.GENERIC_CONTENT_SIDEKICK + genericContentId;

    if (!registeredApps?.[panel]) {
      logger.warn({
        logCode: 'plugin_sidekick_panel_open_unknown_id',
        extraInfo: { genericContentId },
      }, 'Plugin tried to open a sidekick panel that is not registered');
      return;
    }

    selectPanel(panel);
  }, [registeredApps, selectPanel]);

  const handleSidekickAreaCorePanelOpen = useCallback((
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

    if (REGISTRY_BACKED_CORE_PANELS.includes(panel) && !registeredApps?.[panel]) {
      logger.info({
        logCode: 'plugin_core_panel_open_unavailable',
        extraInfo: { panel },
      }, 'Plugin tried to open a core panel unavailable to this user. Ignored.');
      return;
    }

    selectPanel(panel);
  }, [registeredApps, selectPanel]);

  const handleSidekickOptionsContainerClose = useCallback(() => {
    logger.info({
      logCode: 'navigation_close_called_by_plugin',
    }, 'Plugin tried to close the navigation sidebar. Intentionally ignored.');
  }, []);

  useEffect(() => {
    window.addEventListener(
      SidekickAreaOptionsPanelEnum.OPEN,
      handleSidekickOptionsContainerOpen as EventListener,
    );
    window.addEventListener(
      SidekickAreaOptionsPanelEnum.OPEN_CORE_PANEL,
      handleSidekickAreaCorePanelOpen as EventListener,
    );
    window.addEventListener(
      SidekickAreaOptionsPanelEnum.CLOSE,
      handleSidekickOptionsContainerClose,
    );

    return () => {
      window.removeEventListener(
        SidekickAreaOptionsPanelEnum.OPEN,
        handleSidekickOptionsContainerOpen as EventListener,
      );
      window.removeEventListener(
        SidekickAreaOptionsPanelEnum.OPEN_CORE_PANEL,
        handleSidekickAreaCorePanelOpen as EventListener,
      );
      window.removeEventListener(
        SidekickAreaOptionsPanelEnum.CLOSE,
        handleSidekickOptionsContainerClose,
      );
    };
  }, [
    handleSidekickOptionsContainerOpen,
    handleSidekickAreaCorePanelOpen,
    handleSidekickOptionsContainerClose,
  ]);
  return null;
};

export default PluginSidekickOptionsContainerUiCommandsHandler;
