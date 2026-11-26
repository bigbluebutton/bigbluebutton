import { type Download, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { APOLLO_CLIENT_SETTINGS_MODULE, isApolloClientExposed, runMutation } from '../core/apolloProbe';
import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { openPublicChat } from './util';

// How a chat message that carries a file (metadata.attachment) is drawn: the
// image card, the file row, the download action and the reply/pinned previews.
//
// The messages are sent through the client's own ChatSendMessage mutation,
// with the attachment the composer writes, after a real upload to the
// bbb-file-upload service. Images are drawn on a canvas in the page, so each
// test picks the shape it needs without a binary fixture per shape.

interface Attachment {
  url: string;
  name: string;
  size: number;
  mime: string;
}

const PDF_FIXTURE = path.join(__dirname, '../core/media/sample.pdf');

const CHAT_SEND_MESSAGE = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      variableDefinitions: [
        ['chatId', 'String', true],
        ['chatMessageInMarkdownFormat', 'String', true],
        ['metadata', 'json', false],
      ].map(([name, type, required]) => {
        const named = { kind: 'NamedType', name: { kind: 'Name', value: type } };
        return {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: name } },
          type: required ? { kind: 'NonNullType', type: named } : named,
        };
      }),
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'chatSendMessage' },
            arguments: ['chatId', 'chatMessageInMarkdownFormat', 'metadata'].map((name) => ({
              kind: 'Argument',
              name: { kind: 'Name', value: name },
              value: { kind: 'Variable', name: { kind: 'Name', value: name } },
            })),
          },
        ],
      },
    },
  ],
};

const sha256 = (buffer: Buffer): string => crypto.createHash('sha256').update(buffer).digest('hex');

async function downloadedBytes(download: Download): Promise<Buffer> {
  const file = await download.path();
  if (!file) throw new Error('the download was not saved');
  return fs.readFileSync(file);
}

// The message that carries the named file: the attachment itself, not a
// thumbnail of it quoted by a reply.
function messageWithFile(testPage: Page, name: string) {
  const attachment = `${e.chatAttachmentImage}[alt="${name}"], ${e.chatAttachmentFileName}:text-is("${name}")`;
  return testPage.page
    .locator('.chat-message-container')
    .filter({ has: testPage.page.locator(attachment) })
    .last();
}

export class ChatAttachmentRendering extends MultiUsers {
  async init(page: PlaywrightPage, testInfo: TestInfo) {
    await this.initModPage(page, { testInfo, createModules: APOLLO_CLIENT_SETTINGS_MODULE });
    await this.initUserPage(this.modPage.context, { testInfo });
    await openPublicChat(this.modPage);
    expect(
      await isApolloClientExposed(this.modPage.page, ELEMENT_WAIT_LONGER_TIME),
      'the meeting must expose the Apollo client (clientSettingsOverride) to send the attachment',
    ).toBe(true);
  }

  private async allowedMimeTypes(): Promise<string[]> {
    return this.modPage.page.evaluate(
      () =>
        (window as unknown as { meetingClientSettings: { public: { fileUpload?: { allowedMimeTypes?: string[] } } } })
          .meetingClientSettings.public.fileUpload?.allowedMimeTypes ?? [],
    );
  }

  // Uploads the bytes as the composer does and returns what the service answered.
  private async upload(name: string, mime: string, base64: string): Promise<Attachment> {
    const result = await this.modPage.page.evaluate(
      async ({ fileName, type, data }) => {
        const blob = await (await fetch(`data:${type};base64,${data}`)).blob();
        const form = new FormData();
        form.append('file', new File([blob], fileName, { type }));
        const token = sessionStorage.getItem('sessionToken');
        const response = await fetch(`/bigbluebutton/fileUpload/upload?sessionToken=${token}`, {
          method: 'POST',
          body: form,
        });
        return { status: response.status, body: await response.json() };
      },
      { fileName: name, type: mime, data: base64 },
    );
    expect(result.status, `the upload of ${name} should be accepted`).toBe(201);
    return {
      url: result.body.url,
      name: result.body.name ?? name,
      size: result.body.size ?? Buffer.from(base64, 'base64').length,
      mime: result.body.mime ?? mime,
    };
  }

