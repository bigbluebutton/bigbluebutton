import React, { useEffect, useRef } from 'react';
import logger from '/imports/startup/client/logger';
import { getRoomMode } from './modes';
import { ROOM_MODE_APPLY_TIMEOUT, useRoomModeApplier } from './applier';
import {
  ResolvedRoomModeSettings,
  RoomModeChoice,
  RoomModeRoomValues,
  resolveRoomModeSettings,
} from './settings';

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

  useEffect(() => {
    // Covers the meeting data that never arrives and a mutation that never answers.
    const timer = setTimeout(() => finish('timed out'), ROOM_MODE_APPLY_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || startedRef.current) return;
    startedRef.current = true;

    const { modeId, edits } = choiceRef.current;
    const mode = getRoomMode(modeId);
    if (!mode) {
      finish('unknown room mode');
      return;
    }

    const settings = resolveRoomModeSettings(mode.preset, edits, roomValuesRef.current);
    apply(mode, settings, () => doneRef.current)
      .then(() => finish(undefined, settings))
      .catch((error) => finish((error as Error).message || 'unknown error'));
  }, [ready]);

  return null;
};

export default RoomModeApplyOnJoin;
