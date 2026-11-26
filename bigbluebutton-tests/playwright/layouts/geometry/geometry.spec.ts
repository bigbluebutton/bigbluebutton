import { expect, test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { bundleNameOf, clientBuildLabel } from '../../core/clientBuild';
import { test } from '../../core/setup/fixtures';
import {
  minimizePresentation,
  moveDock,
  MULTI_FUNCTIONAL_MODE,
  openAuxiliaryWithUserList,
  openClient,
  openUserList,
  shareWebcam,
  startDockDrag,
  toggleChatPanel,
  webcamsFullscreen,
} from '../layoutDriver';
import { captureGeometry, diffGeometry, Geometry, waitForStableGeometry } from './regions';
import { Scenario, SCENARIOS } from './scenarios';

// Geometry goldens: every region's box per scenario, captured from the unchanged client. Run with
// GEOMETRY_UPDATE=1 (and BBB_CLIENT_DIST pointing at the reference build) to rewrite the goldens.
// Tagged @layout only: CI runners differ in timing and fonts.

const GOLDENS_DIR = path.join(__dirname, 'goldens');
const UPDATE = process.env.GEOMETRY_UPDATE === '1';
const TOLERANCE_PX = 2;

interface Golden {
  scenario: Scenario;
  capturedWith: string;
  geometry: Geometry;
}

const goldenPath = (id: string) => path.join(GOLDENS_DIR, `${id}.json`);

function joinParameters(scenario: Scenario): string | undefined {
  const params = [
    scenario.rtl && 'userdata-bbb_override_default_locale=ar',
    scenario.hideNavBar && 'userdata-bbb_hide_nav_bar=true',
    scenario.hideActionsBar && 'userdata-bbb_hide_actions_bar=true',
    scenario.hideControls && 'userdata-bbb_hide_controls=true',
  ].filter(Boolean);
  return params.length ? params.join('&') : undefined;
}

function createParameters(scenario: Scenario): string | undefined {
  const params = [
    scenario.layout && `meetingLayout=${scenario.layout}`,
    scenario.banner && 'bannerText=Layout+golden+banner',
  ].filter(Boolean);
  return params.length ? params.join('&') : undefined;
}

test.describe('Layout geometry goldens', { tag: '@layout' }, () => {
  for (const scenario of SCENARIOS) {
    test(scenario.id, async ({ browser }, testInfo) => {
      test.setTimeout(4 * 60_000);
      const common = {
        profile: scenario.profile,
        // presentationOnly renders no audio container, so there is no audio modal to close
        shouldCloseAudioModal: scenario.layout !== 'PRESENTATION_ONLY',
        expectPresentation: scenario.layout !== 'CAMERAS_ONLY' && scenario.layout !== 'PARTICIPANTS_AND_CHAT_ONLY',
        joinParameter: joinParameters(scenario),
        clientSettingsOverrides: scenario.sidebar === 'auxiliary' ? MULTI_FUNCTIONAL_MODE : undefined,
      };
      const mod = await openClient(browser, testInfo, {
        ...common,
        fullName: 'Moderator',
        createParameter: createParameters(scenario),
      });
      const needsSecondUser = scenario.cameras === 2 || scenario.cameras === 'avatars';
      if (needsSecondUser) {
        const attendee = await openClient(browser, testInfo, {
          ...common,
          fullName: 'Attendee',
          isModerator: false,
          meetingId: mod.meetingId,
        });
        if (scenario.cameras === 2) await shareWebcam(attendee);
      }

      if (scenario.sidebar === 'closed') await toggleChatPanel(mod);
      if (scenario.sidebar === 'userList') await openUserList(mod);
      if (scenario.sidebar === 'auxiliary') await openAuxiliaryWithUserList(mod);
      if (scenario.cameras === 1 || scenario.cameras === 2) await shareWebcam(mod);
      if (scenario.presentation === 'minimized') await minimizePresentation(mod);
      if (scenario.dock) await moveDock(mod.page, scenario.dock);
      if (scenario.webcamsFullscreen) await webcamsFullscreen(mod);
      if (scenario.midDrag) await startDockDrag(mod.page);

      await waitForStableGeometry(mod.page);
      const geometry = await captureGeometry(mod.page);
      await testInfo.attach('geometry.json', {
        body: JSON.stringify(geometry, null, 2),
        contentType: 'application/json',
      });
      if (scenario.midDrag) await mod.page.mouse.up();

      if (UPDATE) {
        const dist = process.env.BBB_CLIENT_DIST;
        const golden: Golden = {
          scenario,
          capturedWith: dist ? `${clientBuildLabel(dist)} (${bundleNameOf(dist)})` : 'server client',
          geometry,
        };
        fs.mkdirSync(GOLDENS_DIR, { recursive: true });
        fs.writeFileSync(goldenPath(scenario.id), `${JSON.stringify(golden, null, 2)}\n`);
        return;
      }

      base.skip(!fs.existsSync(goldenPath(scenario.id)), `no golden for ${scenario.id}`);
      const golden: Golden = JSON.parse(fs.readFileSync(goldenPath(scenario.id), 'utf8'));
      const perRegion = Object.fromEntries(
        Object.entries(scenario.tolerance ?? {}).map(([region, { px }]) => [region, px]),
      );
      const diffs = diffGeometry(golden.geometry, geometry, TOLERANCE_PX, perRegion);
      expect(diffs, `geometry of ${scenario.id} should match its golden (${golden.capturedWith})`).toEqual([]);
    });
  }
});
