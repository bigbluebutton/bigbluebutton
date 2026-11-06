import type { Page as PlaywrightPage } from '@playwright/test';

// What the page sees when the user refuses a browser permission prompt: getUserMedia
// or getDisplayMedia rejects with NotAllowedError. Chromium runs with
// --use-fake-ui-for-media-stream, which grants every prompt, so the refusal is stubbed
// into the page instead.
export type RefusedMedia = 'audio' | 'video' | 'display';

type RefusingWindow = Window & { bbbTestRefusedMedia?: RefusedMedia[] };

// Must run before navigation. The refusal holds until allowMedia lifts it.
export const refuseMedia = (page: PlaywrightPage, refused: RefusedMedia[]): Promise<void> =>
  page.addInitScript((kinds) => {
    const w = window as RefusingWindow;
    const { mediaDevices } = navigator;

    if (!mediaDevices || w.bbbTestRefusedMedia) return;
    w.bbbTestRefusedMedia = kinds;

    const isRefused = (kind: RefusedMedia) => !!w.bbbTestRefusedMedia?.includes(kind);
    const refuse = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
    const getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    const getDisplayMedia = mediaDevices.getDisplayMedia.bind(mediaDevices);

    mediaDevices.getUserMedia = (constraints?: MediaStreamConstraints) =>
      (constraints?.audio && isRefused('audio')) || (constraints?.video && isRefused('video'))
        ? refuse()
        : getUserMedia(constraints);
    mediaDevices.getDisplayMedia = (options?: DisplayMediaStreamOptions) =>
      isRefused('display') ? refuse() : getDisplayMedia(options);
  }, refused);

// The user grants what was refused, as by changing the site permission.
export const allowMedia = (page: PlaywrightPage): Promise<void> =>
  page.evaluate(() => {
    (window as RefusingWindow).bbbTestRefusedMedia = [];
  });
