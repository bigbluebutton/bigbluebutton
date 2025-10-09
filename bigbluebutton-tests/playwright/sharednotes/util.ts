import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function startSharedNotes(testPage: Page) {
  await testPage.waitAndClick(e.sharedNotes);
  await testPage.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await testPage.hasElement(e.etherpadFrame, 'should display the etherpad frame', ELEMENT_WAIT_LONGER_TIME);
}

export function getNotesLocator(testPage: Page) {
  return testPage.page
    .frameLocator(e.etherpadFrame)
    .last()
    .frameLocator(e.etherpadOuter)
    .frameLocator(e.etherpadInner)
    .locator(e.etherpadEditable);
}

export function getShowMoreButtonLocator(testPage: Page) {
  return testPage.page.frameLocator(e.etherpadFrame).locator(e.showMoreSharedNotesButton);
}

export function getExportButtonLocator(testPage: Page) {
  return testPage.page.frameLocator(e.etherpadFrame).locator(e.exportSharedNotesButton);
}

export function getExportPlainTextLocator(testPage: Page) {
  return testPage.page.frameLocator(e.etherpadFrame).locator(e.exportPlainButton);
}

export function getExportHTMLLocator(testPage: Page) {
  return testPage.page.frameLocator(e.etherpadFrame).locator(e.exporthtml);
}

export function getExportEtherpadLocator(testPage: Page) {
  return testPage.page.frameLocator(e.etherpadFrame).locator(e.exportetherpad);
}

export function getMoveToWhiteboardLocator(testPage: Page) {
  return testPage.page.locator(e.sendNotesToWhiteboard);
}

export function getSharedNotesUserWithoutPermission(testPage: Page) {
  return testPage.page.frameLocator(e.sharedNotesViewingMode).locator('body');
}
