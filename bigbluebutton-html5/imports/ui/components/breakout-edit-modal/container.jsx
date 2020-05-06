import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';

import BreakoutEditModalComponent  from './component';


import ActionsBarService from '/imports/ui/components/actions-bar/service';


const BreakoutEditModalContainer = props => <BreakoutEditModalComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal, userLocks }) => {
  return ({
    closeModal: () => { mountModal(null); },
  });
})(BreakoutEditModalContainer));
