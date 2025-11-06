import { expect, Locator } from '@playwright/test';
import path from 'path';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_TIME, UPLOAD_PDF_WAIT_TIME } from '../core/constants';
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

export async function uploadSinglePresentation(testPage: Page, fileName: string, uploadTimeout = UPLOAD_PDF_WAIT_TIME) {
  const firstSlideSrc = await testPage.page.evaluate(
    ([selector]) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.style?.backgroundImage?.split('"')[1] ?? null;
    },
    [e.currentSlideImg],
  );
  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the presentation space for uploading a new file, when the manage presentations is opened',
  );

  await testPage.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await testPage.hasText(
    'body',
    e.statingUploadPresentationToast,
    'should display the toast message uploading the presentation',
  );

  await testPage.waitAndClick(e.confirmManagePresentation);
  await testPage.hasElement(
    e.presentationUploadProgressToast,
    'should display the toast presentation upload progress after confirming the presentation to be uploaded',
  );
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
  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the modal for uploading a new presentation after opening the manage presentations',
  );

  await testPage.page.setInputFiles(
    e.presentationFileUpload,
    fileNames.map((fileName) => path.join(__dirname, `../core/media/${fileName}`)),
  );
  await testPage.hasText(
    'body',
    e.statingUploadPresentationToast,
    'should display the toast of a presentation to be uploaded after selecting the files to upload',
  );

  await testPage.waitAndClick(e.confirmManagePresentation);
  await testPage.hasElement(
    e.presentationUploadProgressToast,
    'should display a toast presentation upload progress after confirming the presentation to be uploaded',
  );
  await testPage.hasNElements(
    e.processingPresentationItem,
    fileNames.length,
    'should display the presentation status info element with converting label after confirmation to upload the new file',
  );
  await testPage.hasNElements(
    e.uploadDoneIcon,
    fileNames.length,
    'should display the upload done icon after all presentations are successfully uploaded',
  );
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
