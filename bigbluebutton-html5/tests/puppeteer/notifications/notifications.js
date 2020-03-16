const Page = require('../core/page');
const util = require('./util');
const utilMultiUsers = require('../chat/util');
const MultiUsers = require('../user/multiusers');
const params = require('../params');
const ne = require('./elements');
const e = require('../chat/elements');

class Notifications extends MultiUsers {
  constructor() {
    super('notifications');
    this.page1 = new Page();
    this.page2 = new Page();
  }

  async init(meetingId) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params });
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'User2' });
  }

  async saveSttingsNotification() {
    await util.popupMenu(this.page1);
    await util.saveSettings(this.page1);
    const resp = await util.getLastToastValue(this.page1) === ne.savedSettingsToast;
    return resp;
  }

  async publicChatNotification() {
    await util.popupMenu(this.page1);
    await util.enableChatPopup(this.page1);
    await util.saveSettings(this.page1);
    const expectedToastValue = await util.publicChatMessageToast(this.page1, this.page2);
    await this.page1.waitForSelector(ne.smallToastMsg);
    await this.page1.waitForSelector(ne.hasUnreadMessages);
    const lastToast = await util.getOtherToastValue(this.page1);
    return expectedToastValue === lastToast;
  }


  async privateChatNotification() {
    await util.popupMenu(this.page1);
    await util.enableChatPopup(this.page1);
    await util.saveSettings(this.page1);
    const expectedToastValue = await util.privateChatMessageToast(this.page2);
    await this.page1.waitForSelector(ne.smallToastMsg);
    await this.page1.waitForSelector(ne.hasUnreadMessages);
    const lastToast = await util.getOtherToastValue(this.page1);
    return expectedToastValue === lastToast;
  }
}

module.exports = exports = Notifications;
