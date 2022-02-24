import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import Service from '/imports/ui/components/captions/service';
import CaptionsReaderMenuContainer from '/imports/ui/components/captions/reader-menu/container';
import CaptionButton from './component';

const Container = (props) => <CaptionButton {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  isActive: Service.isCaptionsActive(),
  handleOnClick: () => (Service.isCaptionsActive()
    ? Service.deactivateCaptions()
    : mountModal(<CaptionsReaderMenuContainer />)),
}))(Container));
