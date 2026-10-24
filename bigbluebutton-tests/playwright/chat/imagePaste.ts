import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { openPublicChat } from './util';

const IMAGE_FIXTURE = 'chatImage.png';

interface SyntheticFile {
  mimeType: string;
  fileName: string;
  dataUrl?: string;
  sizeBytes?: number;
  // 'dragenter' leaves the drag hovering over the target, without dropping.
  eventType?: 'paste' | 'drop' | 'dragenter';
}

function fixtureAsDataUrl(fileName: string, mimeType: string): string {
  const buffer = fs.readFileSync(path.join(__dirname, `../core/media/${fileName}`));
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Carries arbitrary bytes into the browser as file content. The media type here
// is deliberately generic: what the client sees as the file's type is the
// SyntheticFile.mimeType the File is constructed with, so content and declared
// type can be varied independently (which is the whole point of the spoofing
// cases below).
function bytesAsDataUrl(buffer: Buffer): string {
  return `data:application/octet-stream;base64,${buffer.toString('base64')}`;
}

// The 8-byte PNG signature followed by an IHDR chunk whose width/height fields
// claim the given size, and nothing else - no pixel data at all. That is the
// point: the service must reject an oversized image from the header alone,
// without decoding the bitmap, so the megabytes a real decompression bomb would
// carry are exactly what this fixture can leave out. The trailing CRC is left
// zeroed because a header parser reading dimensions never verifies it.
function pngHeaderClaiming(width: number, height: number): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // colour type: truecolour
  const chunkLength = Buffer.alloc(4);
  chunkLength.writeUInt32BE(ihdr.length, 0);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunkLength,
    Buffer.from('IHDR'),
    ihdr,
    Buffer.alloc(4),
  ]);
}

// Collects the status of every upload request the page makes, so a test can
// assert which layer did the rejecting. Without this, a client-side refusal and
// a server-side one are indistinguishable: both end in an error message.
function recordUploadStatuses(testPage: Page): number[] {
  const statuses: number[] = [];
  testPage.page.on('response', (response) => {
    if (response.url().includes('/bigbluebutton/fileUpload/upload')) statuses.push(response.status());
  });
  return statuses;
}

// Simulates a paste/drop of one or more files into the chat input by building a
// DataTransfer with synthesized Files and dispatching the corresponding event,
// which is how a user's clipboard/drop reaches the onPaste/onDrop handlers.
async function dispatchFiles(testPage: Page, selector: string, files: SyntheticFile[]): Promise<void> {
  // Make sure the target (and thus its React paste/drop listeners) is mounted
  // and focused before dispatching, otherwise the synthetic event fires into
  // the void.
  await testPage.page.waitForSelector(selector, { state: 'visible' });
  await testPage.page.locator(selector).click();
  await testPage.page.evaluate(
    async ({ selector: sel, items, eventType }) => {
      const dataTransfer = new DataTransfer();
      // eslint-disable-next-line no-restricted-syntax
      for (const item of items) {
        let blob: Blob;
        if (item.dataUrl) {
          // eslint-disable-next-line no-await-in-loop
          blob = await (await fetch(item.dataUrl)).blob();
        } else {
          blob = new Blob([new Uint8Array(item.sizeBytes ?? 0)], { type: item.mimeType });
        }
        dataTransfer.items.add(new File([blob], item.fileName, { type: item.mimeType }));
      }
      const element = document.querySelector(sel);
      if (!element) throw new Error(`element not found: ${sel}`);
      if (eventType === 'paste') {
        element.dispatchEvent(
          new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dataTransfer }),
        );
        return;
      }
      // A real drag enters the panel and moves over it before the drop.
      ['dragenter', 'dragover', eventType].forEach((type) => {
        element.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
      });
    },
    {
      selector,
      items: files.map((f) => ({
        mimeType: f.mimeType,
        fileName: f.fileName,
        dataUrl: f.dataUrl ?? null,
        sizeBytes: f.sizeBytes ?? null,
      })),
      eventType: files[0]?.eventType ?? 'paste',
    },
  );
}

