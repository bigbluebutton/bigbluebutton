const { expect } = require('@playwright/test');
const path = require('path');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

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

async function uploadPresentation(test, fileName, uploadTimeout = ELEMENT_WAIT_LONGER_TIME) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.fileUpload);

  await test.page.setInputFiles(e.fileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
  await test.hasText(e.presentationStatusInfo, e.convertingPresentationFileToast, uploadTimeout);
  await test.hasText(e.smallToastMsg, e.presentationUploadedToast, uploadTimeout);
}

exports.checkSvgIndex = checkSvgIndex;
exports.getSlideOuterHtml = getSlideOuterHtml;
exports.uploadPresentation = uploadPresentation;
