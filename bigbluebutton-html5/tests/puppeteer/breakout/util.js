const e = require('./elements');
const pe = require('../core/elements');

async function waitForBreakoutElements(page1) {
  await page1.page.waitForSelector(e.manageUsers);
  await page1.page.waitForSelector(e.createBreakoutRooms);
}

async function createBreakoutRooms(page1, page2) {
  await page1.page.click(e.manageUsers);
  await page1.page.click(e.createBreakoutRooms);
  await page1.page.waitForSelector(e.randomlyAssign);
  await page1.page.click(e.randomlyAssign);
  await page1.page.waitForSelector(e.modalConfirmButton);
  await page1.page.click(e.modalConfirmButton);
  await page2.page.waitForSelector(e.modalConfirmButton);
  await page2.page.click(e.modalConfirmButton);
}

async function getTestElement(element) {
  await document.querySelectorAll(element)[0] !== null;
}

async function joinBreakoutRooms(test) {
  await test.waitForSelector(e.breakoutRoomsItem);
  await test.page.click(e.breakoutRoomsItem, true);
  await test.waitForSelector(e.breakoutJoin);
  await test.page.click(e.breakoutJoin, true);
}

exports.getTestElement = getTestElement;
exports.createBreakoutRooms = createBreakoutRooms;
exports.waitForBreakoutElements = waitForBreakoutElements;
exports.joinBreakoutRooms = joinBreakoutRooms;
