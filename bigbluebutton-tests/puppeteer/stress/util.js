function checkIncludeClass(selector, className) {
  return document.querySelectorAll(selector)[0]?.className.includes(className);
}

exports.checkIncludeClass = checkIncludeClass;