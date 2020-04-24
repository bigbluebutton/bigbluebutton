import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';

import AudioModal from './component';
//import Service from '../service';

import ActionsBarService from '/imports/ui/components/actions-bar/service';


const AudioModalContainer = props => <AudioModal {...props} />;

export default withModalMounter(withTracker(({ mountModal, userLocks }) => {
  return ({
    closeModal: () => { mountModal(null); },
    createBreakoutRoom: ActionsBarService.createBreakoutRoom,
    getBreakouts: ActionsBarService.getBreakouts,
    getUsersNotAssigned: ActionsBarService.getUsersNotAssigned,
    sendInvitation: ActionsBarService.sendInvitation,
    users: ActionsBarService.users(),
    meetingName: ActionsBarService.meetingName(),
  });
})(AudioModalContainer));
