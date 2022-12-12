import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { SmartLinkShare } from './component';

import { layoutSelect } from '/imports/ui/components/layout/context';
import { isMobile } from '/imports/ui/components/layout/utils';

const SmartLinkShareContainer = (props) => <SmartLinkShare {...{ ...props }} />;

export default withTracker(() => {
  const isRTL = layoutSelect((i) => i.isRTL);
  return {
    isRTL,
    isMobile: isMobile(),
  };
})(SmartLinkShareContainer);
