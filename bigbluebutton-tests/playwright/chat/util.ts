import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { ClientSettingsOverrides, Page } from '../core/page';

// the emoji picker is disabled by default (public.chat.emojiPicker.enable)
export const EMOJI_PICKER_SETTINGS_OVERRIDE: ClientSettingsOverrides = {
  public: {
    chat: {
      emojiPicker: {
        enable: true,
      },
    },
  },
};

export async function openPublicChat(testPage: Page) {
  const { chatEnabled } = testPage.settings || {};

  if (!chatEnabled) {
    await testPage.wasRemoved(e.messagesSidebarButton, 'public chat should not be displayed');
    return;
  }

  await testPage.hasElement(e.chatBox, 'should display the chat box for messaging');
  await testPage.hasElement(e.chatMessages, 'should display the chat messages');
  await testPage.hasElement(e.chatOptions, 'should display the chat options menu button');
}

export async function openPrivateChat(testPage: Page) {
  const { chatEnabled } = testPage.settings || {};
  await testPage.waitAndClick(e.usersListSidebarButton);
  await testPage.waitForSelector(e.userListItem);
  if (!chatEnabled) {
    await testPage.wasRemoved(e.startPrivateChat, 'should not display the private chat');
    return;
  }
  const lastUserStartPrivateChat = await testPage.page.locator(e.startPrivateChat).last();
  await lastUserStartPrivateChat.click();
}

export async function getLastMessageSent(testPage: Page) {
  return testPage.page.locator(e.chatUserMessageText).last();
}

export async function checkLastMessageSent(
  testPage: Page,
  expectedMessage: string | RegExp | ReadonlyArray<string | RegExp>,
) {
  const lastMessageSentLocator = await getLastMessageSent(testPage);
  await expect(lastMessageSentLocator, 'should display the last message sent on the chat').toHaveText(expectedMessage);
}

export async function hoverLastMessage(testPage: Page) {
  const lastMessageSentLocator = await getLastMessageSent(testPage);
  await lastMessageSentLocator.hover();
}

// Runs in the browser. Sends the messages to the public chat one after the other with the
// mutation the chat form sends, over a separate graphql-transport-ws connection authenticated
// with the page's own session, and resolves once the server has accepted the last one.
function sendPublicMessagesInBrowser(messages: string[]): Promise<void> {
  const query =
    'mutation ChatSendMessage($chatId: String!, $chatMessageInMarkdownFormat: String!) ' +
    '{ chatSendMessage(chatId: $chatId, chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat) }';
  return new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(`wss://${window.location.host}/graphql`, 'graphql-transport-ws');
    const send = (message: unknown) => ws.send(JSON.stringify(message));
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('sending the chat messages timed out'));
    }, 60000);
    const finish = (error?: Error) => {
      clearTimeout(timer);
      ws.close();
      if (error) reject(error);
      else resolve();
    };
    let next = 0;
    const sendNext = () => {
      if (next === messages.length) {
        finish();
        return;
      }
      const variables = { chatId: 'MAIN-PUBLIC-GROUP-CHAT', chatMessageInMarkdownFormat: messages[next] };
      send({ id: String(next), type: 'subscribe', payload: { query, variables } });
    };
    ws.onerror = () => finish(new Error('websocket error'));
    ws.onopen = () =>
      send({
        type: 'connection_init',
        payload: {
          headers: {
            'X-Session-Token': sessionStorage.getItem('sessionToken'),
            'X-ClientSessionUUID': sessionStorage.getItem('clientSessionUUID'),
            'X-ClientType': 'HTML5',
            'X-ClientIsMobile': 'false',
          },
        },
      });
    ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data as string);
      if (message.type === 'ping') send({ type: 'pong' });
      else if (message.type === 'connection_ack') sendNext();
      else if (message.type === 'error' || message.payload?.errors) {
        finish(new Error(`chatSendMessage refused: ${JSON.stringify(message.payload)}`));
      } else if (message.type === 'complete' && message.id === String(next)) {
        next += 1;
        sendNext();
      }
    };
  });
}

// Many messages, sent as the chat form sends them but without typing each one.
export async function sendPublicMessages(testPage: Page, messages: string[]) {
  await testPage.page.evaluate(sendPublicMessagesInBrowser, messages);
}
