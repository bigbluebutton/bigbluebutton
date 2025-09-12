const { Chat } = require("./chat");
const { hoverLastMessage, openPublicChat, checkLastMessageSent } = require("./util");
const e = require('../core/elements');
const { expect } = require("playwright/test");
const { ELEMENT_WAIT_LONGER_TIME } = require("../core/constants");

class MessageActions extends Chat {
  async editMessageFromToolbarButton() {
    await openPublicChat(this.modPage);
    // send a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on the public chat');
    await checkLastMessageSent(this.modPage, e.message);
    const initialMessagesCount = await this.modPage.getSelectorCount(e.chatUserMessageText);
    // hover message
    const lastMessageItem = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    // edit message (toolbar button)
    await this.modPage.waitAndClick(e.editMessageButton);
    await this.modPage.hasElement(e.chatEditingWarningContainer, 'should display the message editing warning container');
    await this.modPage.hasElement(e.cancelEditingButton, 'should display the cancel editing button');
    await this.modPage.fill(e.chatBox, e.message2);
    await this.modPage.waitAndClick(e.sendButton);
    // check edited message
    await checkLastMessageSent(this.modPage, e.message2);
    await this.modPage.hasElementCount(e.chatUserMessageText, initialMessagesCount, 'should keep displaying only one message on the public chat');
    await this.modPage.hasElement(e.chatMessageEditedLabel, 'should display the message edited label after editing a message');
  }

  async editMessageFromArrowUp() {
    await openPublicChat(this.modPage);
    // send a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on the public chat');
    await checkLastMessageSent(this.modPage, e.message);
    const initialMessagesCount = await this.modPage.getSelectorCount(e.chatUserMessageText);
    // ArrowUp trigger editing
    await this.modPage.waitAndClick(e.chatBox);
    await this.modPage.press('ArrowUp');
    await this.modPage.hasElement(e.chatEditingWarningContainer, 'should display the message editing warning container');
    await this.modPage.hasElement(e.cancelEditingButton, 'should display the cancel editing button');
    // edit message (arrow up)
    await this.modPage.fill(e.chatBox, e.message2);
    await this.modPage.waitAndClick(e.sendButton);
    // check edited message
    await checkLastMessageSent(this.modPage, e.message2);
    await this.modPage.hasElementCount(e.chatUserMessageText, initialMessagesCount, 'should keep displaying only one message on the public chat');
    // ArrowUp trigger editing
    await this.modPage.waitAndClick(e.chatBox);
    await this.modPage.press('ArrowUp');
    await this.modPage.hasElement(e.chatEditingWarningContainer, 'should display the message editing warning container');
    await this.modPage.hasElement(e.cancelEditingButton, 'should display the cancel editing button');
    // cancel editing
    await this.modPage.fill(e.chatBox, 'extra characters');
    await this.modPage.press('Escape');
    await this.modPage.wasRemoved(e.chatEditingWarningContainer, 'should display the chat box');
    await expect(this.modPage.getLocator(e.chatBox), 'should not display any text in the chat box').toHaveValue('')
  }

