const { expect } = require('@playwright/test');
const path = require('path');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME, UPLOAD_PDF_WAIT_TIME } = require('../core/constants');

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
  const firstSlideSrc = await test.page.evaluate(selector => document.querySelector(selector).src, [e.currentSlideImg]);
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.fileUpload);

  await test.page.setInputFiles(e.fileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
  await test.page.waitForFunction(([selector, firstSlideSrc]) => {
    const currentSrc = document.querySelector(selector).src;
    return currentSrc != firstSlideSrc;
  }, [e.currentSlideImg, firstSlideSrc], {
    timeout: uploadTimeout,
  });
}

async function uploadMultiplePresentations(test, fileNames, uploadTimeout = ELEMENT_WAIT_LONGER_TIME) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.fileUpload);

  await test.page.setInputFiles(e.fileUpload, fileNames.map((fileName) => path.join(__dirname, `../core/media/${fileName}`)));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
  await test.hasText(e.presentationStatusInfo, [e.convertingPresentationFileToast], uploadTimeout);
  await test.hasText(e.smallToastMsg, e.presentationUploadedToast, uploadTimeout);
}

exports.checkSvgIndex = checkSvgIndex;
exports.getSlideOuterHtml = getSlideOuterHtml;
exports.uploadSinglePresentation = uploadSinglePresentation;
exports.uploadMultiplePresentations = uploadMultiplePresentations;
exports.getCurrentPresentationHeight = getCurrentPresentationHeight;
