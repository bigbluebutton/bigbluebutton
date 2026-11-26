import { CAMERADOCK_POSITION } from './enums';
import DEFAULT_VALUES from './defaultValues';
import Storage from '/imports/ui/services/storage/session';

/**
 * The camera dock size the user chose, as a fraction (0-1) of the area the dock sits in, along the
 * dock's axis: the media area's height for a top or bottom dock, its width for a left or right dock,
 * the sidebar column's height for a dock below the sidebar. 0 means not set: the CSS default applies.
 * This is the value the presenter pushes (cameraDockSize) and the CSS layout renders directly.
 */
export interface StoredDockSize {
  /** for a left or right dock */
  width: number;
  /** for a top, bottom or sidebar dock */
  height: number;
}

/** sessionStorage BBB_cameraDockSize; the old BBB_webcamSize held px and is ignored */
export const DOCK_SIZE_STORAGE_KEY = 'cameraDockSize';

export const NOT_SET: StoredDockSize = { width: 0, height: 0 };

export const dockAxis = (position: string | undefined): keyof StoredDockSize => (
  position === CAMERADOCK_POSITION.CONTENT_LEFT || position === CAMERADOCK_POSITION.CONTENT_RIGHT
    ? 'width'
    : 'height'
);

/** a rendered size over its area's size, held within [0, 1] and rounded to 4 decimals */
export const fractionOf = (rendered: number, area: number) => {
  if (!Number.isFinite(rendered) || !Number.isFinite(area) || area <= 0) return 0;
  const fraction = Math.min(1, Math.max(0, rendered / area));
  return Math.round(fraction * 10000) / 10000;
};

const isFraction = (value: unknown): value is number => typeof value === 'number'
  && Number.isFinite(value) && value >= 0 && value <= 1;

/** the stored value, or not set when it is missing or not a pair of fractions */
export const readStoredDockSize = (raw: unknown): StoredDockSize => {
  if (!raw || typeof raw !== 'object') return NOT_SET;
  const { width, height } = raw as Record<string, unknown>;
  if (!isFraction(width) || !isFraction(height)) return NOT_SET;
  return { width, height };
};

/** the dock's rendered box over its area's box, along the dock's axis */
export const fractionOfBox = (
  position: string | undefined,
  dock: { width: number; height: number },
  area: { width: number; height: number },
) => {
  const axis = dockAxis(position);
  return fractionOf(dock[axis], area[axis]);
};

export const fractionFor = (stored: StoredDockSize, position: string | undefined) => stored[dockAxis(position)];

export const withFraction = (
  stored: StoredDockSize,
  position: string | undefined,
  fraction: number,
): StoredDockSize => ({ ...stored, [dockAxis(position)]: fraction });

/**
 * A follower or joiner takes the meeting's dock size: the fraction for the axis of the meeting's dock
 * position (the default position when the meeting has none), which the CSS layout renders as the same
 * share of this user's own area.
 */
export const applyMeetingDockSize = (position: string | undefined, size: number) => {
  const stored = readStoredDockSize(Storage.getItem(DOCK_SIZE_STORAGE_KEY));
  Storage.setItem(DOCK_SIZE_STORAGE_KEY, withFraction(stored, position || DEFAULT_VALUES.cameraPosition, size));
};

export default {
  DOCK_SIZE_STORAGE_KEY,
  applyMeetingDockSize,
  dockAxis,
  fractionOf,
  fractionOfBox,
  readStoredDockSize,
  fractionFor,
  withFraction,
};
