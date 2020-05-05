import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';

import BreakoutCreateModalComponent  from './component';


import ActionsBarService from '/imports/ui/components/actions-bar/service';


const BreakoutCreateModalContainer = props => <BreakoutCreateModalComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal, userLocks }) => {
  return ({
    closeModal: () => { mountModal(null); },
  });
})(BreakoutCreateModalContainer));
