import { expect } from '@playwright/test';
import path from 'path';
import { elements as e } from '../core/elements.ts';
import {
  ELEMENT_WAIT_TIME,
  UPLOAD_PDF_WAIT_TIME,
  ELEMENT_WAIT_EXTRA_LONG_TIME,
} from '../core/constants.ts';

export async function checkSvgIndex(testPage, element) {
  const check = await testPage.page.evaluate(([el, slideImg]) => {
    return document.querySelector(slideImg).outerHTML.indexOf(el) !== -1;
  }, [element, e.currentSlideImg]);
  await expect(check).toBeTruthy();
}

export async function getSlideOuterHtml(testPage) {
  await testPage.waitForSelector(e.currentSlideImg);
  return testPage.page.evaluate(([slideImg]) => {
    return document.querySelector(slideImg).outerHTML;
  }, [e.currentSlideImg]);
}

export async function getCurrentPresentationHeight(locator) {
  return locator.evaluate((e) => {
    return window.getComputedStyle(e).getPropertyValue("height");
  });
}

export async function uploadSinglePresentation(testPage, fileName, uploadTimeout = UPLOAD_PDF_WAIT_TIME) {
  const firstSlideSrc = await testPage.page.evaluate(selector => document.querySelector(selector)
    ?.style.backgroundImage.split('"')[1],
    [e.currentSlideImg],
  );
  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(e.presentationFileUpload, 'should display the presentation space for uploading a new file, when the manage presentations is opened');

  await testPage.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await testPage.hasText('body', e.statingUploadPresentationToast, 'should display the toast message uploading the presentation');

  await testPage.waitAndClick(e.confirmManagePresentation);
  await testPage.hasElement(e.presentationUploadProgressToast, 'should display the toast presentation upload progress after confirming the presentation to be uploaded');
  // ensures the current slide (uploaded file) is different from the previous slide - successful upload
  await testPage.page.waitForFunction(([selector, firstSlideSrc]) => {
    const currentSrc = document.querySelector(selector)
    ?.style?.backgroundImage?.split('"')[1];
    return currentSrc != firstSlideSrc;
  }, [e.currentSlideImg, firstSlideSrc], {
    timeout: uploadTimeout,
  });
  await hasCurrentPresentationToastElement(testPage, { timeout: uploadTimeout });
}

export async function uploadMultiplePresentations(testPage, fileNames, uploadTimeout = ELEMENT_WAIT_EXTRA_LONG_TIME) {
  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(e.presentationFileUpload, 'should display the modal for uploading a new presentation after opening the manage presentations');

  await testPage.page.setInputFiles(e.presentationFileUpload, fileNames.map((fileName) => path.join(__dirname, `../core/media/${fileName}`)));
  await testPage.hasText('body', e.statingUploadPresentationToast, 'should display the toast of a presentation to be uploaded after selecting the files to upload');

  await testPage.waitAndClick(e.confirmManagePresentation);
  await testPage.hasElement(e.presentationUploadProgressToast, 'should display a toast presentation upload progress after confirming the presentation to be uploaded');
  await testPage.hasNElements(e.processingPresentationItem, fileNames.length, 'should display the presentation status info element with converting label after confirmation to upload the new file');
  await testPage.hasNElements(e.uploadDoneIcon, fileNames.length, 'should display the upload done icon after all presentations are successfully uploaded');
  await hasCurrentPresentationToastElement(testPage, { timeout: uploadTimeout });
}

export async function skipSlide(testPage) {
  const selectSlideLocator = testPage.page.locator(e.skipSlide);
  const currentSlideNumber = await selectSlideLocator.inputValue();
  await testPage.waitAndClick(e.nextSlide);
  await expect(selectSlideLocator).not.toHaveValue(currentSlideNumber);
}

export async function getCurrentPresentationToastLocator(testPage) {
  return testPage.page.locator(e.smallToastMsg).filter({ hasText: e.defaultCurrentPresentationLabel });
}

export async function hasCurrentPresentationToastElement(testPage, { description, timeout = ELEMENT_WAIT_TIME } = {}) {
  const toastLocator = await getCurrentPresentationToastLocator(testPage);
  await expect(toastLocator, description ?? 'should display the current presentation element after uploading the presentation').toBeVisible({ timeout });
}

export async function hasTextOnCurrentPresentationToast(page, text, description, timeout = ELEMENT_WAIT_TIME) {
  const toastLocator = await getCurrentPresentationToastLocator(page);
  await expect(toastLocator, description).toContainText(text, { timeout });
}
