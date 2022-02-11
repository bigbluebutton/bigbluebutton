import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import CaptionsService from '/imports/ui/components/captions/service';
import CaptionsReaderMenuContainer from '/imports/ui/components/actions-bar/captions/reader-menu/container';
import CaptionsButton from './component';
import Storage from '/imports/ui/services/storage/session';

const CAPTION_LOCALE = "captionLocale";

const CaptionsButtonContainer = (props) => <CaptionsButton {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  isActive: CaptionsService.isCaptionsActive(),
  handleOnClick: () => (CaptionsService.isCaptionsActive()
    ? CaptionsService.deactivateCaptions()
    : mountModal(<CaptionsReaderMenuContainer />)),
  ownedLocales: CaptionsService.getOwnedLocales(),
  selectedLocale: Storage.getItem(CAPTION_LOCALE),
}))(CaptionsButtonContainer));
