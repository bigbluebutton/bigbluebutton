import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PresentationPodService from '/imports/ui/components/presentation-pod/service';
import ActionsDropdown from './component';
import { layoutSelectInput, layoutDispatch } from '../../layout/context';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Settings from '/imports/ui/services/settings';
import LayoutService from '/imports/ui/components/layout/service';

const ActionsDropdownContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const layoutContextDispatch = layoutDispatch();

  return (
    <ActionsDropdown {...{
      layoutContextDispatch,
      sidebarContent,
      sidebarNavigation,
      ...props,
    }}
    />
  );
};

const LAYOUT_CONFIG = Meteor.settings.public.layout;

export default withTracker(() => {
  const presentations = Presentations.find({ 'conversion.done': true }).fetch();
  const AppSettings = Settings.application;
  const { selectedLayout } = AppSettings;
  return ({
    presentations,
    isDropdownOpen: Session.get('dropdownOpen'),
    setPresentation: PresentationUploaderService.setPresentation,
    podIds: PresentationPodService.getPresentationPodIds(),
    hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
    settingsLayout: selectedLayout,
    setMeetingLayout: LayoutService.setMeetingLayout,
    showPushLayout: LAYOUT_CONFIG.layoutControlInActionsMenu,
  });
})(ActionsDropdownContainer);
