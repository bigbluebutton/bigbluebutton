import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import BreakoutRoomService from '/imports/ui/components/breakout-room/service';
import CreateBreakoutRoomModal from './component';
import { isImportSharedNotesFromBreakoutRoomsEnabled, isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled } from '/imports/ui/services/features';
import { useSubscription } from '@apollo/client';
import {
  PROCESSED_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const METEOR_SETTINGS_APP = Meteor.settings.public.app;

const CreateBreakoutRoomContainer = (props) => {
  const { allowUserChooseRoomByDefault } = METEOR_SETTINGS_APP.breakouts;
  const captureWhiteboardByDefault = METEOR_SETTINGS_APP.breakouts.captureWhiteboardByDefault
                                    && isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled();
  const captureSharedNotesByDefault = METEOR_SETTINGS_APP.breakouts.captureSharedNotesByDefault
                                    && isImportSharedNotesFromBreakoutRoomsEnabled();
  const inviteModsByDefault = METEOR_SETTINGS_APP.breakouts.sendInvitationToAssignedModeratorsByDefault;

  const { data: presentationData } = useSubscription(PROCESSED_PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  return (
    amIModerator
    && (
      <CreateBreakoutRoomModal
        {...props}
        {...{
          allowUserChooseRoomByDefault,
          captureWhiteboardByDefault,
          captureSharedNotesByDefault,
          inviteModsByDefault,
          presentations,
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
  moveUser: ActionsBarService.moveUser,
}))(CreateBreakoutRoomContainer);
