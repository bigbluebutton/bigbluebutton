function checkSvgIndex (element) {
  return document.querySelector('svg g g g').outerHTML.indexOf(element) !== -1;
}

function getSvgOuterHtml() {
  return document.querySelector('svg g g g').outerHTML;
}

exports.checkSvgIndex = checkSvgIndex;
exports.getSvgOuterHtml = getSvgOuterHtml;