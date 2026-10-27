import { defineMessages, MessageDescriptor } from 'react-intl';
import { isChatAvailable } from '../features';
import type { RoomModeDefinition } from './modes';

export type PresenterPolicy = 'moderatorOnly' | 'requireApproval' | 'freeForAll';

// The settings a moderator can change in the pre-flight: only what BBB can
// still apply once the room exists.
export interface RoomModeEditableValues {
  guestPolicy: string;
  joinMuted: boolean;
  // Allowed, as the lock viewers modal shows it: on means not locked.
  publicChat: boolean;
  presenterPolicy: PresenterPolicy;
  whiteboard: boolean;
}

export type RoomModeEditableId = keyof RoomModeEditableValues;

export type RoomModeEdits = Partial<RoomModeEditableValues>;

// The mode a moderator picked before the join, with the edits made under it:
// what the join applies once the user is in.
export interface RoomModeChoice {
  modeId: string;
  edits: RoomModeEdits;
}

// What the summary shows and the applier will apply: one value per setting
// that something defines.
export type ResolvedRoomModeSettings = Partial<RoomModeEditableValues>;

// What the room has right now, as far as it can be read before the join: the
// editable values, plus what decides an automatic item.
export interface RoomModeRoomValues extends Partial<RoomModeEditableValues> {
  record: boolean;
  autoStartRecording: boolean;
}

/**
 * What a mode asserts. An editable setting left out stays as the room was
 * created; the automatic ones are applied without asking.
 */
export interface RoomModePreset {
  editable: Partial<RoomModeEditableValues>;
  automatic: {
    webcamsOnlyForModerator: boolean;
    lockOnJoin: boolean;
  };
}

const intlMessages = defineMessages({
  guestPolicy: {
    id: 'app.guest-policy.title',
    description: 'Guest policy title',
  },
  askModerator: {
    id: 'app.guest-policy.button.askModerator',
    description: 'Ask moderator button label',
  },
  alwaysAccept: {
    id: 'app.guest-policy.button.alwaysAccept',
    description: 'Always accept button label',
  },
  alwaysAcceptAuth: {
    id: 'app.guest-policy.button.alwaysAcceptAuth',
    description: 'Always accept authenticated button label',
  },
  alwaysDeny: {
    id: 'app.guest-policy.button.alwaysDeny',
    description: 'Always deny button label',
  },
  joinMuted: {
    id: 'app.preFlight.roomMode.settings.joinMuted',
    description: 'Room mode setting: participants join with the microphone muted',
  },
  joinMutedOnHelper: {
    id: 'app.userList.userOptions.usersJoinMutedEnableDesc',
    description: 'Description of the join muted setting while it is on',
  },
  joinMutedOffHelper: {
    id: 'app.userList.userOptions.usersJoinMutedDisableDesc',
    description: 'Description of the join muted setting while it is off',
  },
  publicChat: {
    id: 'app.lock-viewers.PublicChatLabel',
    description: 'Label for the public chat lock setting',
  },
  presenterPolicy: {
    id: 'app.lock-viewers.presentationPermissions.title',
    description: 'Presentation policy title',
  },
  moderatorOnly: {
    id: 'app.lock-viewers.presentationPermissions.moderatorOnly',
    description: 'Presentation policy: the presenter is assigned by a moderator',
  },
  requireApproval: {
    id: 'app.lock-viewers.presentationPermissions.requireApproval',
    description: 'Presentation policy: participants present with moderator approval',
  },
  freeForAll: {
    id: 'app.lock-viewers.presentationPermissions.freeForAll',
    description: 'Presentation policy: participants present freely',
  },
  whiteboard: {
    id: 'app.preFlight.roomMode.settings.whiteboardForEveryone',
    description: 'Room mode setting: everyone can draw on the whiteboard',
  },
  webcams: {
    id: 'app.lock-viewers.otherViewersWebcamLabel',
    description: 'Label for the see other participants webcam setting',
  },
  lockOnJoin: {
    id: 'app.preFlight.roomMode.settings.lockOnJoin',
    description: 'Room mode setting applied automatically: locks also reach people who join later',
  },
  recording: {
    id: 'app.preFlight.roomMode.settings.recordingNotAutomatic',
    description: 'Room mode statement: no room mode starts the recording',
  },
});

export interface SettingOption<V extends string = string> {
  value: V;
  label: MessageDescriptor;
}

interface BaseEditableSetting {
  label: MessageDescriptor;
  dataTest: string;
}

export interface SwitchSetting extends BaseEditableSetting {
  id: 'joinMuted' | 'publicChat' | 'whiteboard';
  kind: 'switch';
  // Describes the current state, so it follows the switch.
  helper?: { on: MessageDescriptor; off: MessageDescriptor };
}

