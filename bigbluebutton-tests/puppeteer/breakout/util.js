const e = require('../core/elements');

async function createBreakoutRooms(page1, page2) {
  await page1.waitAndClick(e.manageUsers);
  await page1.waitAndClick(e.createBreakoutRooms);
  await page1.waitAndClick(e.randomlyAssign);
  await page1.waitAndClick(e.modalConfirmButton);
  await page2.waitAndClick(e.modalConfirmButton);
}

exports.createBreakoutRooms = createBreakoutRooms;
