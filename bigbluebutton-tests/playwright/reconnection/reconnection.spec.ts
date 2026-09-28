import { checkRootPermission, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { backgroundJoinParameter, BackgroundSource, OutageFlavor, Reconnection } from './reconnection';

test.describe('Reconnection', () => {
  test('Chat', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo });
    await reconnection.chat();
  });

  test('Audio', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo });
    await reconnection.microphone();
  });

  test('Webcam media after automatic republish', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission();
    // The decoded-frame counter reads inbound-rtp stats, and there is no API to
    // enumerate a page's peer connections, so they are collected as they are built.
    await context.addInitScript(() => {
      const peerConnections: RTCPeerConnection[] = [];
      const OriginalPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = class TrackedPeerConnection extends OriginalPeerConnection {
        constructor(configuration?: RTCConfiguration) {
          super(configuration);
          peerConnections.push(this);
        }
      };
      (window as typeof window & { reconnectionPeerConnections?: RTCPeerConnection[] }).reconnectionPeerConnections =
        peerConnections;
    });
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo });
    await reconnection.initUserPage(context, { testInfo });
    await reconnection.webcamMedia();
  });

  const backgrounds: BackgroundSource[] = ['built-in', 'custom', 'join-parameter'];
  const outages: OutageFlavor[] = ['signaling', 'short-media', 'long-media', 'reload'];
  for (const background of backgrounds) {
    for (const outageFlavor of outages) {
      // A reload is outside the media reconnection coverage, so the stored
      // background does not come back with it. A join-parameter background is the
      // exception: it is re-read from the URL the reload goes through, so that
      // case is expected to pass and is not tagged.
      const reproducesIssue = outageFlavor === 'reload' && background !== 'join-parameter';
      test(
        `Webcam background: ${background}, ${outageFlavor}`,
        reproducesIssue ? { tag: '@known-issue' } : {},
        async ({ browser, context, page }, testInfo) => {
          if (reproducesIssue) {
            linkIssue(25266);
            test.fail(true, 'Reloading the meeting is outside the media reconnection coverage');
          }
          await checkRootPermission();
          const reconnection = new Reconnection(browser, context);
          await reconnection.initModPage(page, { joinParameter: backgroundJoinParameter(background), testInfo });
          await reconnection.initUserPage(context, { testInfo });
          await reconnection.webcamBackground(background, outageFlavor, testInfo);
        },
      );
    }
  }
});
