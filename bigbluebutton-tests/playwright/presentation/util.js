const { expect } = require('@playwright/test');
const path = require('path');
const e = require('../core/elements');
const {
  ELEMENT_WAIT_TIME,
  UPLOAD_PDF_WAIT_TIME,
  ELEMENT_WAIT_EXTRA_LONG_TIME,
} = require('../core/constants');

async function checkSvgIndex(test, element) {
  const check = await test.page.evaluate(([el, slideImg]) => {
    return document.querySelector(slideImg).outerHTML.indexOf(el) !== -1;
  }, [element, e.currentSlideImg]);
  await expect(check).toBeTruthy();
}

async function getSlideOuterHtml(testPage) {
  await testPage.waitForSelector(e.currentSlideImg);
  return testPage.page.evaluate(([slideImg]) => {
    return document.querySelector(slideImg).outerHTML;
  }, [e.currentSlideImg]);
}

async function getCurrentPresentationHeight(locator) {
  return locator.evaluate((e) => {
    return window.getComputedStyle(e).getPropertyValue("height");
  });
}

async function uploadSinglePresentation(testPage, fileName, uploadTimeout = UPLOAD_PDF_WAIT_TIME) {
  const firstSlideSrc = await testPage.page.evaluate(selector => document.querySelector(selector)
    ?.style
    .backgroundImage
    .split('"')[1],
  [e.currentSlideImg]);
  await testPage.waitAndClick(e.mediaAreaButton);
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

async function uploadMultiplePresentations(testPage, fileNames, uploadTimeout = ELEMENT_WAIT_EXTRA_LONG_TIME) {
  await testPage.waitAndClick(e.mediaAreaButton);
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

async function skipSlide(page) {
  const selectSlideLocator = page.getLocator(e.skipSlide);
  const currentSlideNumber = await selectSlideLocator.inputValue();
  await page.waitAndClick(e.nextSlide);
  await expect(selectSlideLocator).not.toHaveValue(currentSlideNumber);
}

async function getCurrentPresentationToastLocator(page) {
  return page.getLocator(e.smallToastMsg).filter({ hasText: e.defaultCurrentPresentationLabel });
}

async function hasCurrentPresentationToastElement(page, { description, timeout = ELEMENT_WAIT_TIME } = {}) {
  const toastLocator = await getCurrentPresentationToastLocator(page);
  await expect(toastLocator, description ?? 'should display the current presentation element after uploading the presentation').toBeVisible({ timeout });
}

async function hasTextOnCurrentPresentationToast(page, text, description, timeout = ELEMENT_WAIT_TIME) {
  const toastLocator = await getCurrentPresentationToastLocator(page);
  await expect(toastLocator, description).toContainText(text, { timeout });
}

exports.checkSvgIndex = checkSvgIndex;
exports.getSlideOuterHtml = getSlideOuterHtml;
exports.uploadSinglePresentation = uploadSinglePresentation;
exports.uploadMultiplePresentations = uploadMultiplePresentations;
exports.getCurrentPresentationHeight = getCurrentPresentationHeight;
exports.skipSlide = skipSlide;
exports.getCurrentPresentationToastLocator = getCurrentPresentationToastLocator;
exports.hasCurrentPresentationToastElement = hasCurrentPresentationToastElement;
exports.hasTextOnCurrentPresentationToast = hasTextOnCurrentPresentationToast;
