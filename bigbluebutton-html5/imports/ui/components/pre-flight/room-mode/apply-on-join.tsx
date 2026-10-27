import React, { useEffect, useMemo, useRef } from 'react';
import { defineMessages, IntlShape, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { useReactiveVar } from '@apollo/client';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
  UsersCountSubscriptionResponse,
} from '/imports/ui/components/user-list/user-list-participants/queries';
import { getRoomMode } from './modes';
import roomModeHandoffVar, { roomModeHandoffTakerVar } from './handoff';
import { ROOM_MODE_APPLY_TIMEOUT, useRoomModeApplier } from './applier';
import {
  ResolvedRoomModeSettings,
  RoomModeChoice,
  RoomModeEdits,
  RoomModeRoomValues,
  settingsToApply,
} from './settings';

const intlMessages = defineMessages({
  notAppliedRoomRunning: {
    id: 'app.preFlight.roomMode.notAppliedRoomRunning',
    description: 'Toast when the picked room mode is not applied because another moderator is already in the room',
  },
  notAppliedModeSet: {
    id: 'app.preFlight.roomMode.notAppliedModeSet',
    description: 'Toast when the picked room mode is not applied because another moderator set one during the join',
  },
  openRoomModes: {
    id: 'app.preFlight.roomMode.openRoomModes',
    description: 'Action in the room mode toast: opens the room modes tab with the pick pre-selected',
  },
});

// The guest policy the pre-flight showed is the one applied: left unedited,
// it is the room's current one, not the policy the room was created with.
const withShownGuestPolicy = (edits: RoomModeEdits, shown: RoomModeRoomValues): RoomModeEdits => (
  edits.guestPolicy === undefined && shown.guestPolicy !== undefined
    ? { ...edits, guestPolicy: shown.guestPolicy }
    : edits
);

const NOT_APPLIED_TOAST_ID = 'roomModeNotApplied';

interface RoomModeHandoffActionProps {
  label: string;
  handoff: RoomModeChoice;
}

// Shown only while something can take the pick: the notice comes before the
// room renders, and a layout may leave the settings button out.
const RoomModeHandoffAction: React.FC<RoomModeHandoffActionProps> = ({ label, handoff }) => {
  const hasTaker = useReactiveVar(roomModeHandoffTakerVar);
  if (!hasTaker) return null;

  return (
    <BBButton
      variant="subtle"
      size="sm"
      label={label}
      onClick={() => {
        roomModeHandoffVar(handoff);
        toast.dismiss(NOT_APPLIED_TOAST_ID);
      }}
      dataTest="roomModeHandoffButton"
    />
  );
};

/**
 * The pick never reaches the room in either case, so the moderator is told
 * why. Given a pick to hand over, the notice also offers the settings
 * window's Room modes tab, with that pick pre-selected.
 */
export const notifyRoomModeNotApplied = (
  intl: IntlShape,
  reason: 'roomRunning' | 'modeSet',
  handoff?: RoomModeChoice,
) => {
  const message = reason === 'roomRunning'
    ? intlMessages.notAppliedRoomRunning
    : intlMessages.notAppliedModeSet;
  const action = handoff && (
    <RoomModeHandoffAction
      label={intl.formatMessage(intlMessages.openRoomModes)}
      handoff={handoff}
    />
  );
  notify(intl.formatMessage(message), 'info', 'settings', {
    toastId: NOT_APPLIED_TOAST_ID,
    // A notice that carries an action stays until it is used or closed, as the
    // other notices with an action do.
    ...(action && { autoClose: false, closeOnClick: false, draggable: false }),
  }, action);
};

interface RoomModeApplyOnJoinProps {
  choice: RoomModeChoice;
  roomValues: RoomModeRoomValues;
  // Called once, whatever the outcome: the room is shown either way.
  onDone: () => void;
}

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
    // The room is running: the pick can still be applied from the room, as
    // the pre-flight showed it.
    const { modeId, edits } = choiceRef.current;
    notifyRoomModeNotApplied(intl, 'roomRunning', {
      modeId,
      edits: withShownGuestPolicy(edits, roomValuesRef.current),
    });
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

    const shown = roomValuesRef.current;
    const settings = settingsToApply(mode, withShownGuestPolicy(edits, shown), shown);
    apply(mode, settings, () => doneRef.current)
      .then(() => finish(undefined, settings))
      .catch((error) => finish((error as Error).message || 'unknown error'));
  }, [ready, otherModerators]);

  return null;
};

export default RoomModeApplyOnJoin;
