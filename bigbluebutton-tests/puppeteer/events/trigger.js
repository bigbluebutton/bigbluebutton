const Page = require('../core/page');
const { exec } = require("child_process");
const { CLIENT_RECONNECTION_TIMEOUT } = require('../core/constants'); // core constants (Timeouts vars imported)
const { sleep } = require('../core/helper');
const e = require('../core/elements');
const { checkElementLengthDifferentTo } = require('../core/util');

class Trigger extends Page {
  constructor() {
    super('trigger-events');
  }

  async triggerMeteorDisconnect(testName) {
    if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `01-before-audio-modal-close-[${this.meetingId}]`);
    }
    await this.closeAudioModal();
    if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `02-after-audio-modal-close-[${this.meetingId}]`);
    }
    await sleep(5000);
    await this.page.evaluate(() => Meteor.disconnect());
    if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `03-after-meteor-disconnection-[${this.meetingId}]`);
    }
    await sleep(CLIENT_RECONNECTION_TIMEOUT);
    const meteorStatus = await this.page.evaluate(() => Meteor.status());
    const meteorStatusConfirm = await meteorStatus.status === "offline";
    await this.logger('Check if Meteor is Offline => ', meteorStatusConfirm);
    const getAudioButton = await this.page.evaluate(()=>
      document.querySelectorAll('button[aria-label="Join audio"]')[0]
        .getAttribute('aria-disabled') === "true");
    await this.logger('Check if Connections Buttons are disabled => ', getAudioButton);
    await this.page.evaluate(() => Meteor.reconnect());
    await sleep(3000);
    if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `04-after-meteor-reconnection-[${this.meetingId}]`);
    }
    const findUnauthorized = await this.page.evaluate(checkElementLengthDifferentTo, e.unauthorized, 0) === true;
    await this.logger('Check if Unauthorized message appears => ', findUnauthorized);
    return meteorStatusConfirm && getAudioButton && findUnauthorized;
  }

  async triggerNetworkServiceDisconnection(testName) {
    if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `01-before-audio-modal-close-[${this.meetingId}]`);
    }
    await this.closeAudioModal();
    if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `02-after-audio-modal-close-[${this.meetingId}]`);
    }
    await sleep(5000);
    await this.logger('Stopping Network Service...');
    await exec('sh tests/puppeteer/events/stop-network.sh', (error, data, getter) => {
        if(error){
            console.log("error", error.message);
            return;
        }
        if(getter){
            console.log("data", data);
            return;
        }
        console.log("data", data);
    });
    const meteorStatus = await this.page.evaluate(() => Meteor.status());
    const meteorStatusConfirm = await meteorStatus.status === "offline";
    await this.logger('Check if Meteor is Offline => ', meteorStatusConfirm);
    if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `03-after-network-service-shutdown-[${this.meetingId}]`);
    }
    await this.logger('Counting ', CLIENT_RECONNECTION_TIMEOUT/6000, ' seconds...');
    await sleep(CLIENT_RECONNECTION_TIMEOUT);
    await this.logger('Restarting Network Service...');
    await exec('sh tests/puppeteer/events/restart-network.sh', (error, data, getter) => {
        if(error){
            console.log("error", error.message);
            return;
        }
        if(getter){
            console.log("data", data);
            return;
        }
        console.log("data", data);
    });
    if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.screenshot(`${testName}`, `04-after-network-service-restart-[${this.meetingId}]`);
    }
    await this.page.reload();
    await this.closeAudioModal();
    const getAudioButton = await this.page.evaluate(()=>
      document.querySelectorAll('button[aria-label="Join audio"]')[0]
        .getAttribute('aria-disabled') === "true");
    await this.logger('Check if Connections Buttons are disabled => ', getAudioButton);
    await sleep(3000);
    const findUnauthorized = await this.page.evaluate(checkElementLengthDifferentTo, e.unauthorized, 0) === true;
    await this.logger('Check if Unauthorized message appears => ', findUnauthorized);
    return meteorStatusConfirm && getAudioButton && findUnauthorized;
  }
}

module.exports = exports = Trigger;
