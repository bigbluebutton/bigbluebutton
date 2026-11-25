import { CameraDockPropagationState, MeetingCameraDock } from '../layoutTypes';

/** The dock as the presenter pushes it: where it is drawn and the size the user stored for that axis. */
export interface PushedCameraDock {
  position?: string;
  /** a fraction (0-1) of the dock's area along its axis; 0 = not set */
  size: number;
}

/** The meeting's dock size (Hasura returns numeric columns as strings): a fraction, or 0 (not set). */
const meetingCameraDockSize = (raw: unknown) => {
  const size = typeof raw === 'string' ? Number(raw) : raw;
  return typeof size === 'number' && Number.isFinite(size) && size >= 0 && size <= 1 ? size : 0;
};

// No position fallback while suppressed: a changed position notifies everyone.
const getPropagatedCameraDock = ({
  isSuppressed,
  cameraDock,
  meetingCameraDock,
}: {
  isSuppressed: boolean;
  cameraDock: PushedCameraDock;
  meetingCameraDock: MeetingCameraDock;
}) => (isSuppressed
  ? {
    cameraPosition: meetingCameraDock.position ?? '',
    cameraDockSize: meetingCameraDock.size,
  }
  : {
    cameraPosition: cameraDock.position || 'contentTop',
    cameraDockSize: cameraDock.size,
  });

const hasCameraDockChanged = (
  curr: CameraDockPropagationState,
  prev: Partial<CameraDockPropagationState>,
) => {
  if (curr.isCameraDockPropagationSuppressed) return false;

  const suppressionLifted = prev.isCameraDockPropagationSuppressed === true;
  return suppressionLifted
    || curr.cameraPosition !== prev.cameraPosition
    || curr.cameraDockSize !== prev.cameraDockSize;
};

/**
 * Whether a follower applies the meeting's dock size again: when it or the meeting's position (whose axis
 * the size belongs to) changed since the last render. Never on the first render: the join applies the
 * meeting's size there, and keeps the user's own while the meeting has none (0).
 */
const hasMeetingCameraDockChanged = (
  curr: MeetingCameraDock,
  prev: Partial<MeetingCameraDock>,
) => prev.size !== undefined
  && (curr.size !== prev.size || curr.position !== prev.position);

export {
  getPropagatedCameraDock,
  hasCameraDockChanged,
  hasMeetingCameraDockChanged,
  meetingCameraDockSize,
};

export default {
  getPropagatedCameraDock,
  hasCameraDockChanged,
  hasMeetingCameraDockChanged,
  meetingCameraDockSize,
};
