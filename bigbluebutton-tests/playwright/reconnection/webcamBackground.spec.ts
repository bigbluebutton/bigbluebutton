// Reproduction spec for https://github.com/bigbluebutton/bigbluebutton/issues/25266
// "[4.0] Webcam Background dropped after reconnection".
//
// Mechanism (one paragraph): the webcam virtual background is applied only in the
// video-preview flow (useVideoPreview.ts applyStoredVirtualBg) and baked into the
// cached BBBVideoStream. The video-provider republish path has no virtual-background
// awareness. On a full connection loss, onWsClose() tears every camera peer down
// (bbbVideoStream.stop() -> stopVirtualBackground + the preloaded-stream cache is
// purged) and nulls the deviceId; when the connection returns, createPublisher()
// calls VideoService.getPreloadedStream(), gets null, and wraps the RAW
// peer.getLocalStream() with no re-application of the stored background - a silent
// raw re-share. It is bbb-webrtc-sfu-bridge-specific: the LiveKit bridge has no raw
// getUserMedia fallback (it fails loudly instead).
//
// This test asserts the DESIRED behavior (background still applied after
// reconnection) and is wrapped in test.fail(): against current product code it
// fails on every run (the suite stays green), and it flips to an unexpected pass
// once the bug is fixed.
//
// Run notes:
// - Reproduces on the bbb-webrtc-sfu camera bridge (4.0's default is LiveKit), so
//   run it with MEDIA_BRIDGE=bbb-webrtc-sfu.
// - Uses severConnection() (workstation sudo; severs ALL local connections to the
//   server), so it must run standalone (--workers=1). It is deliberately NOT
//   @ci-tagged, mirroring the rest of the reconnection suite (CI shards lack sudo).
//   Do NOT move it into webcam/ (that describe block is @ci-tagged and sudo-free).

import { checkRootPermission, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { WebcamBackground } from './webcamBackground';

test.describe('Reconnection - webcam virtual background', () => {
  test.fail(); // issue #25266: background is silently dropped on reconnection (bug present)

  test('Virtual background survives a reconnection', async ({ browser, context, page }, testInfo) => {
    linkIssue(25266);
    await checkRootPermission(); // needs sudo to sever the connection
    const webcamBackground = new WebcamBackground(browser, context);
    await webcamBackground.initModPage(page, { testInfo });
    await webcamBackground.initUserPage(context, { testInfo });
    await webcamBackground.backgroundSurvivesReconnection();
  });
});
