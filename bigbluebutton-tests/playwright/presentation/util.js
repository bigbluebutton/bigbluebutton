const { expect } = require('@playwright/test');
const path = require('path');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function checkSvgIndex(test, element) {
  const check = await test.page.evaluate(([el]) => {
    return document.querySelector('svg g g g').outerHTML.indexOf(el) !== -1;
  }, [element]);
  await expect(check).toBeTruthy();
}

function getSvgOuterHtml() {
  return document.querySelector('svg g g g').outerHTML;
}

async function uploadPresentation(test, fileName, uploadTimeout = ELEMENT_WAIT_LONGER_TIME) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.fileUpload);

  await test.page.setInputFiles(e.fileUpload, path.join(__dirname, `../media/${fileName}`));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
  await test.hasText('body', e.convertingPresentationFileToast);

  await test.hasText('body', e.presentationUploadedToast, uploadTimeout);
}

exports.checkSvgIndex = checkSvgIndex;
exports.getSvgOuterHtml = getSvgOuterHtml;
exports.uploadPresentation = uploadPresentation;
