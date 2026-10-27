import React from 'react';
import { defineMessages, MessageDescriptor } from 'react-intl';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import { RoomModePreset } from './settings';

export interface RoomModeDefinition {
  // Stored as meeting.roomMode: the server accepts ^[a-z][a-z0-9-]{0,31}$.
  id: string;
  icon: React.ElementType;
  name: MessageDescriptor;
  hint: MessageDescriptor;
  // Appended to the data-test prefix of the place that lists the mode.
  testId: string;
  // What picking the mode applies.
  preset: RoomModePreset;
}

// Both modes leave the cameras visible to everyone and keep the locks on join,
// or the other locks would miss whoever arrives later.
const AUTOMATIC = {
  webcamsOnlyForModerator: false,
  lockOnJoin: true,
};

const intlMessages = defineMessages({
  className: {
    id: 'app.preFlight.roomMode.modes.class.name',
    description: 'Name of the class room mode',
  },
  classHint: {
    id: 'app.preFlight.roomMode.modes.class.hint',
    description: 'One-line hint under the class room mode',
  },
  meetingName: {
    id: 'app.preFlight.roomMode.modes.meeting.name',
    description: 'Name of the meeting room mode',
  },
  meetingHint: {
    id: 'app.preFlight.roomMode.modes.meeting.hint',
    description: 'One-line hint under the meeting room mode',
  },
});

/**
 * The modes a moderator can pick before starting a room. Data only: the
 * presets (what each mode applies) and the in-session mode change will both
 * read this same list. A mode joins this list together with the change that
 * applies it.
 */
const ROOM_MODES: RoomModeDefinition[] = [
  {
    id: 'class',
    icon: SchoolIcon,
    name: intlMessages.className,
    hint: intlMessages.classHint,
    testId: 'Class',
    // A presenter leads, so presenting goes through a moderator and everyone
    // can draw. The waiting room is left as created.
    preset: {
      editable: {
        joinMuted: true,
        publicChat: true,
        presenterPolicy: 'requireApproval',
        whiteboard: true,
      },
      automatic: AUTOMATIC,
    },
  },
  {
    id: 'meeting',
    icon: GroupsIcon,
    name: intlMessages.meetingName,
    hint: intlMessages.meetingHint,
    testId: 'Meeting',
    // Everyone takes part: anyone can present, the whiteboard stays the
    // presenter's. The waiting room is left as created.
    preset: {
      editable: {
        joinMuted: true,
        publicChat: true,
        presenterPolicy: 'freeForAll',
        whiteboard: false,
      },
      automatic: AUTOMATIC,
    },
  },
];

export const getRoomMode = (id: string | null): RoomModeDefinition | undefined => (
  ROOM_MODES.find((mode) => mode.id === id)
);

export default ROOM_MODES;
