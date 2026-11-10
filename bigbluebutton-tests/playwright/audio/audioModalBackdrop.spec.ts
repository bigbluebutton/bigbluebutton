import { expect, Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { Audio } from './audio';

// Serves modals.css without the `position: relative` the modal layers rely on for
// their z-index, as a browser holding the stylesheet of an older client build does.
async function serveModalsCssWithoutLayerPositioning(page: PlaywrightPage) {
  await page.route('**/stylesheets/modals.css*', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/position:\s*relative;/g, '');
    await route.fulfill({ response, body });
  });
}

async function topmostElementIsInsideAudioModal(page: PlaywrightPage) {
  return page.evaluate((selector) => {
    const modal = document.querySelector(selector);
    if (!modal) return false;
    const { x, y, width, height } = modal.getBoundingClientRect();
    const topmost = document.elementFromPoint(x + width / 2, y + height / 2);
    return !!topmost && modal.contains(topmost);
  }, e.audioModal);
}

async function audioModalBackdropFilter(page: PlaywrightPage) {
  return page.evaluate((selector) => {
    const overlay = document.querySelector(selector)?.parentElement;
    return overlay ? getComputedStyle(overlay).backdropFilter : null;
  }, e.audioModal);
}

test.describe('Audio modal backdrop on join', { tag: ['@ci'] }, () => {
  const scenarios = [
    { name: 'with the current stylesheets', staleModalsCss: false },
    { name: 'with a modals.css from an older client build', staleModalsCss: true },
  ];

  for (const { name, staleModalsCss } of scenarios) {
    test(`keeps the audio modal above its blurred backdrop ${name}`, async ({ browser, context, page }, testInfo) => {
      if (staleModalsCss) await serveModalsCssWithoutLayerPositioning(page);
      const audio = new Audio(browser, context);
      await audio.initModPage(page, { shouldCloseAudioModal: false, testInfo });
      const { modPage } = audio;
      test.skip(!modPage.settings?.autoJoinAudioModal, 'the audio modal only opens on join when autoJoin is enabled');

      await modPage.hasElement(e.audioModal, 'should open the audio modal on join', ELEMENT_WAIT_EXTRA_LONG_TIME);
      await expect
        .poll(() => topmostElementIsInsideAudioModal(page), {
          message: 'the audio modal should not be covered by its blurred backdrop',
        })
        .toBe(true);
      await expect
        .poll(() => audioModalBackdropFilter(page), { message: 'should blur the meeting behind the audio modal' })
        .toContain('blur');
    });
  }
});
