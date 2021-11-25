// Common
function checkElement(element, index = 0) {
  return document.querySelectorAll(element)[index] !== undefined;
}

exports.checkElement = checkElement;