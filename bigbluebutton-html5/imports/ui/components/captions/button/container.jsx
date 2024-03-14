import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/captions/service';
import CaptionButton from './component';

const Container = (props) => <CaptionButton {...props} />;

export default withTracker(({ setIsOpen }) => ({
  isActive: Service.isCaptionsActive(),
  handleOnClick: () => (Service.isCaptionsActive()
    ? Service.deactivateCaptions()
    : setIsOpen(true)),
}))(Container);
