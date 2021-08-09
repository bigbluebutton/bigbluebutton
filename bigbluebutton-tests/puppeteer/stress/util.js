function checkIncludeClass(selector, className) {
  return document.querySelectorAll(selector)[0]?.className.includes(className);
}
function checkUniqueElement(selector) {
return document.querySelectorAll(selector).length === 1;
}

exports.checkIncludeClass = checkIncludeClass;
exports.checkUniqueElement = checkUniqueElement;