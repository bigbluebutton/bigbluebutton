import React from 'react';
import { defineMessages, MessageDescriptor } from 'react-intl';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CastIcon from '@mui/icons-material/Cast';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export interface RoomModeDefinition {
  // Stored as meeting.roomMode: the server accepts ^[a-z][a-z0-9-]{0,31}$.
  id: string;
  icon: React.ElementType;
  name: MessageDescriptor;
  hint: MessageDescriptor;
  dataTest: string;
  // Listed so the moderator knows it is coming, but not selectable: nothing
  // applies it yet.
  comingSoon?: boolean;
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
  eventName: {
    id: 'app.preFlight.roomMode.modes.event.name',
    description: 'Name of the event room mode',
  },
  eventHint: {
    id: 'app.preFlight.roomMode.modes.event.hint',
    description: 'One-line hint under the event room mode',
  },
  webinarName: {
    id: 'app.preFlight.roomMode.modes.webinar.name',
    description: 'Name of the streamed session (webinar) room mode',
  },
  webinarHint: {
    id: 'app.preFlight.roomMode.modes.webinar.hint',
    description: 'One-line hint under the streamed session (webinar) room mode',
  },
  thesisDefenseName: {
    id: 'app.preFlight.roomMode.modes.thesisDefense.name',
    description: 'Name of the thesis defense room mode',
  },
  thesisDefenseHint: {
    id: 'app.preFlight.roomMode.modes.thesisDefense.hint',
    description: 'One-line hint under the thesis defense room mode',
  },
});

/**
 * The modes a moderator can pick before starting a room. Data only: the
 * presets (what each mode applies) and the in-session mode change read the
 * same list. Modes that cannot be applied yet are listed as coming soon.
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
  {
    id: 'event',
    icon: EventAvailableIcon,
    name: intlMessages.eventName,
    hint: intlMessages.eventHint,
    dataTest: 'preFlightRoomModeEvent',
    comingSoon: true,
  },
  {
    id: 'webinar',
    icon: CastIcon,
    name: intlMessages.webinarName,
    hint: intlMessages.webinarHint,
    dataTest: 'preFlightRoomModeWebinar',
    comingSoon: true,
  },
  {
    id: 'thesis-defense',
    icon: MenuBookIcon,
    name: intlMessages.thesisDefenseName,
    hint: intlMessages.thesisDefenseHint,
    dataTest: 'preFlightRoomModeThesisDefense',
    comingSoon: true,
  },
];

// The modes a moderator can actually pick.
export const SELECTABLE_ROOM_MODES = ROOM_MODES.filter((mode) => !mode.comingSoon);

export const getRoomMode = (id: string | null): RoomModeDefinition | undefined => (
  SELECTABLE_ROOM_MODES.find((mode) => mode.id === id)
);

export default ROOM_MODES;
