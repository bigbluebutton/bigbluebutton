const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)

async function createBreakoutRooms(page1, page2) {
  await page1.click(e.manageUsers, true);
  await page1.click(e.createBreakoutRooms, true);
  await page1.waitForSelector(e.randomlyAssign, ELEMENT_WAIT_TIME);
  await page1.click(e.randomlyAssign, true);
  await page1.waitForSelector(e.modalConfirmButton, ELEMENT_WAIT_TIME);
  await page1.click(e.modalConfirmButton, true);
  await page2.waitForSelector(e.modalConfirmButton, ELEMENT_WAIT_TIME);
  await page2.click(e.modalConfirmButton, true);
}

exports.createBreakoutRooms = createBreakoutRooms;