  async ableToEditOwnMessage() {
    await openPublicChat(this.modPage);
    // mod send a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on its public chat');
    await this.userPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on the user public chat');
    await checkLastMessageSent(this.modPage, e.message);
    await checkLastMessageSent(this.userPage, e.message);
    // user hover mod message
    const lastMessageItem = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await expect(lastMessageItem.locator(e.replyMessageButton), 'should display the reply message button when hovering the mod message').toBeVisible();
    await expect(lastMessageItem.locator(e.reactMessageButton), 'should display the react message button when hovering the mod message').toBeVisible();
    await expect(lastMessageItem.locator(e.editMessageButton), 'should display the edit message button when hovering the mod message').toBeVisible();
    // user send a message
    await this.userPage.type(e.chatBox, e.testMessage);
    await this.userPage.waitAndClick(e.sendButton);
    await this.userPage.hasElementCount(e.chatUserMessageText, 2, 'should display both messages sent on the mod public chat');
    await this.modPage.hasElementCount(e.chatUserMessageText, 2, 'should display both messages sent on the user public chat');
    await checkLastMessageSent(this.modPage, e.testMessage);
    await checkLastMessageSent(this.userPage, e.testMessage);
    // mod hover user message
    await lastMessageItem.hover();
    const lastMessageSent = {
      replyMessageButton: lastMessageItem.locator(e.replyMessageButton),
      reactMessageButton: lastMessageItem.locator(e.reactMessageButton),
      editMessageButton: lastMessageItem.locator(e.editMessageButton),
    }
    await expect(lastMessageItem, 'should display the message toolbar when hovering a user message').toBeVisible();
    await expect(lastMessageSent.replyMessageButton, 'should display the reply message button when hovering a user message').toBeVisible();
    await expect(lastMessageSent.reactMessageButton, 'should display the react message button when hovering a user message').toBeVisible();
    await expect(lastMessageSent.editMessageButton, 'should not display the edit message button when hovering a user message').not.toBeVisible();
  }

  async deleteOwnMessage() {
    await openPublicChat(this.modPage);
    // send a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on the public chat');
    await checkLastMessageSent(this.modPage, e.message);
    const initialMessageItemsCount = await this.modPage.getSelectorCount(e.chatMessageItem);
    // hover and react message
    const lastMessageItem = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await this.modPage.hasElement(e.messageToolbar, 'should display the message toolbar when hovering a message');
    await this.modPage.waitAndClick(e.reactMessageButton);
    await this.modPage.getByLabelAndClick(e.thumbsUpEmoji);
    await this.modPage.hasElement(e.messageReactionItem, 'should display the reaction item for the mod');
    // hover and delete message
    await lastMessageItem.hover();
    await this.modPage.waitAndClick(e.deleteMessageButton);
    await this.modPage.hasElement(e.simpleModal, 'should display the delete message confirmation modal');
    await this.modPage.waitAndClick(e.confirmDeleteChatMessageButton);
    // check deleted message
    await expect(lastMessageItem, 'should display the message deleted label after deleting a message').toContainText(`This message has been deleted by ${this.modPage.username}`);
    await this.modPage.wasRemoved(e.chatUserMessageText, 'should remove the message content from the public chat');
    await this.modPage.hasElementCount(e.chatMessageItem, initialMessageItemsCount, 'should keep displaying the deleted message item on the public chat');
    await this.modPage.wasRemoved(e.messageReactionItem, 'should remove the message reaction item from the deleted message');
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should not display the message toolbar when hovering a deleted message').not.toBeVisible();
  }

  async deleteAnotherUserMessage() {
    await openPublicChat(this.userPage);
    // user send a message
    await this.userPage.type(e.chatBox, e.message);
    await this.userPage.waitAndClick(e.sendButton);
    await this.userPage.hasElement(e.chatUserMessageText, 'should display the message sent by the user on its public chat');
    await checkLastMessageSent(this.modPage, e.message);
    const initialMessageItemsCount = await this.modPage.getSelectorCount(e.chatMessageItem);
    // hover and react message
    const lastMessageItem = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await this.modPage.waitAndClick(e.reactMessageButton);
    await this.modPage.getByLabelAndClick(e.thumbsUpEmoji);
    await this.modPage.hasElement(e.messageReactionItem, 'should display the reaction item for the mod');
    // hover and delete message
    await lastMessageItem.hover();
    await this.modPage.waitAndClick(e.deleteMessageButton);
    await this.modPage.hasElement(e.simpleModal, 'should display the delete message confirmation modal');
    await this.modPage.waitAndClick(e.confirmDeleteChatMessageButton);
    // check deleted message
    await expect(lastMessageItem, 'should display the message deleted label after deleting a message').toContainText(`This message has been deleted by ${this.modPage.username}`);
    await this.modPage.wasRemoved(e.chatUserMessageText, 'should remove the message content from the public chat');
    await this.modPage.hasElementCount(e.chatMessageItem, initialMessageItemsCount, 'should keep displaying the deleted message item on the public chat');
    await this.modPage.wasRemoved(e.messageReactionItem, 'should remove the message reaction item from the deleted message');
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should not display the message toolbar when hovering a deleted message').not.toBeVisible();
    // join mod2 and send a message
    await this.initModPage2();
    await this.modPage2.type(e.chatBox, e.message);
    await this.modPage2.waitAndClick(e.sendButton);
    // check if mod2 message is deletable by mod1
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the mod2 on the public chat');
    await checkLastMessageSent(this.modPage, e.message);
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await this.modPage.waitAndClick(e.deleteMessageButton);
    await this.modPage.hasElement(e.simpleModal, 'should display the delete message confirmation modal');
    await this.modPage.waitAndClick(e.confirmDeleteChatMessageButton);
    // check deleted message
    const lastMessageItem2 = this.modPage.getLocator(e.chatMessageItem).last();
    await expect(lastMessageItem2, 'should display the message deleted label after deleting a message').toContainText(`This message has been deleted by ${this.modPage.username}`);
    await this.modPage.wasRemoved(e.chatUserMessageText, 'should remove the message content from the public chat');
    await this.modPage.hasElementCount(e.chatMessageItem, initialMessageItemsCount + 1, 'should keep displaying the mod2 deleted message item on the public chat');
  }

