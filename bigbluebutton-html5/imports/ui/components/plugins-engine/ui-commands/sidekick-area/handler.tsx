import { useCallback, useEffect } from 'react';
import {
  SidekickAreaCorePanelEnum,
  SidekickAreaPanelEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/panel/enums';
import {
  SidekickAreaPanelCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/panel/types';
import logger from '/imports/startup/client/logger';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { useIsMultiFunctionalModeEnabled } from '/imports/ui/services/features';

// A plugin can dispatch the raw event, so the enum alone is not a boundary.
const ALLOWED_CORE_PANELS: string[] = Object.values(SidekickAreaCorePanelEnum);

// The only core panels kept in registeredApps, whose registration already encodes the
// user's role and the feature flag.
const REGISTRY_BACKED_CORE_PANELS: string[] = [
  PANELS.POLL,
  PANELS.TIMER,
  PANELS.BREAKOUT,
];

const PluginSidekickAreaUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();
  const { registeredApps } = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const {
    sidebarContentPanel,
    isOpen: isSidebarContentOpen,
  } = layoutSelectInput((i: Input) => i.sidebarContent);
  const {
    sidebarContentPanel: sidebarContentPanelAuxiliary,
    isOpen: isAuxiliaryOpen,
  } = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);
  const isMultiFunctionalModeEnabled = useIsMultiFunctionalModeEnabled();

  const resolvePanel = useCallback((
    { id, panel }: SidekickAreaPanelCommandArguments,
  ): string | null => {
    if (id) {
      const genericContentPanel = PANELS.GENERIC_CONTENT_SIDEKICK + id;

      // An unregistered panel would open the sidebar content area empty.
      if (!registeredApps?.[genericContentPanel]) {
        logger.warn({
          logCode: 'plugin_sidekick_panel_unknown_id',
          extraInfo: { id },
        }, 'Plugin asked for a sidekick panel that is not registered');
        return null;
      }

      return genericContentPanel;
    }

    if (!panel) return null;

    if (!ALLOWED_CORE_PANELS.includes(panel)) {
      logger.warn({
        logCode: 'plugin_core_panel_not_allowed',
        extraInfo: { panel },
      }, 'Plugin asked for a core panel that is not allowed');
      return null;
    }

    if (REGISTRY_BACKED_CORE_PANELS.includes(panel) && !registeredApps?.[panel]) {
      logger.info({
        logCode: 'plugin_core_panel_unavailable',
        extraInfo: { panel },
      }, 'Plugin asked for a core panel unavailable to this user. Ignored.');
      return null;
    }

    return panel;
  }, [registeredApps]);

  const handlePanelOpen = useCallback((
    event: CustomEvent<SidekickAreaPanelCommandArguments>,
  ) => {
    const request = event.detail;

    if (!request?.id && !request?.panel) {
      logger.info({
        logCode: 'plugin_sidekick_panel_open_without_target',
      }, 'Plugin tried to open a sidekick panel without naming one. Ignored.');
      return;
    }

    const panel = resolvePanel(request);
    if (!panel) return;

    // Asking for a panel already on display while the auxiliary sidebar is open would
    // copy it there, showing the same content twice and dropping what was in it.
    const isDisplayedInSidebarContent = isSidebarContentOpen && sidebarContentPanel === panel;
    const isDisplayedInAuxiliary = isMultiFunctionalModeEnabled
      && isAuxiliaryOpen
      && sidebarContentPanelAuxiliary === panel;
    if (isDisplayedInSidebarContent || isDisplayedInAuxiliary) return;

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: panel,
    });
  }, [
    resolvePanel,
    layoutContextDispatch,
    isSidebarContentOpen,
    sidebarContentPanel,
    isMultiFunctionalModeEnabled,
    isAuxiliaryOpen,
    sidebarContentPanelAuxiliary,
  ]);

  const handlePanelClose = useCallback((
    event: CustomEvent<SidekickAreaPanelCommandArguments>,
  ) => {
    const request = event.detail;
    const namesAPanel = Boolean(request?.id || request?.panel);
    let panel: string | null = null;

    if (namesAPanel) {
      panel = resolvePanel(request);
      if (!panel) return;
    }

    // The named panel may be in the auxiliary sidebar rather than the primary one.
    const isInAuxiliaryPanel = isMultiFunctionalModeEnabled
      && isAuxiliaryOpen
      && panel !== null
      && sidebarContentPanelAuxiliary === panel;

    // Only close a panel that is on display, so a plugin does not close one it does
    // not own. Naming none closes the sidekick area.
    if (namesAPanel && panel !== sidebarContentPanel && !isInAuxiliaryPanel) return;

    if (isInAuxiliaryPanel) {
      // As in usePanelClose: the auxiliary sidebar keeps its panel while closed so the
      // core can restore it, so only isOpen flips.
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN,
        value: false,
      });
      return;
    }

    // Closing the primary sidebar closes the auxiliary with it, so this must run before
    // PANELS.NONE, which would otherwise be routed into the auxiliary.
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }, [
    resolvePanel,
    layoutContextDispatch,
    sidebarContentPanel,
    isMultiFunctionalModeEnabled,
    isAuxiliaryOpen,
    sidebarContentPanelAuxiliary,
  ]);

  useEffect(() => {
    window.addEventListener(
      SidekickAreaPanelEnum.OPEN,
      handlePanelOpen as EventListener,
    );
    window.addEventListener(
      SidekickAreaPanelEnum.CLOSE,
      handlePanelClose as EventListener,
    );

    return () => {
      window.removeEventListener(
        SidekickAreaPanelEnum.OPEN,
        handlePanelOpen as EventListener,
      );
      window.removeEventListener(
        SidekickAreaPanelEnum.CLOSE,
        handlePanelClose as EventListener,
      );
    };
  }, [handlePanelOpen, handlePanelClose]);
  return null;
};

export default PluginSidekickAreaUiCommandsHandler;
