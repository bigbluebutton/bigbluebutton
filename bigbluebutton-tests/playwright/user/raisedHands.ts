import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from './multiusers';
import { raisedHandsTitle } from './util';

export class RaisedHands extends MultiUsers {
  async rankedInOrderOfRaising() {
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    // the second attendee raises first, so the order is not the alphabetical one
    await this.raiseHand(this.userPage2, [this.userPage2.username]);
    await this.raiseHand(this.userPage, [this.userPage2.username, this.userPage.username]);
    await expect(raisedHandsTitle(this.modPage), 'should count both raised hands').toHaveText('Raised Hands (2)');
  }

  async reRankedWhenFirstHandIsLowered() {
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.raiseHand(this.userPage, [this.userPage.username]);
    await this.raiseHand(this.userPage2, [this.userPage.username, this.userPage2.username]);

    await this.userPage.waitAndClick(e.lowerHandBtn);
    await this.hasRaisedHands(
      [this.userPage2.username],
      'should move the second attendee to the first place when the first hand is lowered',
    );
    await expect(raisedHandsTitle(this.modPage), 'should count the remaining raised hand').toHaveText(
      'Raised Hands (1)',
    );

    // a hand raised again goes to the end of the queue
    await this.raiseHand(this.userPage, [this.userPage2.username, this.userPage.username]);
  }

  async raiseHand(testPage: Page, expectedOrder: string[]) {
    await testPage.waitAndClick(e.raiseHandBtn);
    await testPage.hasElement(e.lowerHandBtn, `should raise the hand of ${testPage.username}`);
    await this.hasRaisedHands(expectedOrder, `should rank the raised hands as ${expectedOrder.join(', ')}`);
  }

  // the moderator's raised hands section lists the names in this order, ranked from 1
  async hasRaisedHands(names: string[], description: string) {
    const raisedHands = this.modPage.page.locator(e.raisedHandsListItem);
    await expect(raisedHands, description).toHaveCount(names.length);
    for (const [index, name] of names.entries()) {
      const item = raisedHands.nth(index);
      await expect(item, description).toHaveAttribute('aria-label', name);
      await expect(item.locator(e.raisedHandRank), description).toHaveText(String(index + 1));
    }
  }
}
