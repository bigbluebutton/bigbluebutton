import { expect, Locator } from '@playwright/test';
import path from 'path';

import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  UPLOAD_PDF_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function checkSvgIndex(testPage: Page, element: string) {
  await testPage.waitForSelector(e.currentSlideImg);
  const check = await testPage.page.evaluate(
    ([el, slideImg]) => {
      const node = document.querySelector(slideImg);
      return !!node && node.outerHTML.includes(el);
    },
    [element, e.currentSlideImg],
  );
  await expect(check).toBeTruthy();
}

export async function getSlideOuterHtml(testPage: Page) {
  await testPage.waitForSelector(e.currentSlideImg);
  return testPage.page.evaluate(([slideImg]) => document.querySelector(slideImg)?.outerHTML, [e.currentSlideImg]);
}

// sessionToken is per-user, so it differs between moderator and attendee pages.
// Strip it from the slide URL query string so cross-page comparisons match.
function stripSessionToken(html: string | undefined): string | undefined {
  if (!html) return html;
  return html
    .replace(/&amp;sessionToken=[^&"'\s<>]*/g, '')
    .replace(/&sessionToken=[^&"'\s<>]*/g, '')
    .replace(/\?sessionToken=[^&"'\s<>]*&amp;/g, '?')
    .replace(/\?sessionToken=[^&"'\s<>]*&/g, '?')
    .replace(/\?sessionToken=[^&"'\s<>]*/g, '');
}

// Cross-page comparison can race against subscription propagation
// Poll the user page until it matches the (already-stable) moderator slide.
export async function expectSlidesEqualBetweenPages(
  modPage: Page,
  userPage: Page,
  description: string,
  timeout = ELEMENT_WAIT_LONGER_TIME,
) {
  const modSlide = stripSessionToken(await getSlideOuterHtml(modPage));
  await expect
    .poll(async () => stripSessionToken(await getSlideOuterHtml(userPage)), { message: description, timeout })
    .toBe(modSlide);
}

export async function getCurrentPresentationHeight(locator: Locator) {
  return locator.evaluate((element) => window.getComputedStyle(element).getPropertyValue('height'));
}

// Rasterizes the current slide image (the server-generated SVG referenced by the
// tl-image background) onto an off-screen canvas and returns the fraction of
// near-black pixels. Used to detect slides that converted to a blank image, e.g.
// when an embedded figure is silently dropped during conversion (issue #23953).
export async function getCurrentSlideDarkPixelRatio(testPage: Page): Promise<number> {
  await testPage.waitForSelector(e.currentSlideImg);
  const slideUrl = await testPage.page.evaluate(
    ([selector]) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.style?.backgroundImage?.split('"')[1] ?? null;
    },
    [e.currentSlideImg],
  );
  expect(slideUrl, 'should resolve the current slide image URL from the whiteboard').toBeTruthy();

  // Fetch the SVG bytes through the authenticated browser context, then rasterize
  // it in-page via a same-origin blob URL so the canvas is not tainted.
  const response = await testPage.page.request.get(slideUrl as string);
  expect(response.ok(), `should fetch the current slide image (HTTP ${response.status()})`).toBeTruthy();
  const svg = await response.text();

  return testPage.page.evaluate(async (svgText) => {
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('failed to load slide image'));
        img.src = url;
      });
      const width = 400;
      const height = Math.max(1, Math.round((width * (img.height || 595)) / (img.width || 842)));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('failed to get canvas 2d context');
      // Composite over white so transparent regions read as white, matching the client.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const { data } = ctx.getImageData(0, 0, width, height);
      let dark = 0;
      const total = width * height;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] + data[i + 1] + data[i + 2] < 150) dark += 1;
      }
      return dark / total;
    } finally {
      URL.revokeObjectURL(url);
    }
  }, svg);
}

// The rendered slide image (a tldraw shape) keeps the aspect ratio of the source page,
// independent of the current zoom. Reading it lets a test assert that bbb-web sized the
// slide from the SVG's real dimensions instead of silently falling back to the 1440x1080
// (4:3) default. Returns null while the slide image has not laid out yet.
export async function getCurrentSlideAspectRatio(testPage: Page): Promise<number | null> {
  await testPage.waitForSelector(e.currentSlideImg);
  return testPage.page.evaluate(
    ([slideImg]) => {
      const node = document.querySelector(slideImg) as HTMLElement | null;
      if (!node) return null;
      const style = window.getComputedStyle(node);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      if (!width || !height) return null;
      return width / height;
    },
    [e.currentSlideImg],
  );
}

export async function getCurrentPresentationToastLocator(testPage: Page) {
  return testPage.page.locator(e.smallToastMsg).filter({ hasText: e.defaultCurrentPresentationLabel });
}

export async function hasCurrentPresentationToastElement(
  testPage: Page,
  { description, timeout = ELEMENT_WAIT_TIME }: { description?: string; timeout?: number } = {},
) {
  const toastLocator = await getCurrentPresentationToastLocator(testPage);
  await expect(
    toastLocator,
    description ?? 'should display the current presentation element after uploading the presentation',
  ).toBeVisible({ timeout });
}

export async function uploadSinglePresentation(
  testPage: Page,
  fileName: string,
  uploadTimeout = UPLOAD_PDF_WAIT_TIME,
  thumbnailIndex = 1,
) {
  const firstSlideSrc = await testPage.page.evaluate(
    ([selector]) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.style?.backgroundImage?.split('"')[1] ?? null;
    },
    [e.currentSlideImg],
  );
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the presentation space for uploading a new file, when the manage presentations is opened',
  );
  await testPage.page.waitForTimeout(500); // wait a bit for the presentations to load
  const numPresentationsBefore = await testPage.getSelectorCount(e.presentationThumbnails);

  await testPage.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));

  await testPage.hasElement(
    e.presentationUploadProgressToast,
    'should display the toast presentation upload progress after confirming the presentation to be uploaded',
  );
  // wait for the upload to finish
  await testPage.waitUntilHaveCountSelector(e.presentationThumbnails, numPresentationsBefore + 1, uploadTimeout);

  // select and share the uploaded presentation
  const newPDFThumbnail = await testPage.getLocatorByIndex(e.presentationThumbnails, thumbnailIndex);
  await newPDFThumbnail.click();
  await testPage.waitAndClick(e.sharePresentationButton);
  await testPage.press('Escape'); // close the media sharing menu
  // ensures current slide differs from previous slide - successful upload
  await testPage.page.waitForFunction(
    ([selector, previousSlideSrc]) => {
      if (typeof selector !== 'string') return false;
      const currentSrc = (document.querySelector(selector) as HTMLElement)?.style?.backgroundImage?.split('"')[1];
      return currentSrc !== previousSlideSrc;
    },
    [e.currentSlideImg, firstSlideSrc],
    {
      timeout: uploadTimeout,
    },
  );
  await hasCurrentPresentationToastElement(testPage, { timeout: uploadTimeout });
}

