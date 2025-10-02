import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants.ts';
import { elements as e } from '../core/elements.ts';

export async function startSharedNotes(test) {
  await test.waitAndClick(e.sharedNotes);
  await test.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await test.hasElement(e.etherpadFrame, ELEMENT_WAIT_LONGER_TIME);
}

export function getNotesLocator(test) {
  return test.page
    .frameLocator(e.etherpadFrame)
    .last()
    .frameLocator(e.etherpadOuter)
    .frameLocator(e.etherpadInner)
    .locator(e.etherpadEditable);
}

export function getShowMoreButtonLocator(test) {
  return test.page.frameLocator(e.etherpadFrame).locator(e.showMoreSharedNotesButton);
}

export function getExportButtonLocator(test) {
  return test.page.frameLocator(e.etherpadFrame).locator(e.exportSharedNotesButton);
}

export function getExportPlainTextLocator(test) {
  return test.page.frameLocator(e.etherpadFrame).locator(e.exportPlainButton);
}

export function getExportHTMLLocator(test) {
  return test.page.frameLocator(e.etherpadFrame).locator(e.exporthtml);
}

export function getExportEtherpadLocator(test) {
  return test.page.frameLocator(e.etherpadFrame).locator(e.exportetherpad);
}

export function getMoveToWhiteboardLocator(test) {
  return test.page.locator(e.sendNotesToWhiteboard);
}

export function getSharedNotesUserWithoutPermission(test) {
  return test.page.frameLocator(e.sharedNotesViewingMode).locator('body');
}
