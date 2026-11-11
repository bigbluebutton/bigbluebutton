import { type APIRequestContext, type BrowserContext, expect, test } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { parameters } from '../core/parameters';
import { EXTERNAL_VIDEO_URL, routeExternalVideo } from '../presentation/util';
import { startScreenshare } from '../screenshare/util';
import { MultiUsers } from '../user/multiusers';

export const PLUGIN_CONTENT_ID = 'e2ePluginMainContent';
const PLUGIN_CONTENT_TEXT = 'e2e plugin main content';

// Everything that can take over the presentation area, besides the whiteboard
export const MEDIA_AREA_CONTENTS = [
  'screenshare',
  'cameraAsContent',
  'externalVideo',
  'pinnedNotes',
  'pluginContent',
] as const;
export type MediaAreaContent = (typeof MEDIA_AREA_CONTENTS)[number];
export const CORE_CONTENTS = MEDIA_AREA_CONTENTS.filter((c) => c !== 'pluginContent');

export const CONTENT_LABELS: Record<MediaAreaContent, string> = {
  screenshare: 'screenshare',
  cameraAsContent: 'camera as content',
  externalVideo: 'external video',
  pinnedNotes: 'pinned shared notes',
  pluginContent: 'plugin content',
};

type PluginApiWindow = Window & {
  bbb_plugins?: Record<string, { pluginName?: string; setGenericContentItems: (items: unknown[]) => string[] }>;
};

type BroadcastKind = 'screen' | 'camera' | null;

// The element that must be on top of the presentation area when each content is shown
const ON_TOP_SELECTORS: Record<MediaAreaContent, string> = {
  screenshare: e.screenShareVideo,
  cameraAsContent: e.screenShareVideo,
  externalVideo: e.externalVideo,
  pinnedNotes: e.pinnedNotesHeader,
  pluginContent: e.e2ePluginMainContent,
};

export class PresentationArea extends MultiUsers {
  pluginName?: string;

  pluginEntrypoint?: URL;

  // Loads the manifest at PLUGIN_STUB_MANIFEST_URL with its script replaced by an empty one, so
  // the test drives the plugin API itself. bbb-web rejects loopback/private manifest URLs, hence
  // a manifest already reachable from the server instead of one served by the test.
  async stubPlugin(context: BrowserContext, request: APIRequestContext): Promise<string | undefined> {
    const manifestUrl = parameters.pluginStubManifestUrl;
    test.skip(!manifestUrl, 'PLUGIN_STUB_MANIFEST_URL is not set');
    const manifest = await (await request.get(manifestUrl!)).json();
    this.pluginEntrypoint = new URL(manifest.javascriptEntrypointUrl, manifestUrl);
    this.pluginName = manifest.name;
    await this.routePluginStub(context);
    return `pluginManifests=${encodeURIComponent(JSON.stringify([{ url: manifestUrl }]))}`;
  }

  // akka appends ?version=<manifest version> to the entrypoint, so match without the query
  async routePluginStub(context: BrowserContext) {
    const entrypoint = this.pluginEntrypoint!;
    await context.route(
      (url) => url.origin === entrypoint.origin && url.pathname === entrypoint.pathname,
      (route) => route.fulfill({ contentType: 'text/javascript', body: '' }),
    );
  }

