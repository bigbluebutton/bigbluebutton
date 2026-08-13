import { expect, Locator } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { Chat } from './chat';
import { openPrivateChat } from './util';

const LONG_PARTICIPANT_NAME = 'Alexandra-Montgomery-Sutherland';
const JOIN_PARAMETERS = 'userdata-bbb_override_default_locale=en&userdata-bbb_auto_join_audio=false';
const VIDEO_FRAME_DELAY = 750;
const VIEWPORT = { width: 1366, height: 768 };

interface InputMetrics {
  clientHeight: number;
  clientWidth: number;
  overflowX: string;
  overflowY: string;
  placeholder: string;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  value: string;
  whiteSpace: string;
}

async function getInputMetrics(input: Locator): Promise<InputMetrics> {
  return input.evaluate((element: HTMLTextAreaElement) => {
    const style = window.getComputedStyle(element);
    return {
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      placeholder: element.placeholder,
      scrollHeight: element.scrollHeight,
      scrollLeft: element.scrollLeft,
      scrollWidth: element.scrollWidth,
      value: element.value,
      whiteSpace: style.whiteSpace,
    };
  });
}

test.use({
  screenshot: 'only-on-failure',
  trace: 'off',
  video: 'retain-on-failure',
});

test.describe('Private chat input visual evidence', { tag: '@ci' }, () => {
  test('Reproduce the placeholder and caret transition when clearing a narrow private chat input', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await page.setViewportSize(VIEWPORT);
    const chat = new Chat(browser, context);

    await chat.initModPage(page, {
      joinParameter: JOIN_PARAMETERS,
      shouldCloseAudioModal: false,
      testInfo,
    });
    await chat.initUserPage(context, {
      fullName: LONG_PARTICIPANT_NAME,
      joinParameter: JOIN_PARAMETERS,
      shouldCloseAudioModal: false,
      testInfo,
    });

    await openPrivateChat(chat.modPage);
    await chat.modPage.hasElement(e.hidePrivateChat, 'private chat should be open for the moderator');

    const input = chat.modPage.page.locator(e.chatBox);
    const sidebar = chat.modPage.page.locator(e.sidebarContentMain);

    await expect(input).toHaveAttribute('placeholder', `Message Private Chat with ${LONG_PARTICIPANT_NAME}`);
    await expect(chat.modPage.page.locator(e.resizeSidebarContentMain)).toBeVisible();

    const initialSidebarWidth = await sidebar.evaluate((element) => element.getBoundingClientRect().width);
    await chat.modPage.dragResizeHandle(e.resizeSidebarContentMain, 500);
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThan(initialSidebarWidth);

    await chat.modPage.waitAndClick(e.chatTitle);
    await chat.modPage.page.waitForTimeout(VIDEO_FRAME_DELAY);
    const expandedMetrics = await getInputMetrics(input);
    expect(expandedMetrics.scrollWidth, 'placeholder should fit before shrinking the sidebar').toBeLessThanOrEqual(
      expandedMetrics.clientWidth,
    );
    const expandedSidebarWidth = await sidebar.evaluate((element) => element.getBoundingClientRect().width);
    await chat.modPage.dragResizeHandle(e.resizeSidebarContentMain, -1000);
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().width))
      .toBeLessThan(expandedSidebarWidth);

    await chat.modPage.page.waitForTimeout(VIDEO_FRAME_DELAY);
    const clippedMetrics = await getInputMetrics(input);
    expect(clippedMetrics.scrollWidth, 'placeholder should be clipped after shrinking the sidebar').toBeGreaterThan(
      clippedMetrics.clientWidth,
    );
    await input.focus();
    await input.press('Home');
    await chat.modPage.page.waitForTimeout(VIDEO_FRAME_DELAY);

    // Match the supplied reproduction: type "test", erase it one character at a time,
    // then repeatedly type and erase a single "a" while the placeholder remains clipped.
    await input.pressSequentially('test', { delay: 250 });
    await expect(input).toHaveValue('test');
    await chat.modPage.page.waitForTimeout(VIDEO_FRAME_DELAY);
    const transitionMetrics: Array<{ state: string; metrics: InputMetrics }> = [];
    transitionMetrics.push({ state: 'test', metrics: await getInputMetrics(input) });

    for (let remainingCharacters = 3; remainingCharacters >= 0; remainingCharacters -= 1) {
      await input.press('Backspace');
      await expect(input).toHaveValue('test'.slice(0, remainingCharacters));
      await chat.modPage.page.waitForTimeout(300);
    }

    transitionMetrics.push({ state: 'placeholder-after-test', metrics: await getInputMetrics(input) });
    await chat.modPage.page.waitForTimeout(VIDEO_FRAME_DELAY);
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      await input.press('a');
      await expect(input).toHaveValue('a');
      transitionMetrics.push({ state: `a-${cycle}`, metrics: await getInputMetrics(input) });
      await chat.modPage.page.waitForTimeout(VIDEO_FRAME_DELAY);

      await input.press('Backspace');
      await expect(input).toHaveValue('');
      transitionMetrics.push({ state: `placeholder-after-a-${cycle}`, metrics: await getInputMetrics(input) });
      await chat.modPage.page.waitForTimeout(VIDEO_FRAME_DELAY);
    }

    await testInfo.attach('private-chat-input-metrics', {
      body: Buffer.from(JSON.stringify({ expandedMetrics, clippedMetrics, transitionMetrics }, null, 2)),
      contentType: 'application/json',
    });

    const clearedInputHeights = transitionMetrics
      .filter(({ state }) => state.startsWith('placeholder-after-'))
      .map(({ metrics }) => metrics.clientHeight);
    expect(clearedInputHeights, 'clearing the input should restore the original single-line textarea height').toEqual(
      clearedInputHeights.map(() => clippedMetrics.clientHeight),
    );

    await Promise.all([chat.modPage.page.close(), chat.userPage.page.close()]);
  });
});
