import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PresentationPodService from '/imports/ui/components/presentation-pod/service';
import ActionsDropdown from './component';
import LayoutContext from '../../layout/context';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Settings from '/imports/ui/services/settings';
import LayoutService from '/imports/ui/components/layout/service';

const ActionsDropdownContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { input } = layoutContextState;
  const { sidebarContent, sidebarNavigation } = input;

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
    settingsLayout: selectedLayout?.replace('Push', ''),
    pushLayout: LayoutService.setMeetingLayout,
    showPushLayout: LAYOUT_CONFIG.layoutControlInActionsMenu,
  });
})(ActionsDropdownContainer);