  async breakoutsModDelete() {
    // create breakout rooms
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.waitAndClick(e.modalConfirmButton);
    // join both users in room1
    await this.userPage.waitAndClick(e.modalConfirmButton);
    await this.userPage.waitAndClick(e.breakoutRoomsItem);
    await this.userPage.hasElement(e.alreadyConnected, 'should display the element alreadyConnected when user join', ELEMENT_WAIT_LONGER_TIME);
    const breakoutUserPage = await this.userPage.getLastTargetPage(this.context);
    await breakoutUserPage.waitAndClick(e.closeModal);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom1);
    await this.modPage.hasElement(e.alreadyConnected, 'should display the alreadyConnected element when mod join', ELEMENT_WAIT_LONGER_TIME);
    const breakoutModPage = await this.modPage.getLastTargetPage(this.context);
    await breakoutModPage.waitAndClick(e.closeModal);
    // mod send a message
    await breakoutModPage.type(e.chatBox, e.message);
    await breakoutModPage.waitAndClick(e.sendButton);
    await breakoutModPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on the public chat');
    await checkLastMessageSent(breakoutModPage, e.message);
    // check if user cannot delete mod message
    const lastMessageItemBreakoutUser = breakoutUserPage.getLocator(e.chatMessageItem).last();
    await lastMessageItemBreakoutUser.hover();
    await expect(lastMessageItemBreakoutUser.locator(e.messageToolbar), 'should display the message toolbar when hovering a user message').toBeVisible();
    await expect(lastMessageItemBreakoutUser.locator(e.replyMessageButton), 'should display the reply message button when hovering a user message').toBeVisible();
    await expect(lastMessageItemBreakoutUser.locator(e.reactMessageButton), 'should display the react message button when hovering a user message').toBeVisible();
    await expect(lastMessageItemBreakoutUser.locator(e.editMessageButton), 'should not display the edit message button when hovering a user message').not.toBeVisible();
    // check if mod can delete own message
    const lastMessageItemBreakoutMod = breakoutModPage.getLocator(e.chatMessageItem).last();
    await lastMessageItemBreakoutMod.hover();
    await expect(lastMessageItemBreakoutMod.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await expect(lastMessageItemBreakoutMod.locator(e.replyMessageButton), 'should display the reply message button on the toolbar').toBeVisible();
    await expect(lastMessageItemBreakoutMod.locator(e.reactMessageButton), 'should display the react message button on the toolbar').toBeVisible();
    await expect(lastMessageItemBreakoutMod.locator(e.editMessageButton), 'should display the edit message button on the toolbar').toBeVisible();
    await breakoutModPage.waitAndClick(e.deleteMessageButton);
    await breakoutModPage.hasElement(e.simpleModal, 'should display the delete message confirmation modal');
    await breakoutModPage.waitAndClick(e.confirmDeleteChatMessageButton);
    // check deleted message
    const lastMessageItemMod = await breakoutModPage.getLocator(e.chatMessageItem).last();
    await expect(lastMessageItemMod, 'should display the message deleted label after deleting a message for the mod').toContainText(`This message has been deleted by ${this.modPage.username}`);
    const lastMessageItemUser = await breakoutUserPage.getLocator(e.chatMessageItem).last();
    await expect(lastMessageItemUser, 'should display the message deleted label after deleting a message for the viewer').toContainText(`This message has been deleted by ${this.modPage.username}`);
  }

