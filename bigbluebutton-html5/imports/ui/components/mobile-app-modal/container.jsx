import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import MobileAppModal from './component';

const MobileAppModalContainer = (props) => <MobileAppModal {...props} />;

export default withTracker(() => {})(MobileAppModalContainer);
