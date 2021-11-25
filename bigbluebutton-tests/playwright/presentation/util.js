const path = require('path');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function uploadPresentation(test, fileName, uploadTimeout = ELEMENT_WAIT_LONGER_TIME) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.uploadPresentation);
  await test.waitForSelector(e.fileUpload);

  await test.page.setInputFiles(e.fileUpload, path.join(__dirname, `../media/${fileName}`));
  await test.hasText('body', 'To be uploaded ...');

  await test.waitAndClick(e.upload);
  await test.hasText('body', 'Converting file');

  await test.hasText('body', 'Current presentation', uploadTimeout);
}

exports.uploadPresentation = uploadPresentation;