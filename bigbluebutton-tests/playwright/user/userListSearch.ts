import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { MultiUsers } from './multiusers';
import { raisedHandsTitle, userListRowNames } from './util';

export class UserListSearch extends MultiUsers {
  async filterParticipantsByName() {
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.hasRows(
      [this.modPage.username, this.userPage.username, this.userPage2.username],
      'should list every participant before searching',
    );

    await this.modPage.fill(e.userListSearch, 'dee2');
    await this.hasRows([this.userPage2.username], 'should match a part of a name');
    await this.modPage.fill(e.userListSearch, 'ATTEN');
    await this.hasRows([this.userPage.username, this.userPage2.username], 'should match regardless of letter case');
    // every word must match, in any order
    await this.modPage.fill(e.userListSearch, '2 att');
    await this.hasRows([this.userPage2.username], 'should match every word of the search in any order');
    await this.modPage.fill(e.userListSearch, 'mod');
    await this.hasRows([this.modPage.username], 'should include the current user in the results');
    await this.modPage.hasElement(e.currentUser, 'should show the current user row when it matches');
  }

  async filterRaisedHands() {
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await this.userPage.hasElement(e.lowerHandBtn, 'should raise the hand of the first attendee');
    await this.userPage2.waitAndClick(e.raiseHandBtn);
    await this.userPage2.hasElement(e.lowerHandBtn, 'should raise the hand of the second attendee');
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    const raisedHands = this.modPage.page.locator(e.raisedHandsListItem);
    await expect(raisedHands, 'should list both raised hands').toHaveCount(2);

    await this.modPage.fill(e.userListSearch, 'dee2');
    await expect(raisedHands, 'should list only the matching raised hand').toHaveCount(1);
    await expect(raisedHands, 'should list the raised hand of the second attendee').toHaveAttribute(
      'aria-label',
      this.userPage2.username,
    );
    await expect(raisedHandsTitle(this.modPage), 'should count only the matching raised hands').toHaveText(
      'Raised Hands (1)',
    );
    await this.hasRows([this.userPage2.username], 'should filter the participants with the same search');

    await this.modPage.fill(e.userListSearch, this.modPage.username);
    await expect(raisedHands, 'should hide the raised hands section when no raised hand matches').toHaveCount(0);
    await expect(raisedHandsTitle(this.modPage), 'should hide the raised hands title').toHaveCount(0);
    await this.hasRows([this.modPage.username], 'should list the matching participant');

    await this.modPage.waitAndClick(e.clearUserListSearch);
    await expect(raisedHands, 'should list both raised hands again after clearing the search').toHaveCount(2);
  }

  async emptyResultAndClear() {
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.fill(e.userListSearch, 'zzz');
    await this.hasRows([], 'should list no participant when nothing matches');
    await this.modPage.hasText(
      e.userListPanel,
      e.noSearchResultsMessage,
      'should tell the moderator that no participant matches',
    );

    await this.modPage.waitAndClick(e.clearUserListSearch);
    await this.modPage.hasValue(e.userListSearch, '', 'should empty the search field');
    await this.hasRows(
      [this.modPage.username, this.userPage.username, this.userPage2.username],
      'should list every participant again after clearing the search',
    );
    await expect(
      this.modPage.page.getByText(e.noSearchResultsMessage),
      'should remove the no results message',
    ).toHaveCount(0);
    await this.modPage.wasRemoved(e.clearUserListSearch, 'should hide the clear button with an empty search');
  }

  // the search is debounced, so the rows are compared until they settle
  async hasRows(names: string[], description: string) {
    await expect
      .poll(async () => (await userListRowNames(this.modPage)).sort(), { message: description })
      .toEqual([...names].sort());
  }
}
