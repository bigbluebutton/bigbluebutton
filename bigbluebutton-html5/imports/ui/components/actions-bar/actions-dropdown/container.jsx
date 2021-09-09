import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PresentationPodService from '/imports/ui/components/presentation-pod/service';
import ActionsDropdown from './component';
import { LayoutContextFunc } from '../../layout/context';

const ActionsDropdownContainer = (props) => {
  const { layoutContextSelector } = LayoutContextFunc;

  const sidebarContent = layoutContextSelector.selectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutContextSelector.selectInput((i) => i.sidebarNavigation);
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

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

export default withTracker(() => {
  const presentations = Presentations.find({ 'conversion.done': true }).fetch();
  return ({
    presentations,
    isDropdownOpen: Session.get('dropdownOpen'),
    setPresentation: PresentationUploaderService.setPresentation,
    podIds: PresentationPodService.getPresentationPodIds(),
  });
})(ActionsDropdownContainer);
