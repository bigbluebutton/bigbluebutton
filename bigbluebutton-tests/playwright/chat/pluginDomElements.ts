import { expect, type Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Chat } from './chat';
import { openPublicChat } from './util';

// The chat list hands plugins the dom nodes of the rendered messages over a window
// CustomEvent contract: a plugin announces the message ids it wants with
// PLUGIN_SUBSCRIBED_TO_BBB_CORE, and the client answers with BBB_CORE_SENT_NEW_DATA
// carrying the nodes. These tests stand in for a plugin by speaking that contract
// directly, so the core -> sdk boundary is covered without building a plugin. The client
// dispatches those events unconditionally, so this does not rely on a dev bundle.
const PLUGIN_UUID = 'e2e-chat-dom-elements';
const HOOK = 'CHAT_MESSAGE';

interface ProbeDelivery {
  messages: { messageId: string; node: HTMLElement | null }[];
}

type ProbeWindow = Window & {
  bbbChatDomElementsProbe?: { deliveries: ProbeDelivery[] };
};

interface DeliverySummary {
  messageIds: string[];
  everyNodeConnected: boolean;
  everyNodeIsTheRenderedOne: boolean;
}

const installProbe = (page: PlaywrightPage, hook: string): Promise<void> =>
  page.evaluate((hookName) => {
    const probe: { deliveries: ProbeDelivery[] } = { deliveries: [] };
    (window as ProbeWindow).bbbChatDomElementsProbe = probe;
    window.addEventListener('BBB_CORE_SENT_NEW_DATA', (event) => {
      const { detail } = event as CustomEvent;
      if (detail?.hook !== hookName) return;
      probe.deliveries.push({
        messages: detail.data.messages.map((item: { messageId: string; message: HTMLElement | null }) => ({
          messageId: item.messageId,
          node: item.message,
        })),
      });
    });
  }, hook);

const subscribeAsPlugin = (page: PlaywrightPage, messageIds: string[], hook: string): Promise<void> =>
  page.evaluate(
    ({ ids, hookName, uuid }) => {
      window.dispatchEvent(
        new CustomEvent('PLUGIN_SUBSCRIBED_TO_BBB_CORE', {
          detail: { hook: hookName, hookArguments: { messageIds: ids, pluginUuid: uuid } },
        }),
      );
    },
    { ids: messageIds, hookName: hook, uuid: PLUGIN_UUID },
  );

// Node state is resolved at read time, not at delivery time: a node that was on the page
// when it was handed over may have been detached since, which is the failure being guarded.
const readLastDelivery = (page: PlaywrightPage): Promise<DeliverySummary | null> =>
  page.evaluate(() => {
    const { deliveries = [] } = (window as ProbeWindow).bbbChatDomElementsProbe ?? {};
    const last = deliveries[deliveries.length - 1];
    if (!last) return null;
    return {
      messageIds: last.messages.map((item) => item.messageId).sort(),
      everyNodeConnected: last.messages.every((item) => !!item.node?.isConnected),
      everyNodeIsTheRenderedOne: last.messages.every(
        (item) =>
          item.node ===
          document.querySelector(`[data-test="chatMessageContent"][data-chat-message-id="${item.messageId}"]`),
      ),
    };
  });

export class ChatPluginDomElements extends Chat {
  // The chat panel is a sidebar tab, so make the precondition explicit instead of
  // depending on which panel the layout happens to open with
  private async openChatPanel(): Promise<void> {
    if (!(await this.modPage.checkElement(e.chatBox))) {
      await this.modPage.waitAndClick(e.messagesSidebarButton);
    }
    await openPublicChat(this.modPage);
  }

  // Returns the total number of rendered messages, which includes the ones the meeting
  // starts with (the welcome message) - plugins are handed those too
  private async sendMessages(count: number): Promise<number> {
    const initialCount = await this.modPage.getSelectorCount(e.chatMessageContent);
    for (let i = 0; i < count; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.modPage.fill(e.chatBox, `${e.message} ${i}`);
      // eslint-disable-next-line no-await-in-loop
      await this.modPage.waitAndClick(e.sendButton);
      // eslint-disable-next-line no-await-in-loop
      await this.modPage.hasElementCount(
        e.chatMessageContent,
        initialCount + i + 1,
        'should display every message sent by the moderator on the public chat',
      );
    }
    return initialCount + count;
  }

  private getRenderedMessageIds(): Promise<string[]> {
    return this.modPage.page
      .locator(e.chatMessageContent)
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-chat-message-id') ?? ''));
  }

  private async subscribeToRenderedMessages(): Promise<string[]> {
    await installProbe(this.modPage.page, HOOK);
    const messageIds = await this.getRenderedMessageIds();
    await subscribeAsPlugin(this.modPage.page, messageIds, HOOK);
    return messageIds;
  }

  private async hasDelivered(messageIds: string[], description: string): Promise<void> {
    await expect
      .poll(() => readLastDelivery(this.modPage.page), { message: description, timeout: ELEMENT_WAIT_LONGER_TIME })
      .toEqual({
        messageIds: [...messageIds].sort(),
        everyNodeConnected: true,
        everyNodeIsTheRenderedOne: true,
      });
  }

  private async deleteLastMessage(): Promise<string> {
    const lastMessageId = await this.modPage.page
      .locator(e.chatMessageContent)
      .last()
      .getAttribute('data-chat-message-id');
    const lastMessageItem = this.modPage.page.locator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    // Every message carries its own toolbar, so the button has to be scoped to the hovered one
    await lastMessageItem.locator(e.deleteMessageButton).click();
    await this.modPage.hasElement(e.simpleModal, 'should display the delete message confirmation modal');
    await this.modPage.waitAndClick(e.confirmDeleteChatMessageButton);
    await expect(lastMessageItem, 'should display the message deleted label after deleting a message').toContainText(
      `This message has been deleted by ${this.modPage.username}`,
    );
    return lastMessageId ?? '';
  }

  async keepsDeliveringAfterMessageDeletion(): Promise<void> {
    await this.openChatPanel();
    const renderedCount = await this.sendMessages(3);
    const messageIds = await this.subscribeToRenderedMessages();
    expect(messageIds, 'should render every message a plugin can subscribe to').toHaveLength(renderedCount);
    await this.hasDelivered(messageIds, 'should deliver the dom element of every rendered message');

    const deletedMessageId = await this.deleteLastMessage();

    // A deleted message renders no content element, so it drops out of the delivery; the
    // messages around it must survive, and none of them may be left detached from the page
    await this.hasDelivered(
      messageIds.filter((messageId) => messageId !== deletedMessageId),
      'should keep delivering the dom elements of the messages that were not deleted',
    );
  }

  async keepsDeliveringAfterKeyboardFocus(): Promise<void> {
    await this.openChatPanel();
    const renderedCount = await this.sendMessages(2);
    const messageIds = await this.subscribeToRenderedMessages();
    expect(messageIds, 'should render every message a plugin can subscribe to').toHaveLength(renderedCount);
    await this.hasDelivered(messageIds, 'should deliver the dom element of every rendered message');

    // Tabbing on a focused message activates its focus trap, which re-mounts the message
    // content under a different parent and replaces the node plugins were handed
    const lastMessageItem = this.modPage.page.locator(e.chatMessageItem).last();
    await lastMessageItem.focus();
    await lastMessageItem.press('Tab');
    await this.modPage.hasElement(
      e.chatMessageItemKeyboardFocused,
      'should activate the keyboard focus on the message, re-mounting its content',
    );

    await this.hasDelivered(
      messageIds,
      'should deliver the re-mounted dom elements instead of the ones detached by the focus trap',
    );
  }
}
