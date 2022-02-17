import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import ReaderMenu from './component';
import CaptionsService from '/imports/ui/components/captions/service';

const ReaderMenuContainer = (props) => <ReaderMenu {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => mountModal(null),
  activateCaptions: (locale, settings) => CaptionsService.activateCaptions(locale, settings),
  getCaptionsSettings: () => CaptionsService.getCaptionsSettings(),
  ownedLocales: CaptionsService.getOwnedLocales(),
}))(ReaderMenuContainer));
