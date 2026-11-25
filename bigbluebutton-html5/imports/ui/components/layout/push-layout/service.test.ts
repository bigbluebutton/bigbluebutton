import { describe, expect, it } from 'vitest';
import {
  getPropagatedCameraDock,
  hasCameraDockChanged,
  meetingCameraDockSize,
} from './service';

// The dock part of the layout push: the dock's position and its size as a fraction (0-1) of the area it
// sits in, along its axis (0 = not set). The size is sent as the user stored it on release, so followers
// get the same share of their own media area.

describe('push-layout service', () => {
  describe('meetingCameraDockSize', () => {
    it('reads the meeting row, which Hasura returns as a numeric string', () => {
      expect(meetingCameraDockSize('0.35')).toBe(0.35);
      expect(meetingCameraDockSize(0.2)).toBe(0.2);
    });

    it('treats anything missing, not finite or outside [0, 1] as not set', () => {
      expect(meetingCameraDockSize(undefined)).toBe(0);
      expect(meetingCameraDockSize(null)).toBe(0);
      expect(meetingCameraDockSize('abc')).toBe(0);
      expect(meetingCameraDockSize('2')).toBe(0);
      expect(meetingCameraDockSize(-0.1)).toBe(0);
    });
  });

  describe('getPropagatedCameraDock', () => {
    const meetingCameraDock = { position: 'contentLeft', size: 0.3 };

    it('sends the local position and stored size while propagation is not suppressed', () => {
      expect(getPropagatedCameraDock({
        isSuppressed: false,
        cameraDock: { position: 'contentRight', size: 0.25 },
        meetingCameraDock,
      })).toEqual({ cameraPosition: 'contentRight', cameraDockSize: 0.25 });
    });

    it('falls back to contentTop when the local dock has no position', () => {
      expect(getPropagatedCameraDock({
        isSuppressed: false,
        cameraDock: { position: '', size: 0 },
        meetingCameraDock,
      }).cameraPosition).toBe('contentTop');
    });

    it('re-sends the meeting values while suppressed (phone landscape)', () => {
      expect(getPropagatedCameraDock({
        isSuppressed: true,
        cameraDock: { position: 'contentRight', size: 0.4 },
        meetingCameraDock,
      })).toEqual({ cameraPosition: 'contentLeft', cameraDockSize: 0.3 });
    });

    it('sends an empty position while suppressed when the meeting has none', () => {
      expect(getPropagatedCameraDock({
        isSuppressed: true,
        cameraDock: { position: 'contentTop', size: 0 },
        meetingCameraDock: { size: 0 },
      }).cameraPosition).toBe('');
    });
  });

  describe('hasCameraDockChanged', () => {
    const base = {
      isCameraDockPropagationSuppressed: false,
      cameraPosition: 'contentTop',
      cameraDockSize: 0.2,
    };

    it('never reports a change while suppressed', () => {
      expect(hasCameraDockChanged({ ...base, isCameraDockPropagationSuppressed: true }, {})).toBe(false);
    });

    it('reports a change when suppression is lifted', () => {
      expect(hasCameraDockChanged(base, { ...base, isCameraDockPropagationSuppressed: true })).toBe(true);
    });

    it('reports a change of the position or of the stored size', () => {
      expect(hasCameraDockChanged(base, { ...base, cameraPosition: 'contentLeft' })).toBe(true);
      expect(hasCameraDockChanged(base, { ...base, cameraDockSize: 0.2001 })).toBe(true);
      expect(hasCameraDockChanged(base, { ...base, cameraDockSize: undefined })).toBe(true);
    });

    it('reports nothing when every field is equal', () => {
      expect(hasCameraDockChanged(base, { ...base })).toBe(false);
    });
  });
});
