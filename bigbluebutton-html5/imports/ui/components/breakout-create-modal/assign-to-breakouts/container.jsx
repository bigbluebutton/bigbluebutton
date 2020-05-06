import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Assign from './component';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import ChannelsService from '/imports/ui/components/channels/service';
import UserListService from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';

export default withTracker(() => ({
    createBreakoutRoom: ActionsBarService.createBreakoutRoom,
    users: ChannelsService.getUnassignedUsersInMasterChannel(
            UserListService.getUsersByMeetingWithoutMe(Auth.meetingID)),
    meetingName: ActionsBarService.meetingName()
}))(Assign);