// The chat panel content under the header: files dropped anywhere on it are staged.
const CHAT_PANEL = '#scroll-box';

interface FileUploadSettings {
  maxFileSizeKb: number;
  allowedMimeTypes: string[];
}

async function fileUploadSettings(testPage: Page): Promise<FileUploadSettings> {
  return testPage.page.evaluate(
    () =>
      (window as unknown as { meetingClientSettings: { public: { fileUpload: FileUploadSettings } } })
        .meetingClientSettings.public.fileUpload,
  );
}

async function allowedMimeTypes(testPage: Page): Promise<string[]> {
  return (await fileUploadSettings(testPage)).allowedMimeTypes;
}

async function dispatchFile(testPage: Page, selector: string, file: SyntheticFile): Promise<void> {
  await dispatchFiles(testPage, selector, [file]);
}

// Asserting the <img> is present is not enough: a broken image (e.g. a 401 from
// the file-upload GET) still leaves an <img> in the DOM. naturalWidth is 0 for an
// image that failed to decode and > 0 once the bytes actually loaded, so this
// proves the sent image really renders. Retried, because load/decode are async.
async function expectChatImageRendered(testPage: Page, description: string): Promise<void> {
  const image = testPage.page.locator(e.chatUserMessageImage).first();
  await expect(async () => {
    const naturalWidth = await image.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth, description).toBeGreaterThan(0);
  }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
}

export class ChatImagePaste extends MultiUsers {
  async pasteAndSendImage() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    await openPublicChat(this.modPage);

    // Feature off: pasting an image must be a no-op (no preview shown).
    if (!imagePasteEnabled) {
      await dispatchFile(this.modPage, e.chatBox, {
        mimeType: 'image/png',
        fileName: IMAGE_FIXTURE,
        dataUrl: fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'),
      });
      await this.modPage.wasRemoved(e.chatAttachments, 'should not show an image preview when image paste is disabled');
      return;
    }