interface SelectSettingOf<K extends 'guestPolicy' | 'presenterPolicy'> extends BaseEditableSetting {
  id: K;
  kind: 'select';
  options: SettingOption<RoomModeEditableValues[K]>[];
  // Offered only while it is the room's value: never picked from here.
  hiddenOptions?: SettingOption<RoomModeEditableValues[K]>[];
}

export type SelectSetting = SelectSettingOf<'guestPolicy'> | SelectSettingOf<'presenterPolicy'>;

export type EditableSetting = SwitchSetting | SelectSetting;

export interface AutomaticSetting {
  id: string;
  label: MessageDescriptor;
  dataTest: string;
  // Whether the mode applies it; listed only then.
  appliesTo: (preset: RoomModePreset, room: RoomModeRoomValues) => boolean;
}

// In the order the summary lists them.
export const EDITABLE_SETTINGS: EditableSetting[] = [
  {
    id: 'guestPolicy',
    kind: 'select',
    label: intlMessages.guestPolicy,
    dataTest: 'preFlightRoomModeGuestPolicy',
    options: [
      { value: 'ASK_MODERATOR', label: intlMessages.askModerator },
      { value: 'ALWAYS_ACCEPT', label: intlMessages.alwaysAccept },
      { value: 'ALWAYS_DENY', label: intlMessages.alwaysDeny },
    ],
    hiddenOptions: [
      { value: 'ALWAYS_ACCEPT_AUTH', label: intlMessages.alwaysAcceptAuth },
    ],
  },
  {
    id: 'joinMuted',
    kind: 'switch',
    label: intlMessages.joinMuted,
    helper: { on: intlMessages.joinMutedOnHelper, off: intlMessages.joinMutedOffHelper },
    dataTest: 'preFlightRoomModeJoinMuted',
  },
  {
    id: 'publicChat',
    kind: 'switch',
    label: intlMessages.publicChat,
    dataTest: 'preFlightRoomModePublicChat',
  },
  {
    id: 'presenterPolicy',
    kind: 'select',
    label: intlMessages.presenterPolicy,
    dataTest: 'preFlightRoomModePresenterPolicy',
    options: [
      { value: 'moderatorOnly', label: intlMessages.moderatorOnly },
      { value: 'requireApproval', label: intlMessages.requireApproval },
      { value: 'freeForAll', label: intlMessages.freeForAll },
    ],
  },
  {
    id: 'whiteboard',
    kind: 'switch',
    label: intlMessages.whiteboard,
    dataTest: 'preFlightRoomModeWhiteboard',
  },
];

// Shown as applied, never as switches. Recording is a statement, not a value:
// whether the room may record is fixed at its creation.
export const AUTOMATIC_SETTINGS: AutomaticSetting[] = [
  {
    id: 'webcams',
    label: intlMessages.webcams,
    dataTest: 'preFlightRoomModeAutomaticWebcams',
    appliesTo: (preset) => !preset.automatic.webcamsOnlyForModerator,
  },
  {
    id: 'lockOnJoin',
    label: intlMessages.lockOnJoin,
    dataTest: 'preFlightRoomModeAutomaticLockOnJoin',
    appliesTo: (preset) => preset.automatic.lockOnJoin,
  },
  {
    id: 'recording',
    label: intlMessages.recording,
    dataTest: 'preFlightRoomModeAutomaticRecording',
    // No mode starts the recording. Said only in a room that may record and is
    // not set to start recording as the moderator enters; a recording already
    // running cannot be read before the join.
    appliesTo: (_preset, room) => room.record && !room.autoStartRecording,
  },
];

/**
 * The value each editable setting will have once the mode is applied: the
 * moderator's edit, else what the mode asserts, else what the room has. A
 * setting none of them knows is left out.
 */
export const resolveRoomModeSettings = (
  preset: RoomModePreset,
  edits: RoomModeEdits,
  room: RoomModeRoomValues,
): ResolvedRoomModeSettings => {
  const resolved: ResolvedRoomModeSettings = {};
  EDITABLE_SETTINGS.forEach(({ id }) => {
    const value = edits[id] ?? preset.editable[id] ?? room[id];
    if (value !== undefined) Object.assign(resolved, { [id]: value });
  });
  return resolved;
};

// The modes leave the guest policy as created, so it is sent only when edited
// (or asserted by a mode); a room without chat has no public chat to unlock.
export const settingsToApply = (
  mode: RoomModeDefinition,
  edits: RoomModeEdits,
  roomValues: RoomModeRoomValues,
): ResolvedRoomModeSettings => {
  const settings = resolveRoomModeSettings(mode.preset, edits, roomValues);
  if (edits.guestPolicy === undefined && mode.preset.editable.guestPolicy === undefined) {
    delete settings.guestPolicy;
  }
  if (!isChatAvailable()) delete settings.publicChat;
  return settings;
};
