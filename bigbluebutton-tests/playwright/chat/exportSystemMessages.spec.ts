import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';
import { openPublicChat } from './util';

test.describe('Export system messages', { tag: '@ci' }, () => {
  test('presentation download message exports as text (no token/URL)', async ({ browser, context, page }, testInfo) => {
    test.setTimeout(120_000);
    const mu = new MultiUsers(browser, context);
    await mu.initModPage(page, { testInfo });
    await mu.initUserPage(context, { testInfo });
    await openPublicChat(mu.modPage);

    // generate a PRESENTATION system message (send current state with annotations)
    await mu.modPage.waitForSelector(e.whiteboard);
    await mu.modPage.waitAndClick(e.actions);
    await mu.modPage.waitAndClick(e.managePresentations);
    await mu.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await mu.modPage.waitAndClick(e.sendPresentationInCurrentStateBtn);
    await mu.userPage.hasElement(e.downloadPresentation, 'download link should appear in chat', 90_000);

    await mu.modPage.waitAndClick(e.chatOptions);
    const { content } = await mu.modPage.handleDownload(mu.modPage.page.locator(e.chatSave));
    expect(content).toContain('Presentation available for download');
    expect(content).not.toContain('sessionToken');
  });

  test('deleted message exports with the deleted-by placeholder', async ({ browser, context, page }, testInfo) => {
    const mu = new MultiUsers(browser, context);
    await mu.initModPage(page, { testInfo });
    await openPublicChat(mu.modPage);

    await mu.modPage.fill(e.chatBox, 'to be deleted');
    await mu.modPage.waitAndClick(e.sendButton);
    const last = mu.modPage.page.locator(e.chatMessageItem).last();
    await last.hover();
    await mu.modPage.waitAndClick(e.deleteMessageButton);
    await mu.modPage.waitAndClick(e.confirmDeleteChatMessageButton);

    await mu.modPage.waitAndClick(e.chatOptions);
    const { content } = await mu.modPage.handleDownload(mu.modPage.page.locator(e.chatSave));
    expect(content).toContain('This message has been deleted by');
    expect(content).not.toContain('to be deleted');
  });
});
