import { MultiUsers } from './multiusers';
import { elements as e } from '../core/elements.ts';

export class MobileDevices extends MultiUsers {
  async mobileTagName() {
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.waitForSelector(e.currentUser);
    await this.modPage.hasElement(e.mobileUser, 'should display the mobile user element for the moderator ');
  }
}
