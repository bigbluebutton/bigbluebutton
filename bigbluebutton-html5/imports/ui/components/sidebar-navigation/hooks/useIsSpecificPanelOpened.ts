import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';

// Selects the boolean directly (instead of the whole sidebarContent/
// sidebarContentAuxiliary object useIsPanelOpened reads) so
// use-context-selector's reference-equality check only re-renders this
// component when ITS OWN panel's open state flips, not on every sidebar
// panel toggle. Only use this for a fixed, statically-known panelId - for a
// dynamic/variable-length set of ids (e.g. looping over pinned apps), use
// useIsPanelOpened instead, since a parameterized hook can't be called a
// variable number of times per render.
const useIsSpecificPanelOpened = (panelId: string) => layoutSelectInput((i: Input) => (
  i.sidebarContent.sidebarContentPanel === panelId
  || (i.sidebarContentAuxiliary.isOpen === true && i.sidebarContentAuxiliary.sidebarContentPanel === panelId)
));

export default useIsSpecificPanelOpened;
