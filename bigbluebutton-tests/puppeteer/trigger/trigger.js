const Page = require('../core/page');
const { exec } = require("child_process");
const { CLIENT_RECONNECTION_TIMEOUT, ELEMENT_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)
const { sleep } = require('../core/helper');
const screenshareUtil = require('../screenshare/util');
const e = require('../core/elements');
const { checkElement } = require('../core/util');

class Trigger extends Page {
  constructor() {
    super();
  }

  async triggerMeteorDisconnect(testName) {
    try {
      await this.screenshot(`${testName}`, `01-after-audio-modal-close-[${this.meetingId}]`);

      await sleep(5000);
      await this.page.evaluate(() => Meteor.disconnect());
      await this.screenshot(`${testName}`, `02-after-meteor-disconnection-[${this.meetingId}]`);

      await sleep(CLIENT_RECONNECTION_TIMEOUT);
      const meteorStatus = await this.page.evaluate(() => Meteor.status());
      const meteorStatusConfirm = await meteorStatus.status === "offline";
      await this.logger('Check if Meteor is Offline => ', meteorStatusConfirm);
      const getAudioButton = await this.page.evaluate((joinAudioSelector) => {
        return document.querySelectorAll(joinAudioSelector)[0].getAttribute('aria-disabled') === "true";
      }, e.joinAudio);
      await this.logger('Check if Connections Buttons are disabled => ', getAudioButton);
      await this.page.evaluate(() => Meteor.reconnect());
      await sleep(3000);
      await this.screenshot(`${testName}`, `03-after-meteor-reconnection-[${this.meetingId}]`);

      const findUnauthorized = await this.hasElement(e.unauthorized);
      await this.logger('Check if Unauthorized message appears => ', findUnauthorized);
      return meteorStatusConfirm && getAudioButton && findUnauthorized;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async triggerNetworkServiceDisconnection(testName) {
    try {
      await this.screenshot(`${testName}`, `01-after-audio-modal-close-[${this.meetingId}]`);

      await sleep(5000);
      await this.logger('Stopping Network Service...');
      await exec('sh trigger/stop-network.sh', async (error, data, getter) => {
        if (error) {
          await this.logger("error", error.message);
          return;
        }
        if (getter) {
          await this.logger("data", data);
          return;
        }
        await this.logger("data", data);
      });
      const meteorStatus = await this.page.evaluate(() => Meteor.status());
      const meteorStatusConfirm = await meteorStatus.status === "offline";
      await this.logger('Check if Meteor is Offline => ', meteorStatusConfirm);
      await this.screenshot(`${testName}`, `02-after-network-service-shutdown-[${this.meetingId}]`);

      await this.logger('Counting ', CLIENT_RECONNECTION_TIMEOUT / 6000, ' seconds...');
      await sleep(CLIENT_RECONNECTION_TIMEOUT);
      await this.logger('Restarting Network Service...');
      await exec('sh trigger/restart-network.sh', async (error, data, getter) => {
        if (error) {
          await this.logger("error", error.message);
          return;
        }
        if (getter) {
          await this.logger("data", data);
          return;
        }
        await this.logger("data", data);
      });
      await this.screenshot(`${testName}`, `03-after-network-service-restart-[${this.meetingId}]`);

      await this.page.reload();
      await this.closeAudioModal();
      const getAudioButton = await this.page.evaluate((joinAudioSelector) => {
        return document.querySelectorAll(joinAudioSelector)[0].getAttribute('aria-disabled') === "true";
      }, e.joinAudio)
      await this.logger('Check if Connections Buttons are disabled => ', getAudioButton);
      await sleep(3000);
      const findUnauthorized = await this.hasElement(e.unauthorized);
      await this.logger('Check if Unauthorized message appears => ', findUnauthorized);
      return meteorStatusConfirm && getAudioButton && findUnauthorized;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async meteorReconnection(testName) {
    try {
      const checkSudo = await this.runScript('timeout -k 1 1 sudo id', {
        handleOutput: (output) => output ? true : false
      })
      if (!checkSudo) {
        await this.logger('Sudo failed: need to run this test with sudo (can be fixed by running "sudo -v" and entering the password)');
        return false;
      }

      const checkTcpKill = await this.runScript('tcpkill', {
        handleError: (output) => output.includes('not found') ? false : true
      })
      if (!checkTcpKill) {
        await this.logger('tcpkill failed: must have the "dsniff" package installed');
        return false;
      }

      await this.init(true, false, testName, 'Moderator', undefined, undefined, undefined, undefined, ['--disable-http2']);
      await this.screenshot(testName, '01-after-close-audio-modal');
      await this.page.setRequestInterception(true);
      this.page.on('request', (request) => {
        const headers = request.headers();
        headers['connection'] = 'close';
        request.continue({
          headers
        });
      });

      const hostname = new URL(this.page.url()).hostname;
      const remoteIp = await this.runScript(`ping ${hostname}`, {
        timeout: 1000,
        handleOutput: (output) => {
          const splitLog = output.split(/\s+/)[2];
          const ip = splitLog.slice(1, -1);

          return ip;
        }
      })

      const modPid = this.browser.process().pid;
      await sleep(7000);
      const ipArgs = await this.runScript(`lsof -n -p ${modPid} | grep ${remoteIp}`, {
        handleOutput: (output) => {
          const completeLog = output.trim().split(/\s+/);

          const ips = completeLog[8].split('->');
          const [localIp, port] = ips[0].split(':');

          return { localIp, port };
        }
      })

      const tcpInterface = await this.runScript(`ip addr | grep ${ipArgs.localIp}`, {
        handleOutput: (output) => {
          const outputArray = output.trim().split(/\s+/);
          return outputArray[outputArray.length - 1];
        }
      })

      // Media connections
      await this.joinMicrophone();
      await this.screenshot(testName, '02-after-join-microphone');
      await this.shareWebcam(true);
      await this.screenshot(testName, '03-after-share-webcam');
      await screenshareUtil.startScreenshare(this);
      await this.screenshot(testName, '04-after-start-screenshare');

      await this.runScript(`sudo tcpkill -i ${tcpInterface} port ${ipArgs.port} and host ${remoteIp}`, { timeout: 7500 });
      await this.screenshot(testName, '05-after-kill-connection');

      const isTalking = await this.page.evaluate(checkElement, e.isTalking);
      const isSharingWebcam = await this.page.evaluate(checkElement, e.webcamVideo);
      const isSharingScreen = await this.page.evaluate(checkElement, e.stopScreenSharing);

      return isTalking && isSharingWebcam && isSharingScreen;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async runScript(script, { handleError, handleOutput, timeout }) {
    return new Promise((res, rej) => {
      return exec(script, { timeout }, (err, stdout, stderr) => {
        res(handleError ? handleError(stderr) : handleOutput ? handleOutput(stdout) : null)
      })
    })
  }
}

module.exports = exports = Trigger;