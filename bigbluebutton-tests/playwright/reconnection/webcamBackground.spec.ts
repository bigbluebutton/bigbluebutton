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
// The fix re-applies the stored background on the republish path
// (video-provider createPublisher's raw fallback), so this test asserts the
// restored behavior: after reconnection the background is still applied on both
// the sharer self-view and the viewer received tile. It is the regression guard
// for that fix.
//
// Run notes:
// - Reproduces on the bbb-webrtc-sfu camera bridge (4.0's default is LiveKit), so
//   run it with MEDIA_BRIDGE=bbb-webrtc-sfu.
// - Uses severConnection() (workstation sudo; severs ALL local connections to the
//   server), so it must run standalone (--workers=1). It is deliberately NOT
//   @ci-tagged, mirroring the rest of the reconnection suite (CI shards lack sudo).
//   Do NOT move it into webcam/ (that describe block is @ci-tagged and sudo-free).

import { checkRootPermission, linkIssue } from '../core/helpers';
import { isLegacy } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { WebcamBackground } from './webcamBackground';

test.describe('Reconnection - webcam virtual background', () => {
  // The reproduction is specific to the bbb-webrtc-sfu camera bridge (raw
  // getUserMedia republish fallback). LiveKit is 4.0's default and has no such
  // path, so this only runs with MEDIA_BRIDGE=bbb-webrtc-sfu.
  test.skip(!isLegacy, 'bbb-webrtc-sfu bridge only');

  test('Virtual background survives a reconnection', async ({ browser, context, page }, testInfo) => {
    linkIssue(25266);
    await checkRootPermission(); // needs sudo to sever the connection
    const webcamBackground = new WebcamBackground(browser, context);
    await webcamBackground.initModPage(page, { testInfo });
    await webcamBackground.initUserPage(context, { testInfo });
    await webcamBackground.backgroundSurvivesReconnection();
  });
});