  async replyMessage() {
    await openPublicChat(this.modPage);
    // send a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on the public chat');
    await checkLastMessageSent(this.modPage, e.message);
    const initialMessagesCount = await this.modPage.getSelectorCount(e.chatUserMessageText);
    // hover message and click to reply
    const lastMessageItem = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await this.modPage.waitAndClick(e.replyMessageButton);
    // check reply container
    const closeReplyBtn = this.modPage.getLocator(e.closeChatReplyIntentionButton);
    await this.modPage.hasElement(e.chatReplyIntentionContainerContent, 'should display the chat reply intention container content');
    await expect(closeReplyBtn, 'should display the close reply button').toHaveAttribute('tabindex', '0');
    await this.modPage.hasText(e.chatReplyIntentionContainerContent, e.message, 'should display the replying message content in the container');
    // reply the message
    await this.modPage.fill(e.chatBox, e.message2);
    await this.modPage.waitAndClick(e.sendButton);
    // check replied message
    await this.modPage.hasElementCount(e.chatUserMessageText, initialMessagesCount + 1, 'should display the reply as a new message');
    await this.modPage.hasElement(e.chatMessageReplied, 'should display the message replied intention container');
    const messageReplied = lastMessageItem.locator(e.chatMessageReplied);
    await expect(messageReplied, 'should display the replied message content in the message sent').toBeVisible();
  }

  async cancelReplyMessage() {
    await openPublicChat(this.modPage);
    // send a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the message sent by the moderator on the public chat');
    await checkLastMessageSent(this.modPage, e.message);
    const initialMessagesCount = await this.modPage.getSelectorCount(e.chatUserMessageText);
    // hover message and click to reply
    const lastMessageItem = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await this.modPage.waitAndClick(e.replyMessageButton);
    // check reply container
    const closeReplyBtn = this.modPage.getLocator(e.closeChatReplyIntentionButton);
    await this.modPage.hasElement(e.chatReplyIntentionContainerContent, 'should display the chat reply intention container content');
    await expect(closeReplyBtn, 'should display the close reply button').toHaveAttribute('tabindex', '0');
    await this.modPage.hasText(e.chatReplyIntentionContainerContent, e.message, 'should display the replying message content in the container');
    // cancel reply by clicking on the button
    await this.modPage.waitAndClick(e.closeChatReplyIntentionButton);
    await this.modPage.wasRemoved(e.chatReplyIntentionContainerContent, 'should remove the reply intention container content (by clicking on the cancel button)');
    await expect(closeReplyBtn, 'should remove the close reply button (by clicking on the cancel button)').toHaveAttribute('tabindex', '-1');
    await this.modPage.wasRemoved(e.chatMessageReplied, 'should not display any message replied message (by clicking on the cancel button)');
    await this.modPage.hasElementCount(e.chatUserMessageText, initialMessagesCount, 'should keep displaying the same number of messages on the public chat');
    // click to reply again
    await lastMessageItem.hover();
    await this.modPage.waitAndClick(e.replyMessageButton);
    // cancel reply by pressing Escape
    await this.modPage.press('Escape');
    await this.modPage.wasRemoved(e.chatReplyIntentionContainerContent, 'should remove the reply intention container content (by pressing Escape)');
    await expect(closeReplyBtn, 'should remove the close reply button (by pressing Escape)').toHaveAttribute('tabindex', '-1');
    await this.modPage.wasRemoved(e.chatMessageReplied, 'should not display any message replied message (by pressing Escape)');
    await this.modPage.hasElementCount(e.chatUserMessageText, initialMessagesCount, 'should keep displaying the same number of messages on the public chat');
  }

