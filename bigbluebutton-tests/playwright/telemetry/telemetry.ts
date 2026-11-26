import { expect } from '@playwright/test';

import { openPublicChat } from '../chat/util';
import { elements as e } from '../core/elements';
import { ClientSettingsOverrides } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// Both set telemetry.enabled explicitly, so the result does not depend on the server's settings.
// enableDebugWindow is on by default but deployments may turn it off.
export const TELEMETRY_ON: ClientSettingsOverrides = {
  public: { app: { enableDebugWindow: true, telemetry: { enabled: true } } },
};
export const TELEMETRY_OFF: ClientSettingsOverrides = {
  public: { app: { enableDebugWindow: true, telemetry: { enabled: false } } },
};

const SUMMARY_KINDS = 6;
const PLUGIN_METRIC = 'bbb.client.plugin.duration';

// The plugin test needs a plugin server; it runs only when this points at a manifest.json
export const { PLUGIN_MANIFEST_URL } = process.env;
export const pluginCreateParameter = (manifestUrl: string) =>
  `pluginManifests=${encodeURIComponent(JSON.stringify([{ url: manifestUrl }]))}`;

interface SeriesItem {
  metric: string;
  attributes: Record<string, string>;
  count: number;
}
const TRAIL_PROBE_MESSAGE = 'telemetry trail probe text';

interface TrailAction {
  type: string;
  dataTest: string;
  operationName?: string;
}

declare global {
  interface Window {
    bbbTelemetry?: {
      dump: () => { enabled: boolean; series: SeriesItem[] };
      stats: () => Record<string, { count: number }>;
      trail: () => { actions: TrailAction[] };
    };
  }
}

export class Telemetry extends MultiUsers {
  async openDebugWindow() {
    await this.modPage.page.keyboard.press('Alt+KeyK');
    await this.modPage.hasElement(e.debugWindow, 'should open the debug window with its shortcut');
  }

  async performanceSectionListsMeasurements() {
    await this.openDebugWindow();
    await this.modPage.hasElement(e.debugWindowPerformance, 'should show the Performance section when telemetry is on');
    await this.modPage.hasElementCount(
      `${e.debugWindowPerformanceSummary} tbody tr`,
      SUMMARY_KINDS,
      'should list one summary row per measurement kind',
    );
    // Joining renders the app and runs GraphQL subscriptions, so both kinds have measurements
    await expect
      .poll(() => this.modPage.page.evaluate(() => window.bbbTelemetry?.stats().graphql.count ?? 0), {
        message: 'should have measured GraphQL operations during the join',
      })
      .toBeGreaterThan(0);
    await expect
      .poll(() => this.modPage.page.evaluate(() => window.bbbTelemetry?.stats().request.count ?? 0), {
        message: 'should have measured HTTP requests during the join',
      })
      .toBeGreaterThan(0);
  }

  async performanceSectionAbsentWhenOff() {
    await this.openDebugWindow();
    await this.modPage.hasElementCount(
      e.debugWindowPerformance,
      0,
      'should not show the Performance section with telemetry off',
    );
    const exposed = await this.modPage.page.evaluate(() => window.bbbTelemetry !== undefined);
    expect(exposed, 'should not expose the telemetry global with telemetry off').toBe(false);
  }

  // The plugin from PLUGIN_MANIFEST_URL: its script load is timed and attributed to it by name, and it
  // shows in the Plugins table. Checked by name because the server may load other plugins in every
  // meeting, and any of them would satisfy a check for "some plugin".
  async pluginLoadIsMeasured(manifestUrl: string) {
    const manifest = await this.modPage.page.request.get(manifestUrl);
    expect(manifest.ok(), `should fetch the plugin manifest at ${manifestUrl}`).toBeTruthy();
    const { name: pluginName } = await manifest.json();
    expect(pluginName, 'should find the plugin name in the manifest').toBeTruthy();

    const pluginPhases = () =>
      this.modPage.page.evaluate(
        (metric) =>
          window.bbbTelemetry
            ?.dump()
            .series.filter((item) => item.metric === metric)
            .map((item) => ({
              plugin: item.attributes['bbb.plugin.name'],
              phase: item.attributes['bbb.plugin.phase'],
              failed: item.attributes['bbb.plugin.failed'],
            })) ?? [],
        PLUGIN_METRIC,
      );
    await expect
      .poll(pluginPhases, { message: `should time the script load of ${pluginName}`, timeout: 30000 })
      .toContainEqual({ plugin: pluginName, phase: 'load', failed: 'false' });

    await this.openDebugWindow();
    await this.modPage.hasElement(
      `${e.debugWindowPlugins} td >> text=${pluginName}`,
      'should list the plugin in the debug window Plugins table',
    );
  }

  async reproTrailKeepsControlsNotContent() {
    await openPublicChat(this.modPage);
    await this.modPage.fill(e.chatBox, TRAIL_PROBE_MESSAGE);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElementCount(e.chatUserMessageText, 1, 'should display the sent message');

    const trail = await this.modPage.page.evaluate(() => window.bbbTelemetry?.trail());
    expect(trail, 'should expose the repro trail').toBeDefined();
    expect(JSON.stringify(trail), 'should never record typed text').not.toContain(TRAIL_PROBE_MESSAGE);
    expect(trail?.actions, 'should record the send button by its data-test').toContainEqual(
      expect.objectContaining({ type: 'click', dataTest: 'sendMessageButton' }),
    );
    expect(trail?.actions, 'should record the mutation by name').toContainEqual(
      expect.objectContaining({ type: 'mutation', operationName: 'ChatSendMessage' }),
    );

    await this.openDebugWindow();
    await this.modPage.hasElement(e.debugWindowRecentActions, 'should list the recent actions in the debug window');
  }
}
