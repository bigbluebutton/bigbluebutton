// Session storage: everything the pre-flight commits survives a reload, so its
// own flags have to survive it too, or a reload reopens the audio modal.
import Session from '/imports/ui/services/storage/session';
import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { getRoomMode } from './room-mode/modes';

const PRE_FLIGHT_COMPLETED_KEY = 'preFlightCompleted';
const PRE_FLIGHT_SHARE_CAMERA_KEY = 'preFlightShareCamera';

/**
 * The pre-flight (setup) screen replaces the guest lobby screen, the audio modal
 * and the video preview modal. It renders before the join, so it must never rely
 * on post-join state (layout context, video-provider streams, audio bridges).
 */
export const isPreFlightEnabled = (): boolean => {
  const enabled = getFromUserSettings(
    'bbb_pre_flight',
    window.meetingClientSettings?.public?.app?.preFlight?.enabled,
  );

  if (enabled !== true) return false;

  // Breakouts carry the audio over from the parent meeting: nothing to set up.
  const isBreakout = meetingStaticData.getMeetingData()?.isBreakout;

  return !isBreakout;
};

// The moderator's room mode panel. Breakouts are already out through the
// pre-flight itself.
export const isRoomModePanelEnabled = (): boolean => {
  if (!isPreFlightEnabled()) return false;

  const enabled = getFromUserSettings(
    'bbb_pre_flight_room_modes',
    window.meetingClientSettings?.public?.app?.preFlight?.roomModes?.enabled,
  );

  return enabled === true;
};

// The mode the create call marked the room with, when the panel offers it: the
// panel opens with it picked. Fixed at create, so read from the static data,
// which is there before the join.
export const getRoomModeOnCreate = (): string | null => {
  const id = meetingStaticData.getMeetingData()?.roomModeOnCreate;
  return id && getRoomMode(id) ? id : null;
};

// Flag-gated too: the keys outlive a reload, so a tab moving on to a meeting
// without the pre-flight must not skip the join modals on stale selections.
export const isPreFlightCompleted = (): boolean => (
  isPreFlightEnabled() && !!Session.getItem(PRE_FLIGHT_COMPLETED_KEY)
);

export const setPreFlightCompleted = (value: boolean): void => {
  Session.setItem(PRE_FLIGHT_COMPLETED_KEY, !!value);
};

export const shouldPreFlightShareCamera = (): boolean => (
  !!Session.getItem(PRE_FLIGHT_SHARE_CAMERA_KEY)
);

export const setPreFlightShareCamera = (value: boolean): void => {
  Session.setItem(PRE_FLIGHT_SHARE_CAMERA_KEY, !!value);
};
