import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import CaptionsService from '/imports/ui/components/captions/service';
import WriterMenu from './component';

const WriterMenuContainer = props => <WriterMenu {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => mountModal(null),
  availableLocales: CaptionsService.getAvailableLocales(),
  takeOwnership: locale => CaptionsService.takeOwnership(locale),
}))(WriterMenuContainer));
