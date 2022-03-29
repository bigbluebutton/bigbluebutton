const { expect } = require("@playwright/test");

// Common
function checkElement([element, index = 0]) {
  return document.querySelectorAll(element)[index] !== undefined;
}

// Length
function checkElementLengthEqualTo([element, count]) {
  return document.querySelectorAll(element).length == count;
}

// Text
async function checkTextContent(baseContent, checkData) {
  if (typeof checkData === 'string') checkData = new Array(checkData);

  const check = checkData.every(word => baseContent.includes(word));
  await expect(check).toBeTruthy();
}

exports.checkElement = checkElement;
exports.checkElementLengthEqualTo = checkElementLengthEqualTo;
exports.checkTextContent = checkTextContent;
