// Common
function checkElement([element, index = 0]) {
  return document.querySelectorAll(element)[index] !== undefined;
}

// Length
function checkElementLengthEqualTo([element, count]) {
  return document.querySelectorAll(element).length == count;
}

exports.checkElement = checkElement;
exports.checkElementLengthEqualTo = checkElementLengthEqualTo;
