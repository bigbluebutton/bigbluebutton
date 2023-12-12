import React, { useContext } from 'react';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import ActionsDropdown from './component';
import { layoutSelectInput, layoutDispatch, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';
import { isCameraAsContentEnabled, isTimerFeatureEnabled } from '/imports/ui/services/features';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { useSubscription } from '@apollo/client';
import {
  PROCESSED_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';

const ActionsDropdownContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i) => i.isRTL);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let actionButtonDropdownItems = [];
  if (pluginsExtensibleAreasAggregatedState.actionButtonDropdownItems) {
    actionButtonDropdownItems = [...pluginsExtensibleAreasAggregatedState.actionButtonDropdownItems];
  }

  const { data: presentationData } = useSubscription(PROCESSED_PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  return (
    <ActionsDropdown
      {...{
        layoutContextDispatch,
        sidebarContent,
        sidebarNavigation,
        isMobile,
        isRTL,
        actionButtonDropdownItems,
        presentations,
        isTimerFeatureEnabled: isTimerFeatureEnabled(),
        isDropdownOpen: Session.get('dropdownOpen'),
        setPresentation: PresentationUploaderService.setPresentation,
        isCameraAsContentEnabled: isCameraAsContentEnabled(),
        ...props,
      }}
    />
  );
};

export default ActionsDropdownContainer;
