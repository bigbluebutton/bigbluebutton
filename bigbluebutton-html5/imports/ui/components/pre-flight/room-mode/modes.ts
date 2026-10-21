import React from 'react';
import { defineMessages, MessageDescriptor } from 'react-intl';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';

export interface RoomModeDefinition {
  // Stored as meeting.roomMode: the server accepts ^[a-z][a-z0-9-]{0,31}$.
  id: string;
  icon: React.ElementType;
  name: MessageDescriptor;
  hint: MessageDescriptor;
  dataTest: string;
}

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
 * read this same list. A mode joins the list with the change that makes it apply
 * (ADR 4), so none is listed ahead of its behaviour.
 */
const ROOM_MODES: RoomModeDefinition[] = [
  {
    id: 'class',
    icon: SchoolIcon,
    name: intlMessages.className,
    hint: intlMessages.classHint,
    dataTest: 'preFlightRoomModeClass',
  },
  {
    id: 'meeting',
    icon: GroupsIcon,
    name: intlMessages.meetingName,
    hint: intlMessages.meetingHint,
    dataTest: 'preFlightRoomModeMeeting',
  },
];

export const getRoomMode = (id: string | null): RoomModeDefinition | undefined => (
  ROOM_MODES.find((mode) => mode.id === id)
);

export default ROOM_MODES;