export async function uploadMultiplePresentations(
  testPage: Page,
  fileNames: string[],
  uploadTimeout = ELEMENT_WAIT_EXTRA_LONG_TIME,
) {
  // Capture the initial slide state before uploading
  const firstSlideSrc = await testPage.page.evaluate(
    ([selector]) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.style?.backgroundImage?.split('"')[1] ?? null;
    },
    [e.currentSlideImg],
  );
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the modal for uploading a new presentation after opening the manage presentations',
  );

  await testPage.page.setInputFiles(
    e.presentationFileUpload,
    fileNames.map((fileName) => path.join(__dirname, `../core/media/${fileName}`)),
  );
  await testPage.hasElement(
    e.presentationUploadProgressToast,
    'should display a toast presentation upload progress after confirming the presentation to be uploaded',
  );

  await testPage.hasNElements(
    e.uploadDoneIcon,
    fileNames.length,
    'should display the upload done icon after all presentations are successfully uploaded',
  );
  // wait for the uploads to finish
  await testPage.waitUntilHaveCountSelector(e.presentationThumbnails, fileNames.length + 1, uploadTimeout);
  // select and share a new uploaded presentation
  const newPDFThumbnail = await testPage.getLocatorByIndex(e.presentationThumbnails, 1);
  await newPDFThumbnail.click();
  await testPage.waitAndClick(e.sharePresentationButton);
  await testPage.press('Escape'); // close the media sharing menu
  // ensures current slide differs from previous slide - successful upload
  await testPage.page.waitForFunction(
    ([selector, previousSlideSrc]) => {
      if (typeof selector !== 'string') return false;
      const currentSrc = (document.querySelector(selector) as HTMLElement)?.style?.backgroundImage?.split('"')[1];
      return currentSrc !== previousSlideSrc;
    },
    [e.currentSlideImg, firstSlideSrc],
    {
      timeout: uploadTimeout,
    },
  );

  // Poll row count instead of asserting visibility on transient processing/done icons —
  // the toast auto-dismisses ~2s after completion and the status span briefly renders 0-height.
  const uploadItemsLocator = testPage.page.locator(`${e.processingPresentationItem}, ${e.uploadDoneIcon}`);
  await expect
    .poll(() => uploadItemsLocator.count(), {
      message: 'should display one upload row per file in the upload progress toast after confirming the upload',
      timeout: uploadTimeout,
    })
    .toBeGreaterThanOrEqual(fileNames.length);
  await hasCurrentPresentationToastElement(testPage, { timeout: uploadTimeout });
}

export async function skipSlide(testPage: Page) {
  const selectSlideLocator = testPage.page.locator(e.skipSlide);
  const currentSlideNumber = await selectSlideLocator.inputValue();
  await testPage.waitAndClick(e.nextSlide);
  await expect(selectSlideLocator).not.toHaveValue(currentSlideNumber);
}

export async function hasTextOnCurrentPresentationToast(
  testPage: Page,
  text: string,
  description: string,
  timeout = ELEMENT_WAIT_TIME,
) {
  const toastLocator = await getCurrentPresentationToastLocator(testPage);
  await expect(toastLocator, description).toContainText(text, { timeout });
}
