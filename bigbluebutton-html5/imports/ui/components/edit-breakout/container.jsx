import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import EditBreakout from './component';
import ActionsBarService from '/imports/ui/components/actions-bar/service';

export default withTracker(() => ({
    allUsersInMeeting: UserListService.getUsersByMeeting(Auth.meetingID),
    breakoutRoomUsers: ChannelsService.getAllBreakoutRoomUsers(props.meetingIdentifier),
    unassignedUsersInMasterChannel: ChannelsService.getUnassignedUsersInMasterChannel(
                                    UserListService.getUsersByMeeting(Auth.meetingID))
}))(EditBreakout);