  private async drawPng(width: number, height: number): Promise<string> {
    return this.modPage.page.evaluate(
      async ({ w, h }) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#1d4ed8');
        gradient.addColorStop(1, '#10b981');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b as Blob), 'image/png');
        });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        bytes.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });
        return btoa(binary);
      },
      { w: width, h: height },
    );
  }

  // The body the composer writes next to the attachment: the text, then the
  // image or a link to the file.
  private async send(attachment: Attachment, text: string): Promise<void> {
    const reference = attachment.mime.startsWith('image/')
      ? `![image](${attachment.url})`
      : `[${attachment.name}](${attachment.url})`;
    const result = await runMutation(this.modPage.page, {
      document: CHAT_SEND_MESSAGE,
      variables: {
        chatId: 'MAIN-PUBLIC-GROUP-CHAT',
        chatMessageInMarkdownFormat: [text, reference].filter(Boolean).join('\n\n'),
        metadata: { attachment },
      } as unknown as Record<string, string>,
    });
    expect(result.errors, 'chatSendMessage should be accepted').toEqual([]);
  }

  private async sendImage(name: string, width: number, height: number, text: string) {
    const attachment = await this.upload(name, 'image/png', await this.drawPng(width, height));
    await this.send(attachment, text);
    return attachment;
  }

  // The image spans the message box, with the text below it and the markdown
  // image it stands for removed; a narrow image keeps its shape with bands on
  // the sides.
  async rendersImageCard() {
    const text = 'Notes from the board';
    await this.sendImage('wide.png', 1600, 900, text);
    await this.sendImage('tall.png', 600, 1000, '');

    for (const testPage of [this.modPage, this.userPage]) {
      const wide = messageWithFile(testPage, 'wide.png');
      const frame = wide.locator(e.chatAttachmentImageButton);
      const image = wide.locator(e.chatAttachmentImage);
      await expect(image, 'the image should load').toHaveJSProperty('complete', true, {
        timeout: ELEMENT_WAIT_LONGER_TIME,
      });
      expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      const box = await wide.locator(e.chatMessageContentWrapper).boundingBox();
      const frameBox = await frame.boundingBox();
      expect(
        Math.abs((box?.width ?? 0) - (frameBox?.width ?? 0)),
        'the image should span the message box',
      ).toBeLessThanOrEqual(2);
      await expect(wide.locator(e.chatUserMessageText)).toHaveText(text);
      expect(
        (await wide.locator(e.chatUserMessageText).boundingBox())!.y,
        'the text should come below the image',
      ).toBeGreaterThan(frameBox!.y + frameBox!.height - 1);
      await expect(wide.locator('div[data-test="messageContent"] img'), 'no second copy of the image').toHaveCount(0);

      const tall = messageWithFile(testPage, 'tall.png');
      const tallFrame = await tall.locator(e.chatAttachmentImageButton).boundingBox();
      await expect(tall.locator(e.chatAttachmentImage)).toHaveJSProperty('complete', true, {
        timeout: ELEMENT_WAIT_LONGER_TIME,
      });
      const tallImage = await tall.locator(e.chatAttachmentImage).boundingBox();
      expect(tallImage!.width, 'a tall image should leave bands on the sides').toBeLessThan(tallFrame!.width - 10);
      expect(Math.round(tallImage!.height)).toBe(Math.round(tallFrame!.height));
      await expect(
        tall.locator('div[data-test="messageContent"]'),
        'an image with no text has no text area',
      ).toHaveCount(0);
    }

    // The lightbox still opens from the card, and closes with Escape.
    await messageWithFile(this.modPage, 'wide.png').locator(e.chatAttachmentImageButton).click();
    await this.modPage.hasElement(e.imageLightbox, 'should open the image enlarged');
    await this.modPage.page.keyboard.press('Escape');
    await this.modPage.wasRemoved(e.imageLightbox, 'Escape should close the enlarged image');
  }

  // The hover toolbar saves the attachment under its original name, with the
  // same bytes; a message without a file has no such action.
  async downloadsFromToolbar() {
    const base64 = await this.drawPng(800, 600);
    const attachment = await this.upload('board photo.png', 'image/png', base64);
    await this.send(attachment, 'Board photo');

    const message = messageWithFile(this.userPage, 'board photo.png');
    await message.hover();
    const [download] = await Promise.all([
      this.userPage.page.waitForEvent('download', { timeout: ELEMENT_WAIT_TIME }),
      message.locator(e.downloadMessageAttachmentButton).click(),
    ]);
    expect(download.suggestedFilename()).toBe('board photo.png');
    expect(sha256(await downloadedBytes(download)), 'the saved file should be the uploaded one').toBe(
      sha256(Buffer.from(base64, 'base64')),
    );

    await this.modPage.page.locator(e.chatBox).fill('Plain text message');
    await this.modPage.waitAndClick(e.sendButton);
    const plain = this.userPage.page
      .locator('.chat-message-container')
      .filter({ hasText: 'Plain text message' })
      .last();
    await plain.hover();
    await expect(plain.locator(e.messageToolbar)).toBeVisible();
    await expect(
      plain.locator(e.downloadMessageAttachmentButton),
      'no download for a message without a file',
    ).toHaveCount(0);
  }

  // A file that is not an image shows as a row with its name, size and type,
  // and a button that downloads it. Needs a service that accepts pdf.
  async rendersFileRow() {
    if (!(await this.allowedMimeTypes()).includes('application/pdf')) return;
    const bytes = fs.readFileSync(PDF_FIXTURE);
    const attachment = await this.upload('Lesson plan.pdf', 'application/pdf', bytes.toString('base64'));
    await this.send(attachment, 'The plan for today');

    const message = messageWithFile(this.userPage, 'Lesson plan.pdf');
    await expect(message.locator(e.chatAttachmentFileMeta)).toHaveText(/·\s*pdf$/);
    await expect(message.locator(e.chatUserMessageText)).toHaveText('The plan for today');
    await expect(message.locator('div[data-test="messageContent"] a'), 'no second link to the file').toHaveCount(0);
    const [download] = await Promise.all([
      this.userPage.page.waitForEvent('download', { timeout: ELEMENT_WAIT_TIME }),
      message.locator(e.chatAttachmentDownloadButton).click(),
    ]);
    expect(download.suggestedFilename()).toBe('Lesson plan.pdf');
    expect(sha256(await downloadedBytes(download))).toBe(sha256(bytes));
  }

  // Where the message is only quoted, an image shows as a thumbnail; the
  // reply being written, the replied message and the pinned message all do.
  async showsAttachmentInPreviews() {
    await this.sendImage('quoted.png', 1200, 800, 'What do you think of this one?');
    const message = messageWithFile(this.modPage, 'quoted.png');

    await message.hover();
    await message.locator(e.replyMessageButton).click();
    const intention = this.modPage.page.locator(e.chatReplyIntentionContainer);
    await expect(intention.locator(e.attachmentPreviewThumbnail)).toBeVisible();
    await this.modPage.page.locator(e.chatBox).fill('Looks great');
    await this.modPage.waitAndClick(e.sendButton);

    const reply = this.userPage.page.locator('.chat-message-container').filter({ hasText: 'Looks great' }).last();
    const replied = reply.locator(e.chatMessageReplied);
    await expect(replied.locator(e.attachmentPreviewThumbnail)).toBeVisible();
    await expect(replied).toContainText('What do you think of this one?');

    await message.hover();
    await message.locator(e.pinMessageButton).click();
    await this.modPage.page
      .getByRole('dialog')
      .getByRole('button', { name: /^(Pin|Replace)$/ })
      .click();
    const pinned = this.userPage.page.getByRole('region', { name: /pinned/i });
    await expect(pinned.locator(e.attachmentPreviewThumbnail)).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(pinned).toContainText('What do you think of this one?');
  }
}
