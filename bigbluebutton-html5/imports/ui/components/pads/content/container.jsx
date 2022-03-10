import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PadContent from './component';
import Service from '/imports/ui/components/pads/service';

const Container = (props) => <PadContent {...props} />;

export default withTracker(({ externalId }) => {
  const content = Service.getPadContent(externalId);

  return {
    content,
  };
})(Container);
