import { useCallback } from 'react';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { useIsMultiFunctionalModeEnabled } from '/imports/ui/services/features';

/**
 * Returns a `closePanel` function that dispatches the correct layout actions
 * depending on whether the panel is currently rendered in the auxiliary sidebar
 * (multi-functional mode) or in the primary sidebar.
 *
 * @param panelId - The PANELS enum value for this panel (e.g. PANELS.USERLIST).
 * @param onBeforeClose - Optional callback invoked before the layout dispatches.
 *                        Use this to run panel-specific cleanup (e.g. marking a
 *                        private chat as not-visible).
 */
const usePanelClose = (panelId: string, onBeforeClose?: (isInAuxiliaryPanel: boolean) => void) => {
  const layoutContextDispatch = layoutDispatch();
  const sidebarContentAuxiliary = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);
  const isInAuxiliaryPanel = sidebarContentAuxiliary.isOpen
    && sidebarContentAuxiliary.sidebarContentPanel === panelId;
  const isMultifunctionalModeEnabled = useIsMultiFunctionalModeEnabled();

  const closePanel = useCallback(() => {
    onBeforeClose?.(isMultifunctionalModeEnabled && isInAuxiliaryPanel);

    if (isMultifunctionalModeEnabled && isInAuxiliaryPanel) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN,
        value: false,
      });

      // Do not dispatch PANELS.NONE to the auxiliary panel, as we want it to keep track of which
      // panel is rendered there even when it's closed. This allows us to restore the correct panel
      // when re-opening the auxiliary sidebar.
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.NONE,
      });
    }
  }, [layoutContextDispatch, isInAuxiliaryPanel, onBeforeClose, isMultifunctionalModeEnabled]);

  return { closePanel, isInAuxiliaryPanel };
};

export default usePanelClose;
