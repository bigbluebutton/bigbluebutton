import { elements as e } from '../core/elements';
import { MultiUsers } from './multiusers';

export class MobileDevices extends MultiUsers {
  async mobileTagName() {
    await this.modPage.waitAndClick(e.toggleSidebarNavigation);
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitForSelector(e.currentUser);
    await this.modPage.hasText(
      e.userNameSubs,
      'Mobile',
      'should display the mobile text as user sub for the moderator',
    );
  }
}
