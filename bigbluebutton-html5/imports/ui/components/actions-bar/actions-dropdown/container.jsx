import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PresentationPodService from '/imports/ui/components/presentation-pod/service';
import ActionsDropdown from './component';
import NewLayoutContext from '../../layout/context/context';

const ActionsDropdownContainer = (props) => {
  const { newLayoutContextState, ...rest } = props;
  return <ActionsDropdown {...rest} />;
};

export default withTracker(() => {
  const presentations = Presentations.find({ 'conversion.done': true }).fetch();
  return ({
    presentations,
    setPresentation: PresentationUploaderService.setPresentation,
    podIds: PresentationPodService.getPresentationPodIds(),
  });
})(NewLayoutContext.withConsumer(ActionsDropdownContainer));