  async setPluginMainContent(ids: string[], testPage: Page = this.modPage, text = PLUGIN_CONTENT_TEXT) {
    // the setter is a no-op stub until the plugin's extensible areas mount: retry until it takes
    await testPage.page.waitForFunction(
      ({ pluginName, itemIds, dataTest, text }) => {
        const api = Object.values((window as PluginApiWindow).bbb_plugins || {}).find(
          (p) => p.pluginName === pluginName,
        );
        if (!api) return false;
        const set = api.setGenericContentItems(
          itemIds.map((id) => ({
            id,
            type: 'GENERIC_CONTENT_MAIN_AREA',
            dataTest,
            contentFunction: (element: HTMLElement) => {
              element.textContent = text; // eslint-disable-line no-param-reassign
              return { render: () => {}, unmount: () => {} };
            },
          })),
        );
        return set.length === itemIds.length;
      },
      {
        pluginName: this.pluginName,
        itemIds: ids,
        dataTest: PLUGIN_CONTENT_ID,
        text,
      },
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
  }

  // Visible is not enough: another content can be laid over it. The element at the centre of
  // the content must belong to it, and not to a plugin's main-area container.
  async isOnTop(content: MediaAreaContent, testPage: Page = this.modPage): Promise<boolean> {
    return testPage.page.evaluate((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element || element.offsetParent === null) return false;
      const box = element.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + Math.min(box.height / 2, 40));
      if (!hit) return false;
      if (element.contains(hit)) return true;
      return !!element.parentElement?.contains(hit) && !hit.closest('[data-test^="container-"]');
    }, ON_TOP_SELECTORS[content]);
  }

  async assertOnTop(content: MediaAreaContent, testPage: Page = this.modPage, who = 'the presenter') {
    await expect
      .poll(() => this.isOnTop(content, testPage), {
        message: `${who} should see the ${CONTENT_LABELS[content]} on top`,
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBe(true);
  }

  // Screenshare and camera as content share the same video element: tell them apart by the
  // presenter's local track (only display captures report a displaySurface)
  async broadcastKind(): Promise<BroadcastKind> {
    return this.modPage.page.evaluate(() => {
      const video = document.querySelector<HTMLVideoElement>('video#screenshareVideo');
      if (!video || video.offsetParent === null) return null;
      const track = (video.srcObject as MediaStream | null)?.getVideoTracks()[0];
      if (!track || track.readyState !== 'live') return null;
      return 'displaySurface' in track.getSettings() ? 'screen' : 'camera';
    });
  }

  async closeMediaArea() {
    if (!(await this.modPage.checkElement('#mediaAreaDropUp'))) return;
    await this.modPage.page.keyboard.press('Escape');
    await this.modPage.wasRemoved('#mediaAreaDropUp', 'should close the media sharing panel');
  }

  async startExternalVideo() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await routeExternalVideo(this.context);
    await this.modPage.fill(e.videoModalInput, EXTERNAL_VIDEO_URL);
    await this.modPage.waitAndClick(e.startShareVideoBtn);
    await this.closeMediaArea();
  }

  // The media sharing panel stops whatever is shared through it (screen, camera or external video)
  async stopFromMediaArea() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.mediaAreaStopSharing);
    await this.closeMediaArea();
  }

  async startCameraAsContent() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.shareCameraAsContent);
    await this.modPage.hasElement(e.videoPreview, 'should display the camera preview');
    await this.modPage.waitAndClick(e.startCameraAsContent);
    await this.closeMediaArea();
  }

  async pinNotes() {
    await this.modPage.waitAndClick(e.sharedNotesSidebarButton);
    await this.modPage.waitAndClick(e.notesOptions, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.pinNotes);
  }

  async start(content: MediaAreaContent) {
    switch (content) {
      case 'screenshare':
        await startScreenshare(this.modPage);
        break;
      case 'cameraAsContent':
        await this.startCameraAsContent();
        break;
      case 'externalVideo':
        await this.startExternalVideo();
        break;
      case 'pinnedNotes':
        await this.pinNotes();
        break;
      case 'pluginContent':
        await this.setPluginMainContent([PLUGIN_CONTENT_ID]);
        break;
      default:
        throw new Error(`Unknown content ${content}`);
    }
    await this.assertShown(content);
    await this.modPage.closeAllToastNotifications();
  }

  async stop(content: MediaAreaContent) {
    switch (content) {
      case 'screenshare':
        await this.modPage.waitAndClick(e.stopScreenSharing);
        break;
      case 'cameraAsContent':
      case 'externalVideo':
        await this.stopFromMediaArea();
        break;
      case 'pinnedNotes':
        await this.modPage.waitAndClick(e.unpinNotes);
        break;
      case 'pluginContent':
        await this.setPluginMainContent([]);
        break;
      default:
        throw new Error(`Unknown content ${content}`);
    }
  }

  async assertShown(content: MediaAreaContent) {
    const label = CONTENT_LABELS[content];
    switch (content) {
      case 'screenshare':
      case 'cameraAsContent':
        await expect
          .poll(() => this.broadcastKind(), {
            message: `should display the ${label}`,
            timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
          })
          .toBe(content === 'screenshare' ? 'screen' : 'camera');
        break;
      case 'externalVideo':
        await this.modPage.hasElement(e.externalVideo, `should display the ${label}`, ELEMENT_WAIT_LONGER_TIME);
        break;
      case 'pinnedNotes':
        await this.modPage.hasElement(e.unpinNotes, `should display the ${label}`, ELEMENT_WAIT_LONGER_TIME);
        break;
      case 'pluginContent':
        await this.modPage.hasElement(e.e2ePluginMainContent, `should display the ${label}`);
        break;
      default:
        throw new Error(`Unknown content ${content}`);
    }
    await this.assertOnTop(content);
  }

  async assertGone(content: MediaAreaContent, why: string) {
    const label = CONTENT_LABELS[content];
    switch (content) {
      case 'screenshare':
      case 'cameraAsContent': {
        const kind = content === 'screenshare' ? 'screen' : 'camera';
        await expect
          .poll(() => this.broadcastKind(), {
            message: `${why}: the ${label} should stop`,
            timeout: ELEMENT_WAIT_LONGER_TIME,
          })
          .not.toBe(kind);
        break;
      }
      case 'externalVideo':
        await this.modPage.wasRemoved(e.externalVideo, `${why}: the ${label} should stop`, ELEMENT_WAIT_LONGER_TIME);
        break;
      case 'pinnedNotes':
        await this.modPage.wasRemoved(
          e.unpinNotes,
          `${why}: the ${label} should be unpinned`,
          ELEMENT_WAIT_LONGER_TIME,
        );
        break;
      case 'pluginContent':
        await this.modPage.wasRemoved(e.e2ePluginMainContent, `${why}: the ${label} should be hidden`);
        break;
      default:
        throw new Error(`Unknown content ${content}`);
    }
  }

  async waitForWhiteboard() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
  }

  // Sharing new content takes over the presentation area and stops the content shown before
  async replaces(next: MediaAreaContent, previous: MediaAreaContent) {
    await this.waitForWhiteboard();
    await this.start(previous);
    await this.start(next);
    await this.assertGone(previous, `sharing the ${CONTENT_LABELS[next]}`);
    // the replaced content must not come back once the new one ends either
    await this.stop(next);
    await this.assertGone(next, `stopping the ${CONTENT_LABELS[next]}`);
    await this.assertGone(previous, `stopping the ${CONTENT_LABELS[next]}`);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard again');
  }

  async stopBringsWhiteboardBack(content: MediaAreaContent) {
    await this.waitForWhiteboard();
    await this.start(content);
    await this.stop(content);
    await this.assertGone(content, `stopping the ${CONTENT_LABELS[content]}`);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard again');
  }

  // Core content cannot stop plugin content: it shows on top of it, and the plugin content is
  // displayed again when the core content ends
  async coversPluginContent(core: MediaAreaContent) {
    await this.waitForWhiteboard();
    await this.start('pluginContent');
    await this.start(core);
    await this.assertGone('pluginContent', `sharing the ${CONTENT_LABELS[core]}`);
    await this.stop(core);
    await this.assertGone(core, `stopping the ${CONTENT_LABELS[core]}`);
    await this.assertShown('pluginContent');
  }

  // A plugin that rebuilds its items without a stable id hands the client a new id for the same
  // content; that is not new content and must not stop what the presenter shared on top of it
  async pluginRerenderKeepsCoreContent(core: MediaAreaContent) {
    await this.waitForWhiteboard();
    await this.setPluginMainContent(['plugin-render-1']);
    await this.modPage.hasElement(e.e2ePluginMainContent, 'should display the plugin content');
    await this.start(core);
    await this.setPluginMainContent(['plugin-render-2']);
    // give the presenter's client the time to (wrongly) eject the core content
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_LONGER_TIME / 2);
    await this.assertShown(core);
    await this.assertGone(
      'pluginContent',
      `a re-render should keep the plugin content under the ${CONTENT_LABELS[core]}`,
    );
  }

  // After a reload the plugin restores the content it was showing: nothing new was shared
  async presenterReloadKeepsCoreContent(core: MediaAreaContent) {
    await this.waitForWhiteboard();
    await this.start('pluginContent');
    await this.start(core);
    await this.modPage.page.reload();
    await this.modPage.closeAudioModal();
    await this.assertShown(core);
    await this.setPluginMainContent([PLUGIN_CONTENT_ID]);
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_LONGER_TIME / 2);
    await this.assertShown(core);
    await this.stop(core);
    await this.assertShown('pluginContent');
  }

  // A plugin that re-renders the content it shows hands the client a new id for it. The content
  // must stay on screen, not leave an empty area.
  async pluginRerenderOnTopShowsNewContent() {
    await this.waitForWhiteboard();
    await this.setPluginMainContent(['plugin-render-1'], this.modPage, 'first render');
    await this.assertShown('pluginContent');
    await this.setPluginMainContent(['plugin-render-2'], this.modPage, 'second render');
    await expect(
      this.modPage.page.locator(e.e2ePluginMainContent),
      'should display the re-rendered plugin content',
    ).toHaveText('second render', { timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.assertOnTop('pluginContent');
  }

  // A viewer on their own browser, where the plugin renders the shared content too
  async joinViewerWithPluginContent() {
    const viewerContext = await this.browser.newContext();
    await this.routePluginStub(viewerContext);
    await this.initUserPage(viewerContext);
    await this.setPluginMainContent([PLUGIN_CONTENT_ID], this.userPage);
  }

  // A viewer joining later gets the plugin content after the core content shared over it: what
  // they see must match the rest of the meeting
  async lateViewerSeesCoreContent(core: MediaAreaContent) {
    await this.waitForWhiteboard();
    await this.start('pluginContent');
    await this.start(core);
    await this.joinViewerWithPluginContent();
    await this.userPage.page.waitForTimeout(ELEMENT_WAIT_LONGER_TIME / 2);
    await this.assertOnTop(core, this.userPage, 'the viewer');
    await this.assertShown(core);
  }

  // The presenter comes back in a new tab of the same browser and the plugin restores its content.
  // That is not a new share, so the core content stays for everyone.
  async presenterRejoinKeepsCoreContent(core: MediaAreaContent) {
    await this.waitForWhiteboard();
    await this.start('pluginContent');
    await this.start(core);
    await this.joinViewerWithPluginContent();
    const { meetingId, context: presenterContext, testInfo } = this.modPage;
    await this.modPage.page.close();
    const rejoined = new Page(this.browser, await presenterContext!.newPage(), testInfo);
    await rejoined.init(true, { meetingId, fullName: 'Moderator', testInfo });
    await rejoined.waitForSelector(e.startScreenSharing, ELEMENT_WAIT_EXTRA_LONG_TIME);
    this.modPage = rejoined;
    await this.setPluginMainContent([PLUGIN_CONTENT_ID]);
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_LONGER_TIME / 2);
    await this.assertOnTop(core, this.userPage, 'the viewer');
    await this.assertShown(core);
  }

  // Opening the camera-as-content view is not sharing yet: backing out keeps the screenshare
  async cameraPickerCancelKeepsScreenshare() {
    await this.waitForWhiteboard();
    await this.start('screenshare');
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.shareCameraAsContent);
    await this.modPage.hasElement(e.videoPreview, 'should display the camera preview');
    await this.modPage.page.keyboard.press('Escape');
    await this.closeMediaArea();
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_LONGER_TIME / 2);
    await this.assertShown('screenshare');
  }

  // Viewers see every replacement too: the presenter's ejections are meeting-wide
  async viewerFollowsReplacements() {
    await this.waitForWhiteboard();
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await this.start('screenshare');
    await this.userPage.hasElement(
      e.screenShareVideo,
      'viewer should see the screenshare',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    await this.start('externalVideo');
    await this.userPage.hasElement(e.externalVideo, 'viewer should see the external video', ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.wasRemoved(e.screenShareVideo, 'viewer should no longer see the screenshare');

    await this.start('pinnedNotes');
    await this.userPage.hasElement(e.pinnedNotesHeader, 'viewer should see the pinned notes', ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.wasRemoved(e.externalVideo, 'viewer should no longer see the external video');

    await this.start('screenshare');
    await this.userPage.hasElement(
      e.screenShareVideo,
      'viewer should see the screenshare',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.userPage.wasRemoved(e.pinnedNotesHeader, 'viewer should no longer see the pinned notes');

    await this.stop('screenshare');
    await this.userPage.wasRemoved(e.screenShareVideo, 'viewer should no longer see the screenshare');
    await this.userPage.hasElement(e.whiteboard, 'viewer should see the whiteboard again');
    await this.userPage.wasRemoved(e.pinnedNotesHeader, 'pinned notes should not come back for the viewer');
  }
}
