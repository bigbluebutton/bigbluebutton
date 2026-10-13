import { type APIRequestContext, type BrowserContext, test } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { parameters } from '../core/parameters';
import { startScreenshare } from '../screenshare/util';
import { startSharedNotesBlockNote } from '../sharednotes/blocknote/util';
import { MultiUsers } from '../user/multiusers';

const PLUGIN_CONTENT_ID = 'e2ePluginMainContent';

type PluginApiWindow = Window & {
  bbb_plugins?: Record<string, { pluginName?: string; setGenericContentItems: (items: unknown[]) => string[] }>;
};

export class PresentationArea extends MultiUsers {
  pluginName?: string;

  // Loads the manifest at PLUGIN_STUB_MANIFEST_URL with its script replaced by an empty one, so
  // the test drives the plugin API itself. bbb-web rejects loopback/private manifest URLs, hence
  // a manifest already reachable from the server instead of one served by the test.
  async stubPlugin(context: BrowserContext, request: APIRequestContext): Promise<string | undefined> {
    const manifestUrl = parameters.pluginStubManifestUrl;
    test.skip(!manifestUrl, 'PLUGIN_STUB_MANIFEST_URL is not set');
    const manifest = await (await request.get(manifestUrl!)).json();
    const entrypointUrl = new URL(manifest.javascriptEntrypointUrl, manifestUrl).toString();
    await context.route(entrypointUrl, (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
    this.pluginName = manifest.name;
    return `pluginManifests=${encodeURIComponent(JSON.stringify([{ url: manifestUrl }]))}`;
  }

  async setPluginMainContent(ids: string[]) {
    // the setter is a no-op stub until the plugin's extensible areas mount: retry until it takes
    await this.modPage.page.waitForFunction(
      ({ pluginName, itemIds, text }) => {
        const api = Object.values((window as PluginApiWindow).bbb_plugins || {}).find(
          (p) => p.pluginName === pluginName,
        );
        if (!api) return false;
        const set = api.setGenericContentItems(
          itemIds.map((id) => ({
            id,
            type: 'GENERIC_CONTENT_MAIN_AREA',
            dataTest: id,
            contentFunction: (element: HTMLElement) => {
              element.textContent = text; // eslint-disable-line no-param-reassign
              return { render: () => {}, unmount: () => {} };
            },
          })),
        );
        return set.length === itemIds.length;
      },
      { pluginName: this.pluginName, itemIds: ids, text: 'e2e plugin main content' },
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
  }

  async pinNotes() {
    await startSharedNotesBlockNote(this.modPage);
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);
    await this.modPage.hasElement(e.unpinNotes, 'should pin the shared notes onto the presentation area');
    await this.modPage.closeAllToastNotifications();
  }

  async startCameraAsContent() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.shareCameraAsContent);
    await this.modPage.hasElement(e.videoPreview, 'should display the camera preview');
    await this.modPage.waitAndClick(e.startCameraAsContent);
    await this.modPage.hasElement(e.screenShareVideo, 'should display the camera as content', ELEMENT_WAIT_LONGER_TIME);
  }

  async assertScreenshareStopped() {
    await this.modPage.wasRemoved(e.screenShareVideo, 'should stop the screenshare', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.startScreenSharing, 'should display the start screenshare button again');
  }

  async screenshareUnpinsNotes() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.pinNotes();
    await startScreenshare(this.modPage);
    await this.modPage.wasRemoved(e.unpinNotes, 'starting a screenshare should unpin the shared notes');
  }

  async cameraAsContentUnpinsNotes() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.pinNotes();
    await this.startCameraAsContent();
    await this.modPage.wasRemoved(e.unpinNotes, 'sharing a camera as content should unpin the shared notes');
  }

  async pinningNotesStopsScreenshare() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await startScreenshare(this.modPage);
    await this.modPage.closeAllToastNotifications();
    await this.pinNotes();
    await this.assertScreenshareStopped();
  }

  async pluginContentEjectsCoreContent() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await startScreenshare(this.modPage);
    await this.modPage.closeAllToastNotifications();
    await this.setPluginMainContent([PLUGIN_CONTENT_ID]);
    await this.modPage.hasElement(e.e2ePluginMainContent, 'should display the plugin content');
    await this.assertScreenshareStopped();

    // clearing first makes the same id count as new content again
    await this.setPluginMainContent([]);
    await this.modPage.wasRemoved(e.e2ePluginMainContent, 'should remove the plugin content');
    await this.pinNotes();
    await this.setPluginMainContent([PLUGIN_CONTENT_ID]);
    await this.modPage.hasElement(e.e2ePluginMainContent, 'should display the plugin content again');
    await this.modPage.wasRemoved(e.unpinNotes, 'new plugin content should unpin the shared notes');
  }
}