  async scrollToRepliedMessage() {
    await openPublicChat(this.modPage);
    // send first message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the first message sent by the moderator on the public chat');
    const targetMessageMod = this.modPage.getLocator(e.chatMessageItem, { hasText: e.message });
    // send many messages
    const MESSAGES_COUNT = 20;
    for (let i = 1; i <= MESSAGES_COUNT; i++) {
      await this.modPage.type(e.chatBox, `message ${i}`);
      await this.modPage.waitAndClick(e.sendButton);
      await this.modPage.hasElementCount(e.chatUserMessageText, i + 1, 'should display the last message sent by the moderator on the public chat');
    }
    await expect(targetMessageMod, 'should not display first message in viewport after multiples messages sent on mod chat').not.toBeInViewport();
    // scroll to first message
    const targetMessageUser = await this.userPage.getLocator(e.chatMessageItem, { hasText: e.message }).first();
    await expect(targetMessageMod, 'should not display the first message in viewport after multiples messages sent on user chat').not.toBeInViewport();
    await targetMessageMod.scrollIntoViewIfNeeded();
    await expect(targetMessageMod, 'should display the first message in the preview window after scrolling to it').toBeInViewport();
    // reply to message
    await targetMessageMod.hover();
    await expect(targetMessageMod.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await this.modPage.waitAndClick(e.replyMessageButton);
    await this.modPage.hasElement(e.chatReplyIntentionContainerContent, 'should display the chat reply intention when replying to a message');
    await this.modPage.fill(e.chatBox, e.testMessage);
    await this.modPage.waitAndClick(e.sendButton);
    // check reply sent
    await this.modPage.hasElementCount(e.chatUserMessageText, MESSAGES_COUNT + 2, 'should display the replied message by the moderator on the mod public chat');
    await this.userPage.hasElementCount(e.chatUserMessageText, MESSAGES_COUNT + 2, 'should display the replied message by the moderator on the user public chat');
    await checkLastMessageSent(this.modPage, e.testMessage);
    await checkLastMessageSent(this.userPage, e.testMessage);
    // click on the replied message
    await expect(targetMessageUser, 'should not display the first message in viewport after multiple messages sent').not.toBeInViewport();
    await this.userPage.waitAndClick(e.chatMessageReplied);
    await expect(targetMessageUser, 'should display the first message in viewport after clicking on the replied ').toBeInViewport();
  }

  async addRemoveReaction() {
    // send first message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the first message sent by the moderator on the public chat');
    // hover message
    const lastMessageItem = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await expect(lastMessageItem.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    // click on react button
    await this.modPage.waitAndClick(e.reactMessageButton);
    await this.modPage.getByLabelAndClick(e.thumbsUpEmoji);
    const messageReactionsMod = this.modPage.getLocator(e.chatMessageItem).last().locator(e.messageReactionItem);
    const messageReactionsUser = this.userPage.getLocator(e.chatMessageItem).last().locator(e.messageReactionItem);
    // check reaction item - moderator
    await expect(messageReactionsMod, 'should display a single reaction item for the mod').toHaveCount(1);
    await expect(messageReactionsMod, 'should display the correct reaction item for the mod').toContainText(e.thumbsUpEmoji);
    await expect(messageReactionsMod, 'should display the correct reaction count for the mod').toContainText('1');
    // check reaction item - viewer
    await expect(messageReactionsUser, 'should display a single reaction item for the viewer').toHaveCount(1);
    await expect(messageReactionsUser, 'should display the correct reaction item for the viewer').toContainText(e.thumbsUpEmoji);
    await expect(messageReactionsUser, 'should display the correct reaction count for the viewer').toContainText('1');
    // remove reaction
    await messageReactionsMod.click();
    // check removed reaction item
    await expect(messageReactionsMod, 'should not display any reaction item for the mod when all reactions are removed').not.toBeVisible();
    await expect(messageReactionsUser, 'should not display any reaction item for the viewer when all reactions are removed').not.toBeVisible();
  }

  async incrementDecrementReaction() {
    // send first message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the first message sent by the moderator on the public chat');
    // hover message
    const lastMessageItemMod = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItemMod.hover();
    await expect(lastMessageItemMod.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    // click on react button
    await this.modPage.waitAndClick(e.reactMessageButton);
    await this.modPage.getByLabelAndClick(e.thumbsUpEmoji);
    const messageReactionsMod = lastMessageItemMod.locator(e.messageReactionItem);
    const messageReactionsUser = this.userPage.getLocator(e.chatMessageItem).last().locator(e.messageReactionItem);
    await expect(messageReactionsMod, 'should display the reaction item for the mod').toBeVisible();
    await expect(messageReactionsUser, 'should display the reaction item for the viewer').toBeVisible();
    // increment reaction
    await messageReactionsUser.click();
    // check reaction item incremented - moderator
    await expect(messageReactionsMod, 'should display a single reaction item for the mod').toHaveCount(1);
    await expect(messageReactionsMod, 'should display the correct reaction item for the mod').toContainText(e.thumbsUpEmoji);
    await expect(messageReactionsMod, 'should display the correct reaction count for the mod').toContainText('2');
    // check reaction item incremented - viewer
    await expect(messageReactionsMod, 'should display a single reaction item for the viewer').toHaveCount(1);
    await expect(messageReactionsMod, 'should display the correct reaction item for the viewer').toContainText(e.thumbsUpEmoji);
    await expect(messageReactionsMod, 'should display the correct reaction count for the viewer').toContainText('2');
  }

  async orderReactions() {
    // send first message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should display the first message sent by the moderator on the public chat');
    // mod react to message
    const lastMessageItemMod = this.modPage.getLocator(e.chatMessageItem).last();
    await lastMessageItemMod.hover();
    await expect(lastMessageItemMod.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await this.modPage.waitAndClick(e.reactMessageButton);
    await this.modPage.getByLabelAndClick(e.thumbsUpEmoji);
    await this.modPage.hasElement(e.messageReactionItem, 'should display the reaction item for the mod');
    // user react to message
    const lastMessageItemUser = this.userPage.getLocator(e.chatMessageItem).last();
    await lastMessageItemUser.hover();
    await expect(lastMessageItemUser.locator(e.messageToolbar), 'should display the message toolbar when hovering a message').toBeVisible();
    await this.userPage.waitAndClick(e.reactMessageButton);
    await this.userPage.getByLabelAndClick(e.grinningFaceEmoji);
    await this.userPage.hasElementCount(e.messageReactionItem, 2, 'should display two reaction items for the viewer');
    await this.modPage.hasElementCount(e.messageReactionItem, 2, 'should display two reaction items for the mod');
    // check first reaction item
    const messageReactionsMod = lastMessageItemMod.locator(e.messageReactionItem);
    const messageReactionsUser = lastMessageItemUser.locator(e.messageReactionItem);
    await expect(messageReactionsMod.first(), 'should display the first reaction item added for the mod').toContainText(e.thumbsUpEmoji);
    await expect(messageReactionsUser.first(), 'should display the first reaction item added for the viewer').toContainText(e.thumbsUpEmoji);
    // mod increment viewer reaction
    await messageReactionsMod.last().click();
    // check reaction item incremented
    await expect(messageReactionsMod.first(), 'should display the correct reaction count for the mod').toContainText('2');
    await expect(messageReactionsUser.first(), 'should display the correct reaction count for the viewer').toContainText('2');
    await expect(messageReactionsMod.first(), 'should display the reaction item with the highest amount (grinning face) first for the mod').toContainText(e.grinningFaceEmoji);
    await expect(messageReactionsUser.first(), 'should display the reaction item with the highest amount (grinning face) first for the viewer').toContainText(e.grinningFaceEmoji);
  }
}

exports.MessageActions = MessageActions;
