import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { SmartMediaShare } from './component';

import { layoutSelect } from '/imports/ui/components/layout/context';
import { isMobile } from '/imports/ui/components/layout/utils';

const SmartMediaShareContainer = (props) => (
  <SmartMediaShare {...{
    ...props,
  }}
  />
);

export default withTracker(() => {
  const isRTL = layoutSelect((i) => i.isRTL);
  return {
    isRTL,
    isMobile: isMobile(),
  };
})(SmartMediaShareContainer);
