import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { MultiUsers } from '../../user/multiusers';
import { clickEditorLeftMargin, collectPageErrors, startBlockNoteSharedNotes } from './util';

// Typed into a cell after the interaction: a client torn down by the crash cannot take it.
const TYPED_AFTER_INTERACTION = 'still alive';

const TABLE_BLOCK = `${e.blockNoteEditor} .bn-block-content[data-content-type="table"]`;
const FIRST_TABLE_CELL = `${TABLE_BLOCK} :is(th, td)`;

export class BlockNoteTableSharedNotes extends MultiUsers {
  private pageErrors: string[] = [];

  /**
   * Opens the shared notes and inserts a table as the first block of the (empty) document
   * through the slash menu — the same way a user creates one.
   */
  private async openNotesWithLeadingTable() {
    this.pageErrors = collectPageErrors(this.modPage);

    await startBlockNoteSharedNotes(this.modPage);
    await this.modPage.page.locator(e.blockNoteEditor).click();
    await this.modPage.page.keyboard.type('/table');
    // The slash menu filters as it is typed; Enter picks the highlighted "Table" item.
    await this.modPage.hasElement(e.blockNoteSlashMenuItem, 'the slash menu should offer the Table block');
    await this.modPage.page.keyboard.press('Enter');

    await expect(this.modPage.page.locator(TABLE_BLOCK), 'the slash menu should insert a table').toHaveCount(1, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    // Preconditions of the crash, asserted so a drifting document fails loudly instead of
    // passing vacuously: the table must be the document's first block...
    await expect(
      this.modPage.page.locator(`${e.blockNoteEditor} .bn-block-content`).first(),
      'the table should be the first block of the document',
    ).toHaveAttribute('data-content-type', 'table');
    // ...and the static formatting toolbar must be mounted, since it is its alignment
    // control that asks TableHandles for a cell selection on every selection change.
    await this.modPage.hasElement(e.blockNoteToolbar, 'the static formatting toolbar should be rendered');
  }

  // Asserts the client survived: no out-of-range exception, no error screen, and an editor
  // that is still mounted and still accepts input.
  private async expectClientAlive(interaction: string) {
    const rangeErrors = this.pageErrors.filter((message) => /out of range/i.test(message));
    expect(rangeErrors, `no position-out-of-range error should be thrown when ${interaction}`).toEqual([]);
    await this.modPage.wasRemoved(e.errorScreenMessage, 'the client should not fall back to the error screen');
    await this.modPage.hasElement(e.blockNoteEditable, 'the editor should still be mounted and editable');

    const firstCell = this.modPage.page.locator(FIRST_TABLE_CELL).first();
    await firstCell.click();
    await this.modPage.page.keyboard.type(TYPED_AFTER_INTERACTION);
    await expect(firstCell, 'the editor should still accept typing').toContainText(TYPED_AFTER_INTERACTION);
  }

  async arrowLeftOutOfFirstTableCell() {
    await this.openNotesWithLeadingTable();

    await this.modPage.page.locator(FIRST_TABLE_CELL).first().click();
    // Home first: ArrowLeft only leaves the cell when the caret is already at its start.
    await this.modPage.page.keyboard.press('Home');
    await this.modPage.page.keyboard.press('ArrowLeft');

    await this.expectClientAlive('pressing ArrowLeft out of the first cell of a leading table');
  }

  async leadingTableLeftMarginClick() {
    await this.openNotesWithLeadingTable();
    await clickEditorLeftMargin(this.modPage, this.modPage.page.locator(TABLE_BLOCK));
    await this.expectClientAlive('clicking the left margin of a leading table');
  }

  async alignmentControlWorksInsideTableCell() {
    await this.openNotesWithLeadingTable();

    await this.modPage.page.locator(FIRST_TABLE_CELL).first().click();

    await this.modPage.hasElement(
      e.blockNoteAlignTextLeftButton,
      'the alignment control should be shown for a caret inside a table cell',
    );
  }
}
