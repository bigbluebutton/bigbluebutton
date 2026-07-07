import fs from 'fs';
import path from 'path';

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
  eventType?: 'paste' | 'drop';
}

function fixtureAsDataUrl(fileName: string, mimeType: string): string {
  const buffer = fs.readFileSync(path.join(__dirname, `../core/media/${fileName}`));
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Simulates a paste/drop of a file into the chat input by building a
// DataTransfer with a synthesized File and dispatching the corresponding event,
// which is how a user's clipboard/drop reaches the onPaste/onDrop handlers.
async function dispatchFile(testPage: Page, selector: string, file: SyntheticFile): Promise<void> {
  // Make sure the target (and thus its React paste/drop listeners) is mounted
  // and focused before dispatching, otherwise the synthetic event fires into
  // the void.
  await testPage.page.waitForSelector(selector, { state: 'visible' });
  await testPage.page.locator(selector).click();
  await testPage.page.evaluate(
    async ({ selector: sel, mimeType, fileName, dataUrl, sizeBytes, eventType }) => {
      let blob: Blob;
      if (dataUrl) {
        blob = await (await fetch(dataUrl)).blob();
      } else {
        blob = new Blob([new Uint8Array(sizeBytes ?? 0)], { type: mimeType });
      }
      const syntheticFile = new File([blob], fileName, { type: mimeType });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(syntheticFile);
      const element = document.querySelector(sel);
      if (!element) throw new Error(`element not found: ${sel}`);
      const event =
        eventType === 'drop'
          ? new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer })
          : new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dataTransfer });
      element.dispatchEvent(event);
    },
    {
      selector,
      mimeType: file.mimeType,
      fileName: file.fileName,
      dataUrl: file.dataUrl ?? null,
      sizeBytes: file.sizeBytes ?? null,
      eventType: file.eventType ?? 'paste',
    },
  );
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
      await this.modPage.wasRemoved(
        e.chatImagePreview,
        'should not show an image preview when image paste is disabled',
      );
      return;
    }

    await this.userPage.hasElementCount(e.chatUserMessageImage, 0, 'should start with no image messages');

    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/png',
      fileName: IMAGE_FIXTURE,
      dataUrl: fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'),
    });
    await this.modPage.hasElement(e.chatImagePreview, 'should show the pasted image preview above the input');

    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.wasRemoved(e.chatImagePreview, 'should clear the preview after sending');
    await this.modPage.hasElement(e.chatUserMessageImage, 'should render the sent image for the sender');
    await this.userPage.hasElement(e.chatUserMessageImage, 'should render the sent image for the second user');
  }

  async removePreviewBeforeSend() {
    await openPublicChat(this.modPage);
    await dispatchFile(this.modPage, e.chatBox, {
      mimeType: 'image/png',
      fileName: IMAGE_FIXTURE,
      dataUrl: fixtureAsDataUrl(IMAGE_FIXTURE, 'image/png'),
    });
    await this.modPage.hasElement(e.chatImagePreview, 'should show the pasted image preview');
    await this.modPage.waitAndClick(e.removeChatImageButton);
    await this.modPage.wasRemoved(e.chatImagePreview, 'should remove the preview when clicking remove');
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
    await this.modPage.wasRemoved(e.chatImagePreview, 'should not stage an oversize image');
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
    await this.modPage.wasRemoved(e.chatImagePreview, 'should not stage an unsupported image type');
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
}
