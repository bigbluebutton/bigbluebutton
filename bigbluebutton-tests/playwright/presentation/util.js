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

async function uploadSinglePresentation(test, fileName, uploadTimeout = ELEMENT_WAIT_LONGER_TIME) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.fileUpload);

  await test.page.setInputFiles(e.fileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
  await test.hasText(e.presentationStatusInfo, e.convertingPresentationFileToast, uploadTimeout);
  await test.hasText(e.smallToastMsg, e.presentationUploadedToast, uploadTimeout);
}

async function uploadMultiplePresentations(test, fileNames, uploadTimeout = ELEMENT_WAIT_LONGER_TIME) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.fileUpload);

  await test.page.setInputFiles(e.fileUpload, fileNames.map(function(fileName) { return path.join(__dirname, `../core/media/${fileName}`); }));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
  await test.hasText(e.presentationStatusInfo, [e.convertingPresentationFileToast], uploadTimeout);
  await test.hasText(e.smallToastMsg, e.presentationUploadedToast, uploadTimeout);
}

exports.checkSvgIndex = checkSvgIndex;
exports.getSvgOuterHtml = getSvgOuterHtml;
exports.uploadSinglePresentation = uploadSinglePresentation;
exports.uploadMultiplePresentations = uploadMultiplePresentations;
