import { MutableRefObject, useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { SET_LOCK_SETTINGS_PROPS, SET_WEBCAM_ONLY_FOR_MODERATOR } from '/imports/ui/components/lock-viewers/mutations';
import { lockSettingsVariables } from '/imports/ui/components/lock-viewers/service';
import { SET_POLICY } from '/imports/ui/components/user-list/guest-management/waiting-users/mutations';
import { SET_MUTED } from '/imports/ui/components/user-list/crowd-action-buttons/mutations';
import { USER_SET_WHITEBOARD_WRITE_ACCESS } from '/imports/ui/components/presentation/mutations';
import { SET_ROOM_MODE } from './mutations';
import { RoomModeDefinition } from './modes';
import { ResolvedRoomModeSettings } from './settings';

// How long the room waits for the mode after SetRoomMode.
export const ROOM_MODE_WAIT_TIMEOUT = 10000;
// The longest the room waits after the join, from the meeting data to the mode
// showing.
export const ROOM_MODE_APPLY_TIMEOUT = 15000;
const ROOM_MODE_POLL_INTERVAL = 100;

type LockSettingsVariables = ReturnType<typeof lockSettingsVariables>;

// Names the step that failed, so the log says where the apply stopped.
const inStep = async (step: string, run: () => Promise<unknown>): Promise<void> => {
  try {
    await run();
  } catch (error) {
    throw new Error(`${step}: ${(error as Error).message}`);
  }
};

const waitForRoomMode = (
  roomModeRef: MutableRefObject<string | undefined>,
  modeId: string,
) => new Promise<void>((resolve, reject) => {
  const deadline = Date.now() + ROOM_MODE_WAIT_TIMEOUT;
  const check = () => {
    if (roomModeRef.current === modeId) {
      resolve();
    } else if (Date.now() >= deadline) {
      reject(new Error('the room did not show the mode'));
    } else {
      setTimeout(check, ROOM_MODE_POLL_INTERVAL);
    }
  };
  check();
});

export interface RoomModeApplier {
  ready: boolean;
  // isCancelled is checked before each step: once true, the steps not yet sent
  // are skipped, though one already sent may still land.
  apply: (
    mode: RoomModeDefinition,
    settings: ResolvedRoomModeSettings,
    isCancelled?: () => boolean,
  ) => Promise<void>;
}

/**
 * Sets a room mode on a room that is already joined: only what differs from
 * the room's state, in order, and the mode last. The mode showing on the user
 * is the proof: the server answers only after publishing, and these commands
 * run in order on the same meeting actor, so the earlier ones have landed.
 */
export const useRoomModeApplier = (): RoomModeApplier => {
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
    usersPolicies: m.usersPolicies,
    isBreakout: m.isBreakout,
  }));
  const { data: currentUser } = useCurrentUser((u) => ({ meeting: u.meeting }));
  const roomModeRef = useRef<string | undefined>(undefined);
  roomModeRef.current = currentUser?.meeting?.roomMode;

  const [setLockSettingsProps] = useMutation(SET_LOCK_SETTINGS_PROPS);
  const [setWebcamOnlyForModerator] = useMutation(SET_WEBCAM_ONLY_FOR_MODERATOR);
  const [setPolicy] = useMutation(SET_POLICY);
  const [setMuted] = useMutation(SET_MUTED);
  const [setWhiteboardWriteAccess] = useMutation(USER_SET_WHITEBOARD_WRITE_ACCESS);
  const [setRoomModeMutation] = useMutation(SET_ROOM_MODE);

  const lockSettings = meeting?.lockSettings;
  const usersPolicies = meeting?.usersPolicies;
  const isBreakout = !!meeting?.isBreakout;
  const ready = !!lockSettings && !!usersPolicies;

  const apply = useCallback(async (
    mode: RoomModeDefinition,
    settings: ResolvedRoomModeSettings,
    isCancelled: () => boolean = () => false,
  ) => {
    const step = (name: string, run: () => Promise<unknown>) => {
      if (isCancelled()) throw new Error(`${name}: cancelled`);
      return inStep(name, run);
    };

    if (isBreakout) throw new Error('room modes do not apply to breakout rooms');
    if (!lockSettings || !usersPolicies) throw new Error('the meeting data has not arrived');

    const { guestPolicy, joinMuted, whiteboard } = settings;

    const current = lockSettingsVariables(lockSettings);
    const next: LockSettingsVariables = {
      ...current,
      disablePubChat: settings.publicChat === undefined ? current.disablePubChat : !settings.publicChat,
      presenterPolicy: settings.presenterPolicy ?? current.presenterPolicy,
      lockOnJoin: mode.preset.automatic.lockOnJoin,
    };
    const lockChanged = (Object.keys(next) as (keyof LockSettingsVariables)[])
      .some((key) => next[key] !== current[key]);
    if (lockChanged) {
      await step('lock settings', () => setLockSettingsProps({ variables: next }));
    }

    if (!mode.preset.automatic.webcamsOnlyForModerator && usersPolicies.webcamsOnlyForModerator) {
      await step('webcams only for moderator', () => setWebcamOnlyForModerator({
        variables: { webcamsOnlyForModerator: false },
      }));
    }

    if (guestPolicy !== undefined && guestPolicy !== usersPolicies.guestPolicy) {
      await step('guest policy', () => setPolicy({ variables: { guestPolicy } }));
    }

    // exceptPresenter stays false: the mute-all button's true does not store muteOnStart.
    if (joinMuted !== undefined) {
      await step('join muted', () => setMuted({
        variables: { muted: joinMuted, exceptPresenter: false },
      }));
    }

    if (whiteboard !== undefined && whiteboard !== usersPolicies.multiUserWhiteboardEnabled) {
      await step('whiteboard', () => setWhiteboardWriteAccess({
        variables: { userIds: [], allUsers: true, whiteboardWriteAccess: whiteboard },
      }));
    }

    await step('set room mode', () => setRoomModeMutation({ variables: { roomMode: mode.id } }));
    await step('wait for room mode', () => waitForRoomMode(roomModeRef, mode.id));
  }, [
    isBreakout,
    lockSettings,
    usersPolicies,
    setLockSettingsProps,
    setWebcamOnlyForModerator,
    setPolicy,
    setMuted,
    setWhiteboardWriteAccess,
    setRoomModeMutation,
  ]);

  return { ready, apply };
};
