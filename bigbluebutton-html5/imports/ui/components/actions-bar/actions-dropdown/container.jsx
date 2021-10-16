import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PresentationPodService from '/imports/ui/components/presentation-pod/service';
import ActionsDropdown from './component';
import LayoutContext from '../../layout/context';
import getFromUserSettings from '/imports/ui/services/users-settings';

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
  return ({
    presentations,
    isDropdownOpen: Session.get('dropdownOpen'),
    setPresentation: PresentationUploaderService.setPresentation,
    podIds: PresentationPodService.getPresentationPodIds(),
    hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
  });
})(ActionsDropdownContainer);
