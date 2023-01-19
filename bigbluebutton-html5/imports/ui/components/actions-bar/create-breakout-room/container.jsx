import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import BreakoutRoomService from '/imports/ui/components/breakout-room/service';
import CreateBreakoutRoomModal from './component';
import { isImportSharedNotesFromBreakoutRoomsEnabled, isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled } from '/imports/ui/services/features';

const METEOR_SETTINGS_APP = Meteor.settings.public.app;

const CreateBreakoutRoomContainer = (props) => {
  const { setAllowUserToChooseABreakout } = METEOR_SETTINGS_APP.breakouts;
  const setCaptureBreakoutWhiteboard = METEOR_SETTINGS_APP.breakouts.setCaptureBreakoutWhiteboard
                                    && isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled();
  const setCaptureBreakoutNotes = METEOR_SETTINGS_APP.breakouts.setCaptureBreakoutNotes
                                    && isImportSharedNotesFromBreakoutRoomsEnabled();
  const { amIModerator } = props;
  return (
    amIModerator
    && (
      <CreateBreakoutRoomModal 
        {...props}  
        {...{
          setAllowUserToChooseABreakout,
          setCaptureBreakoutWhiteboard,
          setCaptureBreakoutNotes,
        }}
      />
    )
  );
};

export default withTracker(() => ({
  createBreakoutRoom: ActionsBarService.createBreakoutRoom,
  getBreakouts: ActionsBarService.getBreakouts,
  getLastBreakouts: ActionsBarService.getLastBreakouts,
  getBreakoutUserWasIn: BreakoutRoomService.getBreakoutUserWasIn,
  getUsersNotJoined: ActionsBarService.getUsersNotJoined,
  sendInvitation: ActionsBarService.sendInvitation,
  breakoutJoinedUsers: ActionsBarService.breakoutJoinedUsers(),
  users: ActionsBarService.users(),
  groups: ActionsBarService.groups(),
  isMe: ActionsBarService.isMe,
  meetingName: ActionsBarService.meetingName(),
  amIModerator: ActionsBarService.amIModerator(),
  moveUser: ActionsBarService.moveUser,
}))(CreateBreakoutRoomContainer);
