import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { test } from '../core/setup/fixtures';
import { captureGeometry, diffGeometry, Geometry, waitForStableGeometry } from './geometry/regions';
import { VIEWPORTS } from './geometry/scenarios';
import { newDeviceContext, openClient, recordLayoutProps } from './layoutDriver';

// Characterization of the layouts selected through the API: meetingLayout on create, enforceLayout
// and userdata-bbb_default_layout on join, their precedence, and the waitLayout gate.

interface Expectation {
  value: string;
  layout: string;
  /** golden scenario whose geometry this layout must reproduce */
  golden: string;
  viewport: { width: number; height: number };
  presentation: boolean;
}

const unifiedFallback = (value: string): Expectation => ({
  value,
  layout: 'unified',
  golden: 'unified-1366',
  viewport: VIEWPORTS.laptop,
  presentation: true,
});

const LAYOUTS: Expectation[] = [
  {
    value: 'UNIFIED_LAYOUT',
    layout: 'unified',
    golden: 'unified-1366',
    viewport: VIEWPORTS.laptop,
    presentation: true,
  },
  {
    value: 'CAMERAS_ONLY',
    layout: 'camerasOnly',
    golden: 'cameras-only-1920',
    viewport: VIEWPORTS.fullHd,
    presentation: false,
  },
  {
    value: 'PRESENTATION_ONLY',
    layout: 'presentationOnly',
    golden: 'presentation-only-1366',
    viewport: VIEWPORTS.laptop,
    presentation: true,
  },
  {
    value: 'PARTICIPANTS_AND_CHAT_ONLY',
    layout: 'participantsAndChatOnly',
    golden: 'participants-and-chat-only-1366',
    viewport: VIEWPORTS.laptop,
    presentation: false,
  },
  {
    value: 'MEDIA_ONLY',
    layout: 'mediaOnly',
    golden: 'media-only-1366',
    viewport: VIEWPORTS.laptop,
    presentation: true,
  },
  // PLUGINS_ONLY is not a supported layout, and legacy values and typos are unknown: all fall back
  unifiedFallback('PLUGINS_ONLY'),
  unifiedFallback('SMART_LAYOUT'),
  unifiedFallback('UNIFEID_LAYOUT'),
];

const goldenGeometry = (id: string): Geometry =>
  JSON.parse(fs.readFileSync(path.join(__dirname, 'geometry', 'goldens', `${id}.json`), 'utf8')).geometry;

const joinOptions = (expected: Expectation) => ({
  profile: expected.viewport,
  shouldCloseAudioModal: expected.layout !== 'presentationOnly',
  expectPresentation: expected.presentation,
});

test.describe('API layouts: meetingLayout on create', { tag: '@layout' }, () => {
  for (const expected of LAYOUTS) {
    test(`meetingLayout=${expected.value} starts in ${expected.layout}`, async ({ browser }, testInfo) => {
      const mod = await openClient(browser, testInfo, {
        ...joinOptions(expected),
        createParameter: `meetingLayout=${expected.value}`,
      });
      await expect(mod.page.locator('#layout')).toHaveAttribute('data-layout', expected.layout);
      await waitForStableGeometry(mod.page);
      const diffs = diffGeometry(goldenGeometry(expected.golden), await captureGeometry(mod.page));
      expect(diffs, `the regions of ${expected.layout} match the ${expected.golden} golden`).toEqual([]);
    });
  }

  test('A legacy meetingLayout leaves the presenter without a meeting layout to push', async ({
    browser,
  }, testInfo) => {
    const context = await newDeviceContext(browser);
    const sent = await recordLayoutProps(context);
    const mod = await openClient(browser, testInfo, { context, createParameter: 'meetingLayout=SMART_LAYOUT' });
    await expect(mod.page.locator('#layout')).toHaveAttribute('data-layout', 'unified');
    await mod.page.waitForTimeout(5000);
    expect(sent, 'no layout pushes').toEqual([]);
  });
});

test.describe('API layouts: enforceLayout on join', { tag: '@layout' }, () => {
  for (const expected of LAYOUTS) {
    test(`enforceLayout=${expected.value} joins in ${expected.layout}`, async ({ browser }, testInfo) => {
      const mod = await openClient(browser, testInfo, {
        ...joinOptions(expected),
        joinParameter: `enforceLayout=${expected.value}`,
      });
      await expect(mod.page.locator('#layout')).toHaveAttribute('data-layout', expected.layout);
    });
  }

  test('Precedence: enforceLayout > userdata-bbb_default_layout > meetingLayout', async ({ browser }, testInfo) => {
    const create = 'meetingLayout=MEDIA_ONLY';
    const meetingOnly = await openClient(browser, testInfo, { createParameter: create });
    await expect(meetingOnly.page.locator('#layout')).toHaveAttribute('data-layout', 'mediaOnly');

    const withDefault = await openClient(browser, testInfo, {
      meetingId: meetingOnly.meetingId,
      joinParameter: 'userdata-bbb_default_layout=CAMERAS_ONLY',
      expectPresentation: false,
    });
    await expect(withDefault.page.locator('#layout')).toHaveAttribute('data-layout', 'camerasOnly');

    const enforced = await openClient(browser, testInfo, {
      meetingId: meetingOnly.meetingId,
      joinParameter: 'userdata-bbb_default_layout=CAMERAS_ONLY&enforceLayout=PARTICIPANTS_AND_CHAT_ONLY',
      expectPresentation: false,
    });
    await expect(enforced.page.locator('#layout')).toHaveAttribute('data-layout', 'participantsAndChatOnly');
  });

  test('waitLayout: an enforced layout never shows unified first', async ({ browser }, testInfo) => {
    const context = await newDeviceContext(browser);
    // record every data-layout value #layout ever carries, from the first frame
    await context.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { layoutValuesSeen: string[] }).layoutValuesSeen = seen;
      const record = () => {
        const value = document.querySelector('#layout')?.getAttribute('data-layout');
        if (value && seen[seen.length - 1] !== value) seen.push(value);
      };
      new MutationObserver(record).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-layout'],
      });
    });
    const mod = await openClient(browser, testInfo, {
      context,
      joinParameter: 'enforceLayout=CAMERAS_ONLY',
      expectPresentation: false,
    });
    expect(new URL(mod.page.url()).searchParams.get('waitLayout'), 'bbb-web asks the client to wait').toBe('1');
    await expect(mod.page.locator('#layout')).toHaveAttribute('data-layout', 'camerasOnly');
    const seen = await mod.page.evaluate(() => (window as unknown as { layoutValuesSeen: string[] }).layoutValuesSeen);
    expect(seen, 'data-layout values in order').toEqual(['camerasOnly']);
  });
});
