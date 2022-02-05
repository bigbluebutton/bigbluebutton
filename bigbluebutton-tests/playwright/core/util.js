// Common
function checkElement([element, index = 0]) {
  return document.querySelectorAll(element)[index] !== undefined;
}

// Length
function checkElementLengthEqualTo([element, count]) {
  return document.querySelectorAll(element).length == count;
}

function checkIncludeClass([selector, className]) {
  return document.querySelectorAll(selector)[0].className.includes(className);
}

exports.checkElement = checkElement;
exports.checkElementLengthEqualTo = checkElementLengthEqualTo;
exports.checkIncludeClass = checkIncludeClass;
