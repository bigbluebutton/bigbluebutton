import { checkRootPermission } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Reconnection } from './reconnection';

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
});
