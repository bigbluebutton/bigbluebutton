import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ReaderMenu from './component';
import CaptionsService from '/imports/ui/components/captions/service';

const ReaderMenuContainer = (props) => <ReaderMenu {...props} />;

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
  activateCaptions: (locale, settings) => CaptionsService.activateCaptions(locale, settings),
  getCaptionsSettings: () => CaptionsService.getCaptionsSettings(),
  ownedLocales: CaptionsService.getOwnedLocales(),
}))(ReaderMenuContainer);
