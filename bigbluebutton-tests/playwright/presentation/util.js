const { expect } = require('@playwright/test');
const path = require('path');
const e = require('../core/elements');
const { UPLOAD_PDF_WAIT_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function checkSvgIndex(test, element) {
  const check = await test.page.evaluate(([el, slideImg]) => {
    return document.querySelector(slideImg).outerHTML.indexOf(el) !== -1;
  }, [element, e.currentSlideImg]);
  await expect(check).toBeTruthy();
}

async function getSlideOuterHtml(testPage) {
  return testPage.page.evaluate(([slideImg]) => {
    return document.querySelector(slideImg).outerHTML;
  }, [e.currentSlideImg]);
}

async function getCurrentPresentationHeight(locator) {
  return locator.evaluate((e) => {
    return window.getComputedStyle(e).getPropertyValue("height");
  });
}

async function uploadSinglePresentation(test, fileName, uploadTimeout = UPLOAD_PDF_WAIT_TIME) {
  const firstSlideSrc = await test.page.evaluate(selector => document.querySelector(selector)
    ?.style
    .backgroundImage
    .split('"')[1],
  [e.currentSlideImg]);
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.presentationFileUpload);

  await test.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
  await test.hasElement(e.presentationUploadProgressToast, ELEMENT_WAIT_EXTRA_LONG_TIME);
  await test.page.waitForFunction(([selector, firstSlideSrc]) => {
    const currentSrc = document.querySelector(selector)
    ?.style?.backgroundImage?.split('"')[1];
    return currentSrc != firstSlideSrc;
  }, [e.currentSlideImg, firstSlideSrc], {
    timeout: uploadTimeout,
  });
}

async function uploadMultiplePresentations(test, fileNames, uploadTimeout = ELEMENT_WAIT_EXTRA_LONG_TIME) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.presentationFileUpload);

  await test.page.setInputFiles(e.presentationFileUpload, fileNames.map((fileName) => path.join(__dirname, `../core/media/${fileName}`)));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
  await test.hasText(e.presentationStatusInfo, [e.convertingPresentationFileToast], uploadTimeout);
  await test.hasText(e.smallToastMsg, e.presentationUploadedToast, uploadTimeout);
}

async function skipSlide(page) {
  const selectSlideLocator = page.getLocator(e.skipSlide);
  const currentSlideNumber = await selectSlideLocator.inputValue();
  await page.waitAndClick(e.nextSlide);
  await expect(selectSlideLocator).not.toHaveValue(currentSlideNumber);
}

exports.checkSvgIndex = checkSvgIndex;
exports.getSlideOuterHtml = getSlideOuterHtml;
exports.uploadSinglePresentation = uploadSinglePresentation;
exports.uploadMultiplePresentations = uploadMultiplePresentations;
exports.getCurrentPresentationHeight = getCurrentPresentationHeight;
exports.skipSlide = skipSlide;
