import { useCallback } from 'react';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';

// Returns a checker function rather than a single boolean because some
// callers (e.g. PinnedApps) need to check a dynamic, variable-length list of
// panel ids from one hook call inside a .map() - a parameterized hook can't
// be called a variable number of times per render. Callers that only ever
// check one fixed, statically-known panel id should use
// useIsSpecificPanelOpened instead, which avoids re-rendering on unrelated
// panel toggles.
const useIsPanelOpened = () => {
  const { sidebarContentPanel } = layoutSelectInput((i: Input) => i.sidebarContent);
  const {
    sidebarContentPanel: sidebarContentPanelAuxiliary,
    isOpen: sidebarContentPanelAuxiliaryIsOpened,
  } = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);

  return useCallback((panelId: string) => {
    return (
      sidebarContentPanel === panelId
      || (sidebarContentPanelAuxiliaryIsOpened === true && sidebarContentPanelAuxiliary === panelId)
    );
  }, [sidebarContentPanel, sidebarContentPanelAuxiliary, sidebarContentPanelAuxiliaryIsOpened]);
};

export default useIsPanelOpened;
