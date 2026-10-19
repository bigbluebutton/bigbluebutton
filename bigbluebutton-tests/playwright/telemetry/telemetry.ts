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

const SUMMARY_KINDS = 5;
const TRAIL_PROBE_MESSAGE = 'telemetry trail probe text';

interface TrailAction {
  type: string;
  dataTest: string;
  operationName?: string;
}

declare global {
  interface Window {
    bbbTelemetry?: {
      dump: () => { enabled: boolean };
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
    const enabled = await this.modPage.page.evaluate(() => window.bbbTelemetry?.dump().enabled);
    expect(enabled, 'should report telemetry as disabled').toBe(false);
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
