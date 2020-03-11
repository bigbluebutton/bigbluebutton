const pe = require('../core/elements');
const ule = require('../user/elements');

async function checkUserAvatarIfHighlighting(test) {
  await test.waitForSelector(ule.statusIcon);
  await test.waitForSelector('[class^="talking--"]');
  const response = await test.page.evaluate(async () => await document.querySelectorAll('[data-test="userAvatar"]')[1].querySelectorAll('[class^="talking--"]') !== null);
  return response;
}

async function checkUserIsTalkingIndicator(test) {
  const response = await test.page.evaluate(getTestElement, pe.isTalking) !== null;
  return response;
}

async function checkUserWasTalkingIndicator(test) {
  const response = await test.page.evaluate(getTestElement, pe.wasTalking) !== null;
  return response;
}

async function getTestElement(element) {
  await document.querySelectorAll(element)[1];
}

async function clickTestElement(element) {
  await document.querySelectorAll(element)[0].click();
}

async function mute(test) {
  await test.page.evaluate(async () => {
    await document.querySelectorAll('[data-test="userListItem"]')[0].click();
    await document.querySelectorAll('[data-test="mute"]')[0].click();
  });
}

exports.mute = mute;
exports.clickTestElement = clickTestElement;
exports.getTestElement = getTestElement;
exports.checkUserAvatarIfHighlighting = checkUserAvatarIfHighlighting;
exports.checkUserIsTalkingIndicator = checkUserIsTalkingIndicator;
exports.checkUserWasTalkingIndicator = checkUserWasTalkingIndicator;
