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

// Slide assets are addressed by an opaque page id minted at conversion time
// (/svg/<pageId>), so a test cannot assert a page number anymore. Identify the
// displayed slide by its svg path instead, and assert navigation by that path
// changing (or returning to a previously captured slide).
const slideSvgPathRegex = /\/svg\/[^"'?&;\s>)]+/;

// Non-throwing reader: returns undefined while the slide image is absent, so it
// is safe to call from inside expect.poll during a slide transition.
async function readCurrentSlideSvgPath(testPage: Page): Promise<string | undefined> {
  const outerHtml = await testPage.page.evaluate(
    ([slideImg]) => document.querySelector(slideImg)?.outerHTML,
    [e.currentSlideImg],
  );
  return outerHtml?.match(slideSvgPathRegex)?.[0];
}

export async function getCurrentSlideSvgPath(
  testPage: Page,
  description: string,
  timeout = ELEMENT_WAIT_LONGER_TIME,
): Promise<string> {
  let svgPath: string | undefined;
  await expect
    .poll(
      async () => {
        svgPath = await readCurrentSlideSvgPath(testPage);
        return svgPath;
      },
      { message: description, timeout },
    )
    .toBeTruthy();
  return svgPath as string;
}

export async function expectSlideSvgPath(
  testPage: Page,
  expectedSvgPath: string,
  description: string,
  timeout = ELEMENT_WAIT_LONGER_TIME,
) {
  await expect
    .poll(async () => readCurrentSlideSvgPath(testPage), { message: description, timeout })
    .toBe(expectedSvgPath);
}

// A missing slide image counts as "not changed yet" so the poll keeps waiting
// instead of passing on a transient empty whiteboard.
export async function expectSlideChanged(
  testPage: Page,
  previousSvgPath: string,
  description: string,
  timeout = ELEMENT_WAIT_LONGER_TIME,
): Promise<string> {
  let svgPath: string | undefined;
  await expect
    .poll(
      async () => {
        svgPath = await readCurrentSlideSvgPath(testPage);
        return svgPath ?? previousSvgPath;
      },
      { message: description, timeout },
    )
    .not.toBe(previousSvgPath);
  return svgPath as string;
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
