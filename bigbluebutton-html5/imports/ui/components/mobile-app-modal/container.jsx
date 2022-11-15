import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import MobileAppModal from './component';
import { withModalMounter } from '/imports/ui/components/common/modal/service';

const MobileAppModalContainer = (props) => <MobileAppModal {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => {
    mountModal(null);
  },
}))(MobileAppModalContainer));
