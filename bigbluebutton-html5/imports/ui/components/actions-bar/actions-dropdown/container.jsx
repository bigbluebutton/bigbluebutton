import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import ActionsDropdown from './component';
import { layoutSelectInput, layoutDispatch, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';
import { isCameraAsContentEnabled, isTimerFeatureEnabled } from '/imports/ui/services/features';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';

const ActionsDropdownContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i) => i.isRTL);
  const { pluginsProvidedAggregatedState } = useContext(PluginsContext);
  let actionButtonDropdownItems = [];
  if (pluginsProvidedAggregatedState.actionButtonDropdownItems) {
    actionButtonDropdownItems = [...pluginsProvidedAggregatedState.actionButtonDropdownItems];
  }

  return (
    <ActionsDropdown
      {...{
        layoutContextDispatch,
        sidebarContent,
        sidebarNavigation,
        isMobile,
        isRTL,
        actionButtonDropdownItems,
        ...props,
      }}
    />
  );
};

export default withTracker(() => {
  const presentations = Presentations.find({ 'conversion.done': true }).fetch();
  return {
    presentations,
    isTimerFeatureEnabled: isTimerFeatureEnabled(),
    isDropdownOpen: Session.get('dropdownOpen'),
    setPresentation: PresentationUploaderService.setPresentation,
    isCameraAsContentEnabled: isCameraAsContentEnabled(),
  };
})(ActionsDropdownContainer);
