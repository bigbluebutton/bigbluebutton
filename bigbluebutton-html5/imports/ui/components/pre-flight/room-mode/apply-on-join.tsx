import React, { useEffect, useMemo, useRef } from 'react';
import { defineMessages, IntlShape, useIntl } from 'react-intl';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
  UsersCountSubscriptionResponse,
} from '/imports/ui/components/user-list/user-list-participants/queries';
import { getRoomMode, RoomModeDefinition } from './modes';
import { ROOM_MODE_APPLY_TIMEOUT, useRoomModeApplier } from './applier';
import {
  ResolvedRoomModeSettings,
  RoomModeChoice,
  RoomModeEdits,
  RoomModeRoomValues,
  resolveRoomModeSettings,
} from './settings';
import { isChatAvailable } from '../features';

const intlMessages = defineMessages({
  notAppliedRoomRunning: {
    id: 'app.preFlight.roomMode.notAppliedRoomRunning',
    description: 'Toast when the picked room mode is not applied because another moderator is already in the room',
  },
  notAppliedModeSet: {
    id: 'app.preFlight.roomMode.notAppliedModeSet',
    description: 'Toast when the picked room mode is not applied because another moderator set one during the join',
  },
});

// The pick never reaches the room in either case, so the moderator is told why.
export const notifyRoomModeNotApplied = (intl: IntlShape, reason: 'roomRunning' | 'modeSet') => {
  const message = reason === 'roomRunning'
    ? intlMessages.notAppliedRoomRunning
    : intlMessages.notAppliedModeSet;
  notify(intl.formatMessage(message), 'info', 'settings');
};

interface RoomModeApplyOnJoinProps {
  choice: RoomModeChoice;
  roomValues: RoomModeRoomValues;
  // Called once, whatever the outcome: the room is shown either way.
  onDone: () => void;
}

// The modes leave the guest policy as created, so it is sent only when edited
// (or asserted by a mode); a room without chat has no public chat to unlock.
const settingsToApply = (
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

// Mounted only while the choice is applied, after the join: the meeting data
// is not subscribed to before it.
const RoomModeApplyOnJoin: React.FC<RoomModeApplyOnJoinProps> = ({
  choice,
  roomValues,
  onDone,
}) => {
  const intl = useIntl();
  const { ready, apply } = useRoomModeApplier();
  const startedRef = useRef(false);
  const doneRef = useRef(false);
  // The effects below run with partial deps, so they read the latest props here.
  const choiceRef = useRef(choice);
  choiceRef.current = choice;
  const roomValuesRef = useRef(roomValues);
  roomValuesRef.current = roomValues;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const { data: currentUser } = useCurrentUser((u) => ({ userId: u.userId }));
  const userId = currentUser?.userId;
  // Another moderator in the room means it is already running: a mode is never
  // applied over a running room, since what they changed would be undone and
  // everyone would get a toast per setting.
  const otherModeratorsWhere = useMemo(() => ({
    isModerator: { _eq: true },
    bot: { _eq: false },
    userId: { _neq: userId },
  }), [userId]);
  const { data: otherModeratorsData } = useDeduplicatedSubscription<UsersCountSubscriptionResponse>(
    USER_AGGREGATE_COUNT_SUBSCRIPTION,
    { variables: { where: otherModeratorsWhere }, skip: !userId },
  );
  const otherModerators = otherModeratorsData?.user_aggregate?.aggregate?.count;

  // The first outcome counts: past the deadline, the apply sends nothing more.
  const finish = (error?: string, settings?: ResolvedRoomModeSettings) => {
    if (doneRef.current) return;
    doneRef.current = true;

    const { modeId } = choiceRef.current;
    if (error === undefined) {
      logger.info({
        logCode: 'pre_flight_room_mode_applied',
        extraInfo: { modeId, settings },
      }, 'Room mode applied after the join');
    } else {
      logger.warn({
        logCode: 'pre_flight_room_mode_apply_failed',
        extraInfo: { modeId, error },
      }, 'Room mode not applied after the join');
    }

    onDoneRef.current();
  };

  const skip = () => {
    if (doneRef.current) return;
    doneRef.current = true;

    logger.info({
      logCode: 'pre_flight_room_mode_apply_skipped',
      extraInfo: { modeId: choiceRef.current.modeId, reason: 'another moderator is in the room' },
    }, 'Room mode not applied: the room is already running');
    notifyRoomModeNotApplied(intl, 'roomRunning');
    onDoneRef.current();
  };

  useEffect(() => {
    // Covers the meeting data that never arrives and a mutation that never answers.
    const timer = setTimeout(() => finish('timed out'), ROOM_MODE_APPLY_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || otherModerators === undefined || startedRef.current) return;
    startedRef.current = true;

    if (otherModerators > 0) {
      skip();
      return;
    }

    const { modeId, edits } = choiceRef.current;
    const mode = getRoomMode(modeId);
    if (!mode) {
      finish('unknown room mode');
      return;
    }

    const settings = settingsToApply(mode, edits, roomValuesRef.current);
    apply(mode, settings, () => doneRef.current)
      .then(() => finish(undefined, settings))
      .catch((error) => finish((error as Error).message || 'unknown error'));
  }, [ready, otherModerators]);

  return null;
};

export default RoomModeApplyOnJoin;
