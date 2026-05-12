import { useCallback } from 'react';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';

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
