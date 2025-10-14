const { MultiUsers } = require('../user/multiusers');
const { connectMicrophone } = require('../audio/util');
const { openPublicChat } = require('../chat/util');
const e = require('../core/elements');
const { sleep } = require('../core/helpers');
const { env } = require('node:process');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class ErrorLogs extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  monitorErrorLogs() {
    // avoid double thrown errors (default function already throws error based on env.CONSOLE_FAIL)
    if (env.CONSOLE_FAIL === 'true') return;

    this.modPage.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        throw new Error(`Console error detected: ${msg.text()}`);
      }
    });

    this.userPage.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        throw new Error(`Console error detected: ${msg.text()}`);
      }
    });
  }

  async joinSession() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await sleep(2000);
  }

  async joinAudioWithMicrophone() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.isTalking, 'should display the is talking element when user unmute the microphone');
    // Wait a moment for any audio-related errors to surface
    await sleep(2000);
    // Mute again
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted again');
  }

  async joinWebcam() {
    await this.modPage.shareWebcam();
    await this.modPage.hasElement(e.leaveVideo, 'should have leave video button');
    // Wait a moment for any webcam-related errors to surface
    await sleep(3000);
  }

  async sendPublicChatMessage() {
    await openPublicChat(this.modPage);
    const testMessage = 'Test message from error monitoring test';
    await this.modPage.type(e.chatBox, testMessage);
    await this.modPage.waitAndClick(e.sendButton);
    // Verify message was sent
    await this.modPage.hasText(e.chatUserMessageText, testMessage, 'should display the sent message');
    // Wait a moment for any chat-related errors to surface
    await sleep(1000);
  }

  async shareReaction() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.reactionsButton);
    // Select the first reaction (smiling emoji)
    await this.modPage.waitAndClick(`${e.singleReactionButton}:nth-child(1)`);
    // Verify reaction is displayed
    await this.modPage.hasText(e.moderatorAvatar, '😃', 'should display the smiling emoji in the moderator avatar');
    await this.modPage.hasText(e.reactionsButton, '😃', 'should display the smiling emoji on the reactions button when used');
    // Wait a moment for any reaction-related errors to surface
    await sleep(2000);
  }
}

exports.ErrorLogs = ErrorLogs;
