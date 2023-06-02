import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PresentationPodService from '/imports/ui/components/presentation-pod/service';
import ActionsDropdown from './component';
import { layoutSelectInput, layoutDispatch, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';

const ActionsDropdownContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i) => i.isRTL);

  return (
    <ActionsDropdown {...{
      layoutContextDispatch,
      sidebarContent,
      sidebarNavigation,
      isMobile,
      isRTL,
      ...props,
    }}
    />
  );
};

const ENABLE_CAMERA_AS_CONTENT = Meteor.settings.public.app.enableCameraAsContent;

export default withTracker(() => {
  const presentations = Presentations.find({ 'conversion.done': true }).fetch();
  return ({
    presentations,
    isDropdownOpen: Session.get('dropdownOpen'),
    setPresentation: PresentationUploaderService.setPresentation,
    podIds: PresentationPodService.getPresentationPodIds(),
    isCameraAsContentEnabled: ENABLE_CAMERA_AS_CONTENT,
  });
})(ActionsDropdownContainer);
