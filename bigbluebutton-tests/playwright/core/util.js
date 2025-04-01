const { expect } = require("@playwright/test");
const { exec } = require('child_process');

// Common
function checkElement([element, index = 0]) {
  /* Because this function is passed to a page.evaluate, it can only
   * take a single argument; that's why we pass it an array.  It's so
   * easy to pass it a string by mistake that we check to make sure
   * the second argument is an integer and not a character from a
   * destructured string.
   */
  if (typeof index != "number") {
    throw Error("Assert failed: index not a number");
  }
  return document.querySelectorAll(element)[index] !== undefined;
}

// Length
function checkElementLengthEqualTo([element, count]) {
  return document.querySelectorAll(element).length == count;
}

function getElementLength(element) {
  return document.querySelectorAll(element).length;
}

// Text
async function checkTextContent(baseContent, checkData, description) {
  if (typeof checkData === 'string') checkData = new Array(checkData);

  checkData.forEach(word => {
    expect(baseContent, description ?? `should contain the value "${word}"`).toContain(word);
  });
}

function constructClipObj(wbBox) {
  return {
    x: wbBox.x,
    y: wbBox.y,
    width: wbBox.width,
    height: wbBox.height,
  };
}

async function runScript(script, { handleError, handleOutput, timeout }) {
  return new Promise((res, rej) => {
    return exec(script, { timeout }, (err, stdout, stderr) => {
      res(handleError ? handleError(stderr) : handleOutput ? handleOutput(stdout) : null)
    })
  })
}

exports.checkElement = checkElement;
exports.checkElementLengthEqualTo = checkElementLengthEqualTo;
exports.getElementLength = getElementLength;
exports.checkTextContent = checkTextContent;
exports.constructClipObj = constructClipObj;
exports.runScript = runScript;