    await this.userPage.hasElementCount(e.chatUserMessageImage, 0, 'should start with no image messages');

    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/png',
      fileName: IMAGE_FIXTURE,
      dataUrl: fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'),
    });
    await this.modPage.hasElement(e.chatAttachments, 'should show the pasted image preview above the input');

    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.wasRemoved(e.chatAttachments, 'should clear the preview after sending');
    await this.modPage.hasElement(e.chatUserMessageImage, 'should render the sent image for the sender');
    await expectChatImageRendered(
      this.modPage,
      'the sent image should actually load for the sender (naturalWidth > 0)',
    );
    await this.userPage.hasElement(e.chatUserMessageImage, 'should render the sent image for the second user');
    await expectChatImageRendered(
      this.userPage,
      'the sent image should actually load for the second user (naturalWidth > 0)',
    );
  }

  async removePreviewBeforeSend() {
    await openPublicChat(this.modPage);
    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/png',
      fileName: IMAGE_FIXTURE,
      dataUrl: fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'),
    });
    await this.modPage.hasElement(e.chatAttachments, 'should show the pasted image preview');
    await this.modPage.waitAndClick(e.removeChatAttachmentButton);
    await this.modPage.wasRemoved(e.chatAttachments, 'should remove the preview when clicking remove');
  }

  async rejectsOversizeImage() {
    await openPublicChat(this.modPage);
    // 6 MB, above the 5 MB default cap: the client rejects before uploading.
    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/png',
      fileName: 'huge.png',
      sizeBytes: 6 * 1024 * 1024,
    });
    await this.modPage.hasElement(e.errorTypingIndicator, 'should show an error for an oversize image');
    await this.modPage.wasRemoved(e.chatAttachments, 'should not stage an oversize image');
  }

  async rejectsUnsupportedType() {
    await openPublicChat(this.modPage);
    // SVG is an image type but not in the allowlist (stored-XSS vector).
    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/svg+xml',
      fileName: 'vector.svg',
      sizeBytes: 128,
    });
    await this.modPage.hasElement(e.errorTypingIndicator, 'should show an error for an unsupported image type');
    await this.modPage.wasRemoved(e.chatAttachments, 'should not stage an unsupported image type');
  }

  // rejectsUnsupportedType declares image/svg+xml, so the client's allowlist
  // refuses it and no request is ever made - the server-side gate is never
  // exercised. The client only ever inspects the *declared* type, so a file
  // announcing image/png sails past it however unrelated its bytes are. This
  // covers the gate that actually stops it: detectImage reading magic bytes.
  async rejectsSpoofedImageContent() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    if (!imagePasteEnabled) return;
    await openPublicChat(this.modPage);
    const uploadStatuses = recordUploadStatuses(this.modPage);

    // An SVG payload (the stored-XSS vector) wearing a PNG content type.
    const svgBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>');
    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/png',
      fileName: 'not-really.png',
      dataUrl: bytesAsDataUrl(svgBytes),
    });
    // The client stages it: its declared type is allowlisted. That is what makes
    // the server the only thing standing between this file and other users.
    await this.modPage.hasElement(e.chatAttachments, 'the client should stage a file whose declared type is allowed');

    await this.modPage.waitAndClick(e.sendButton);
    await expect(async () => {
      expect(uploadStatuses, 'the service should reject spoofed content by magic bytes (415)').toContain(415);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.modPage.hasElement(e.errorTypingIndicator, 'should surface the rejection to the user');
    await this.modPage.hasElementCount(
      e.chatUserMessageImage,
      0,
      'should not deliver a message for content that is not really an image',
    );
  }

  // A decompression bomb is small on the wire and enormous once decoded, so the
  // service reads the declared dimensions from the header and refuses before
  // decoding anything. The client cannot know the pixel size of a pasted file,
  // so this too can only be caught server-side.
  async rejectsImageExceedingDimensionCap() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    if (!imagePasteEnabled) return;
    await openPublicChat(this.modPage);
    const uploadStatuses = recordUploadStatuses(this.modPage);

    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/png',
      fileName: 'bomb.png',
      dataUrl: bytesAsDataUrl(pngHeaderClaiming(10000, 10000)),
    });
    // Well under the size cap, so nothing client-side objects to it.
    await this.modPage.hasElement(e.chatAttachments, 'the client should stage a small file with an allowed type');

    await this.modPage.waitAndClick(e.sendButton);
    await expect(async () => {
      expect(uploadStatuses, 'the service should reject oversized dimensions from the header (422)').toContain(422);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.modPage.hasElement(e.errorTypingIndicator, 'should surface the dimension rejection to the user');
    await this.modPage.hasElementCount(
      e.chatUserMessageImage,
      0,
      'should not deliver a message for an image above the dimension cap',
    );
  }

  // A clipboard can carry several files at once. Every one of them is staged,
  // and sending delivers one message per file, in order; the typed text goes
  // with the first one only.
  async stagesEveryFileAndSendsOneMessageEach() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    if (!imagePasteEnabled) return;
    await openPublicChat(this.modPage);
    const uploadStatuses = recordUploadStatuses(this.modPage);
    const text = 'three files at once';

    const image = fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png');
    await this.modPage.page.locator(e.chatBox).fill(text);
    await dispatchFiles(this.modPage, e.chatBox, [
      { mimeType: 'image/png', fileName: 'first.png', dataUrl: image },
      { mimeType: 'image/png', fileName: 'second.png', dataUrl: image },
      { mimeType: 'image/png', fileName: 'third.png', dataUrl: image },
    ]);
    await this.modPage.hasElementCount(e.chatAttachment, 3, 'should stage every file of the clipboard');
    await this.modPage.hasText(e.chatAttachmentMeta, /3 files/, 'should summarize the staged files');

    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.wasRemoved(e.chatAttachments, 'should clear the staged files once all are sent');
    await this.userPage.hasElementCount(e.chatUserMessageImage, 3, 'should deliver one image message per file');
    await expectChatImageRendered(this.userPage, 'the delivered images should actually load (naturalWidth > 0)');
    const messageWith = (fileName: string) =>
      this.userPage.page
        .locator('.chat-message-container')
        .filter({ has: this.userPage.page.locator(`${e.chatAttachmentImage}[alt="${fileName}"]`) });
    await expect(messageWith('first.png'), 'the text should go with the first file').toContainText(text);
    await expect(messageWith('second.png'), 'the text should not repeat on the next files').not.toContainText(text);
    await expect(messageWith('third.png'), 'the text should not repeat on the next files').not.toContainText(text);
    expect(
      uploadStatuses.filter((s) => s === 201),
      'each staged file should have been uploaded once',
    ).toHaveLength(3);
  }

  async removeOneOfSeveralFiles() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    if (!imagePasteEnabled) return;
    await openPublicChat(this.modPage);
    const image = fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png');
    await dispatchFiles(this.modPage, e.chatBox, [
      { mimeType: 'image/png', fileName: 'keep.png', dataUrl: image },
      { mimeType: 'image/png', fileName: 'drop.png', dataUrl: image },
    ]);
    await this.modPage.hasElementCount(e.chatAttachment, 2, 'should stage both files');
    await this.modPage.page.getByRole('button', { name: 'Remove drop.png' }).click();
    await this.modPage.hasElementCount(e.chatAttachment, 1, 'should unstage only the removed file');
    await this.modPage.hasText(e.chatAttachmentName, 'keep.png', 'should keep the other file staged');
  }

  // The attach button opens the browser file picker with the allowed types.
  async attachWithFilePicker() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    if (!imagePasteEnabled) {
      await openPublicChat(this.modPage);
      await this.modPage.wasRemoved(e.attachFileButton, 'should not offer to attach files when the feature is off');
      return;
    }
    await openPublicChat(this.modPage);
    const accept = await this.modPage.page.locator(e.chatFileInput).getAttribute('accept');
    expect(accept?.split(','), 'the picker should offer exactly the allowed types').toEqual(
      await allowedMimeTypes(this.modPage),
    );

    const chooser = this.modPage.page.waitForEvent('filechooser');
    await this.modPage.waitAndClick(e.attachFileButton);
    await (await chooser).setFiles(path.join(__dirname, `../core/media/${IMAGE_FIXTURE}`));
    await this.modPage.hasText(e.chatAttachmentName, IMAGE_FIXTURE, 'should stage the picked file');

    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.wasRemoved(e.chatAttachments, 'should clear the staged file after sending');
    await expectChatImageRendered(this.modPage, 'the picked image should be delivered and load');
  }

  // Dragging files over the chat panel shows the drop overlay with the limits
  // of the meeting settings; dropping stages the files.
  async dropOnChatPanel() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    if (!imagePasteEnabled) return;
    await openPublicChat(this.modPage);
    const image = fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png');

    await dispatchFiles(this.modPage, CHAT_PANEL, [
      { mimeType: 'image/png', fileName: IMAGE_FIXTURE, dataUrl: image, eventType: 'dragenter' },
    ]);
    await this.modPage.hasElement(e.chatFileDropOverlay, 'should show the drop overlay while dragging files');
    const { maxFileSizeKb } = await fileUploadSettings(this.modPage);
    await this.modPage.hasText(
      e.chatFileDropOverlay,
      `${Math.round(maxFileSizeKb / 1024)} MB`,
      'should state the configured size limit',
    );

    await dispatchFiles(this.modPage, CHAT_PANEL, [
      { mimeType: 'image/png', fileName: IMAGE_FIXTURE, dataUrl: image, eventType: 'drop' },
    ]);
    await this.modPage.wasRemoved(e.chatFileDropOverlay, 'should hide the overlay on drop');
    await this.modPage.hasText(e.chatAttachmentName, IMAGE_FIXTURE, 'should stage the dropped file');
  }

  // A file that is not an image is drawn as a file row with its name. Only
  // runs where the meeting allows such a type.
  async sendNonImageFile() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    if (!imagePasteEnabled) return;
    await openPublicChat(this.modPage);
    if (!(await allowedMimeTypes(this.modPage)).includes('application/pdf')) return;

    await this.modPage.page.locator(e.chatFileInput).setInputFiles(path.join(__dirname, '../core/media/sample.pdf'));
    await this.modPage.hasText(e.chatAttachmentMeta, /pdf/, 'should show the size and type of the staged pdf');
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.wasRemoved(e.chatAttachments, 'should clear the staged pdf after sending');
    await this.userPage.hasText(e.chatAttachmentFileName, 'sample.pdf', 'should deliver the pdf as a file row');
  }

  // A dropped connection mid-upload must not cost the user their image: the
  // upload runs on submit, so a failure has to leave the preview staged and the
  // send button usable, making a retry just pressing send again.
  async keepsImageStagedWhenUploadFails() {
    const { imagePasteEnabled } = this.modPage.settings || {};
    if (!imagePasteEnabled) return;
    await openPublicChat(this.modPage);

    const uploadRoute = '**/bigbluebutton/fileUpload/upload*';
    await this.modPage.page.route(uploadRoute, (route) => route.abort('connectionfailed'));

    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/png',
      fileName: IMAGE_FIXTURE,
      dataUrl: fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'),
    });
    await this.modPage.hasElement(e.chatAttachments, 'should stage the pasted image');
    await this.modPage.waitAndClick(e.sendButton);

    await this.modPage.hasElement(e.errorTypingIndicator, 'should report the failed upload');
    await this.modPage.hasElement(e.chatAttachments, 'should keep the image staged so the user can retry');
    await this.modPage.hasElementCount(e.chatUserMessageImage, 0, 'should not deliver a message for a failed upload');

    // Connection restored: the same staged image goes through on a plain retry,
    // with no need to paste it again.
    await this.modPage.page.unroute(uploadRoute);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.wasRemoved(e.chatAttachments, 'should clear the preview once the retry succeeds');
    await this.modPage.hasElement(e.chatUserMessageImage, 'should deliver the image on retry');
    await expectChatImageRendered(this.modPage, 'the retried image should actually load (naturalWidth > 0)');
  }

  // Even with images enabled, an externally hosted image is a tracking-pixel /
  // IP-leak vector: the server-side markdown renderer must drop it and keep only
  // same-origin (relative) sources.
  async dropsExternalImage() {
    const marker = 'external-image-check';
    await openPublicChat(this.modPage);
    await this.modPage.page.locator(e.chatBox).fill(`${marker} ![ext](https://example.com/tracker.png)`);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasText(e.chatUserMessageText, marker, 'should deliver the text of the message');
    await this.modPage.hasElementCount(e.chatUserMessageImage, 0, 'should strip the external image from the message');
  }

  // Companion to dropsExternalImage, for an image nested in another image's alt
  // text. CommonMark allows that, and the alt content of a rejected image is
  // promoted into the document when the image is unlinked, so a gate that only
  // recurses into the images it accepts never validates it.
  async dropsExternalImageNestedInAltText() {
    const marker = 'nested-image-check';
    const externalHost = 'tracker.invalid';
    const requestedExternalUrls: string[] = [];
    await this.modPage.page.route('**://' + externalHost + '/**', async (route) => {
      requestedExternalUrls.push(route.request().url());
      await route.abort();
    });

    await openPublicChat(this.modPage);
    await this.modPage.page
      .locator(e.chatBox)
      .fill(marker + ' ![foo ![bar](https://' + externalHost + '/pixel.png)](https://' + externalHost + '/outer.png)');
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasText(e.chatUserMessageText, marker, 'should deliver the text of the message');

    await this.modPage.page.waitForTimeout(2000);
    expect(
      requestedExternalUrls,
      'the reader browser must never request ' + externalHost + ' (IP leak / tracking pixel)',
    ).toEqual([]);
    await this.modPage.hasElementCount(
      e.chatUserMessageImage,
      0,
      'should strip an external image nested in the alt text of another image',
    );
  }
}
