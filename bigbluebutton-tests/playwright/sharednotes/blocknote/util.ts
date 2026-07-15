import { ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { Page } from '../../core/page';

export async function startSharedNotesBlockNote(testPage: Page) {
  await testPage.waitAndClick(e.sharedNotesSidebarButton);
  await testPage.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await testPage.hasElement(e.blockNoteEditable, 'should display the BlockNote editor', ELEMENT_WAIT_LONGER_TIME);
}

export function getBlockNoteEditorLocator(testPage: Page) {
  return testPage.page.locator(e.blockNoteEditor);
}

export function getBlockNoteReadOnlyLocator(testPage: Page) {
  return testPage.page.locator(e.blockNoteReadOnly);
}
