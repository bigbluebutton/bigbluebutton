import { expect } from '@playwright/test';

import { EMOJI_PICKER_SETTINGS_OVERRIDE } from '../chat/util';
import { elements as e } from '../core/elements';
import { endMeetings, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { LOGOUT_URL_CREATE_PARAMETER } from '../meetingEnded/meetingEnded';
import { selectLocale } from '../options/util';
import { MultiUsers } from '../user/multiusers';

const CREATE_PARAMETERS = [
  LOGOUT_URL_CREATE_PARAMETER,
  'learningDashboardEnabled=true',
  'sharedNotesEditor=blockNote',
].join('&');

const FLOATING_FORMATTING_TOOLBAR_SETTINGS_OVERRIDE = {
  public: {
    sharedNotes: {
      staticFormattingToolbar: false,
    },
  },
};

test.describe.parallel('Accessible control names', { tag: '@ci' }, () => {
  test('names chat, notes, and meeting-ended controls', async ({ browser, context, page, request }, testInfo) => {
    linkIssue(26613);
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, {
      clientSettingsOverrides: EMOJI_PICKER_SETTINGS_OVERRIDE,
      createParameter: CREATE_PARAMETERS,
      testInfo,
    });
    const { modPage } = session;

    await expect(
      modPage.page.locator(e.emojiPickerButton),
      'emoji picker button should expose its translated name',
    ).toHaveAccessibleName('Emoji Picker');
    await modPage.waitAndClick(e.emojiPickerButton);
    await expect(
      modPage.page.locator(`${e.emojiPicker} nav button`).first(),
      'frequently used emoji category should expose its translated name',
    ).toHaveAccessibleName('Frequently Used');
    await modPage.page.keyboard.press('Escape');

    await modPage.waitAndClick(e.sharedNotesSidebarButton);
    const editor = modPage.page.locator(e.blockNoteEditorByDataTest);
    await expect(editor, 'shared notes editor should expose its translated name').toHaveAccessibleName('Shared Notes');
    // BlockNote ships no Catalan dictionary, so this switch keeps the same editor instance.
    await selectLocale(modPage, 'ca');
    await expect(editor, 'shared notes editor name should follow a mid-session locale change').toHaveAccessibleName(
      'Notes compartides',
    );
    await editor.fill('Accessible notes');
    await expect(editor, 'shared notes editor should remain editable').toContainText('Accessible notes');
    await expect(editor, 'shared notes editor name should persist while typing').toHaveAccessibleName(
      'Notes compartides',
    );
    await selectLocale(modPage, 'en');
    await expect(editor).toHaveAccessibleName('Shared Notes');
    await editor.click();

    const blockTypeSelect = modPage.page.locator(e.blockTypeSelect);
    await expect(blockTypeSelect, 'block type select should name its current value').toHaveAccessibleName(
      'Text type: Paragraph',
    );
    await blockTypeSelect.focus();
    await modPage.page.keyboard.press('Tab');
    const forwardTabTarget = await modPage.page.evaluateHandle(() => document.activeElement);
    await expect(
      modPage.page.locator(e.blockNoteToolbar).locator(':focus'),
      'Tab should continue through the notes toolbar',
    ).toBeVisible();
    await modPage.page.keyboard.press('Shift+Tab');
    await expect(blockTypeSelect).toBeFocused();
    await modPage.page.keyboard.press('Shift+Tab');
    const backwardTabTarget = await modPage.page.evaluateHandle(() => document.activeElement);
    await modPage.page.keyboard.press('Tab');
    await expect(blockTypeSelect).toBeFocused();

    await modPage.page.keyboard.press('Enter');
    const menu = modPage.page.locator('[role="menu"]:visible');
    await expect
      .poll(() => menu.evaluate((element) => element.contains(document.activeElement)), {
        message: 'desktop menu should move focus inside the dropdown',
      })
      .toBe(true);
    await modPage.page.keyboard.press('Tab');
    await expect(menu).toBeHidden();
    await expect
      .poll(() => modPage.page.evaluate((target) => document.activeElement === target, forwardTabTarget), {
        message: 'Tab should move focus to the next control after closing the menu',
      })
      .toBe(true);

    await blockTypeSelect.focus();
    await modPage.page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await expect
      .poll(() => menu.evaluate((element) => element.contains(document.activeElement)), {
        message: 'desktop menu should move focus inside the dropdown',
      })
      .toBe(true);
    await modPage.page.keyboard.press('Shift+Tab');
    await expect(menu).toBeHidden();
    await expect
      .poll(() => modPage.page.evaluate((target) => document.activeElement === target, backwardTabTarget), {
        message: 'Shift+Tab should move focus to the previous control after closing the menu',
      })
      .toBe(true);

    await blockTypeSelect.focus();
    await modPage.page.keyboard.press('Enter');
    await expect
      .poll(() => menu.evaluate((element) => element.contains(document.activeElement)), {
        message: 'desktop menu should move focus inside the dropdown',
      })
      .toBe(true);
    await modPage.page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(blockTypeSelect).toBeFocused();

    await modPage.page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await modPage.page.keyboard.press('ArrowDown');
    await modPage.page.keyboard.press('Enter');
    await expect(blockTypeSelect, 'arrow keys should change the text type').toHaveAccessibleName(
      'Text type: Heading 1',
    );

    await endMeetings(request, [modPage.meetingId]);
    await expect(
      modPage.page.locator(e.learningDashboardButton),
      'learning dashboard button should expose its translated name',
    ).toHaveAccessibleName('Open Learning Analytics Dashboard');
    await expect(
      modPage.page.locator(e.redirectButton),
      'meeting-ended confirmation should expose its translated description',
    ).toHaveAccessibleDescription('Logs you out of the session');
  });

  test('names the text type select in the floating notes toolbar', async ({ browser, context, page }, testInfo) => {
    linkIssue(26613);
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, {
      clientSettingsOverrides: FLOATING_FORMATTING_TOOLBAR_SETTINGS_OVERRIDE,
      createParameter: CREATE_PARAMETERS,
      testInfo,
    });
    const { modPage } = session;

    await modPage.waitAndClick(e.sharedNotesSidebarButton);
    const editor = modPage.page.locator(e.blockNoteEditorByDataTest);
    await editor.fill('Floating toolbar');
    await expect(
      modPage.page.locator(e.blockNoteToolbar),
      'static toolbar should be off with staticFormattingToolbar=false',
    ).toHaveCount(0);
    await editor.press('ControlOrMeta+a');

    const floatingToolbar = modPage.page.locator(e.blockNoteFloatingToolbar);
    await expect(floatingToolbar, 'selecting text should open the floating toolbar').toBeVisible();
    const blockTypeSelect = floatingToolbar.getByRole('button').first();
    await expect(blockTypeSelect, 'floating block type select should name its current value').toHaveAccessibleName(
      'Text type: Paragraph',
    );

    await blockTypeSelect.click();
    await modPage.page
      .locator('[role="menu"]:visible')
      .getByRole('menuitem', { name: 'Heading 1', exact: true })
      .click();
    await editor.press('ControlOrMeta+a');
    await expect(
      floatingToolbar.getByRole('button').first(),
      'floating block type select name should follow the selected type',
    ).toHaveAccessibleName('Text type: Heading 1');
  });
});
