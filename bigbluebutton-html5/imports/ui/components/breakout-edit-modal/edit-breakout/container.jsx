import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import EditBreakout from './component';
import ChannelsService from '/imports/ui/components/channels/service';
import UserListService from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';
import ActionsBarService from '/imports/ui/components/actions-bar/service';


export default withTracker((props) => ({
    breakoutRoomUsers: UserListService.getUsersByMeetingWithoutMe(Auth.meetingID).filter(u => {
        return ChannelsService.getAllBreakoutRoomUsers(props.breakoutId)
                    .find(user => user.userId === u.userId) != undefined
      }),
    unassignedUsersInMasterChannel: ChannelsService.getUnassignedUsersInMasterChannel(
                                    UserListService.getUsersByMeetingWithoutMe(Auth.meetingID)),
                                    sendInvitation: ActionsBarService.sendInvitation,
    getUsersNotAssigned: ActionsBarService.getUsersNotAssigned,
    removeUser: UserListService.removeUser,
    getBreakoutMeetingUserId : ChannelsService.getBreakoutMeetingUserId
    
}))(EditBreakout);
