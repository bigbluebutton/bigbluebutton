import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import ChannelsService from '/imports/ui/components/channels/service';
import UserParticipants from './component';
import Auth from '/imports/ui/services/auth';

const UserParticipantsContainer = props => <UserParticipants {...props} />;


export default withTracker(props => ({
  allUsersInMeeting: UserListService.getUsersByMeeting(Auth.meetingID),
  breakoutRoomUsers: ChannelsService.getAllBreakoutRoomUsers(props.meetingIdentifier),
  allModerators: UserListService.getAllModerators(Auth.meetingID),
  unassignedUsersInMasterChannel: ChannelsService.getUnassignedUsersInMasterChannel(
                                  UserListService.getUsersByMeeting(Auth.meetingID))

}))(UserParticipantsContainer);
