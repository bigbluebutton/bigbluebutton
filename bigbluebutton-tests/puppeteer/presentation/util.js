const path = require('path');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { checkElementTextIncludes } = require('../core/util');

function checkSvgIndex(element) {
  return document.querySelector('svg g g g').outerHTML.indexOf(element) !== -1;
}

function getSvgOuterHtml() {
  return document.querySelector('svg g g g').outerHTML;
}

async function uploadPresentation(test, fileName, uploadTimeout = ELEMENT_WAIT_LONGER_TIME) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.uploadPresentation);
  await test.waitForSelector(e.fileUpload);

  const fileUpload = await test.page.$(e.fileUpload);
  await fileUpload.uploadFile(path.join(__dirname, `../media/${fileName}`));
  await test.page.waitForFunction(checkElementTextIncludes,
    { timeout: ELEMENT_WAIT_TIME },
    'body', 'To be uploaded ...'
  );

  await test.waitAndClick(e.upload);
  await test.logger('Waiting for the new presentation to upload...');
  await test.page.waitForFunction(checkElementTextIncludes,
    { timeout: ELEMENT_WAIT_TIME },
    'body', 'Converting file'
  );
  await test.logger('Presentation uploaded!');
  await test.page.waitForFunction(checkElementTextIncludes,
    { timeout: uploadTimeout },
    'body', 'Current presentation'
  );
}

exports.checkSvgIndex = checkSvgIndex;
exports.getSvgOuterHtml = getSvgOuterHtml;
exports.uploadPresentation = uploadPresentation;