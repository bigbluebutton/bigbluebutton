import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';

const firstMoveItem = '[data-test^="moveUserTo"]';

test.describe('Breakout room keyboard accessibility', { tag: '@ci' }, () => {
  test('labels the room count and supports keyboard room renaming', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;

    await modPage.waitAndClick(e.breakoutRoomSidebarButton);

    await expect(modPage.page.getByRole('group', { name: 'Number of rooms' })).toBeVisible();
    const roomName = modPage.page.getByRole('button', { name: 'Rename Room 1' });
    await roomName.focus();
    await modPage.page.keyboard.press('Enter');
    const input = modPage.page.getByRole('textbox', { name: 'Room name' });
    await input.press('ControlOrMeta+A');
    await input.pressSequentially('Keyboard room');
    await input.press('Enter');

    await expect(modPage.page.getByRole('button', { name: 'Rename Keyboard room' })).toBeFocused();
  });

  test('manages running breakout rooms with the keyboard', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initPages(page, testInfo);
    await session.initUserPage2(context);
    const { modPage, userPage } = session;

    await modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await expect(modPage.page.getByRole('group', { name: 'Number of rooms' })).toBeVisible();
    const createRoomName = modPage.page.getByRole('button', { name: 'Rename Room 1' });
    await createRoomName.focus();
    await modPage.page.keyboard.press('Enter');
    const createRoomInput = modPage.page.getByRole('textbox', { name: 'Room name' });
    await createRoomInput.press('ControlOrMeta+A');
    await createRoomInput.pressSequentially('Keyboard room', { delay: 80 });
    await createRoomInput.press('Enter');
    const renamedCreateRoom = modPage.page.getByRole('button', { name: 'Rename Keyboard room' });
    await expect(renamedCreateRoom).toBeFocused();
    await modPage.page.waitForTimeout(750);
    await renamedCreateRoom.press('Enter');
    await createRoomInput.press('ControlOrMeta+A');
    await createRoomInput.pressSequentially('Room 1');
    await createRoomInput.press('Enter');
    await expect(createRoomName).toBeFocused();
    await modPage.page
      .locator(e.unassignedUser, { hasText: /^Attendee$/ })
      .dragTo(modPage.page.locator(e.breakoutBox1));
    await expect(modPage.page.locator(e.breakoutBox1)).toContainText('Attendee');
    await modPage.waitAndClick(e.createBreakoutRoomsButton);
    await userPage.waitAndClick(e.modalDismissButton);

    const runningRoomName = modPage.page.getByRole('button', { name: 'Rename Room 1' });
    await runningRoomName.focus();
    await modPage.page.keyboard.press('Enter');
    await expect(modPage.page.getByRole('textbox', { name: 'Room name' })).toBeVisible();
    await modPage.page.keyboard.press('Escape');

    const unassignedCard = modPage.page.locator(e.breakoutBox0);
    await unassignedCard.focus();
    await modPage.page.keyboard.press('ArrowDown');
    await modPage.page.keyboard.press('ArrowDown');
    const secondRow = modPage.page.locator(`${e.breakoutBox0} [data-test="draggableUser"]`).nth(1);
    const secondRowText = (await secondRow.locator(':scope > span').innerText()).trim();
    await expect(secondRow).toBeFocused();

    await modPage.page.keyboard.press('Enter');
    await expect(modPage.page.locator(firstMoveItem).first()).toBeFocused();
    await modPage.page.keyboard.press('Escape');
    await expect(secondRow).toBeFocused();

    const firstRow = modPage.page.locator(`${e.breakoutBox0} [data-test="draggableUser"]`).first();
    const firstRowText = (await firstRow.locator(':scope > span').innerText()).trim();
    await firstRow.focus();
    await modPage.page.keyboard.press('Space');
    await expect(modPage.page.locator(firstMoveItem).first()).toBeFocused();
    await expect(modPage.page.locator(e.smallToastMsg)).toHaveCount(0);
    await expect(modPage.page.locator(e.breakoutBox0)).toContainText(firstRowText);
    await modPage.page.waitForTimeout(500);
    await modPage.page.keyboard.press('Escape');
    await expect(firstRow).toBeFocused();
    await modPage.page.waitForTimeout(500);

    await secondRow.focus();
    await modPage.page.keyboard.press('Enter');
    await modPage.page.locator(e.moveUserToRoom2).press('Enter');
    await expect(modPage.page.locator(e.smallToastMsg)).toHaveText(`${secondRowText} was invited to Room 2`);

    await userPage.waitAndClick(e.breakoutRoomSidebarButton);
    await userPage.waitAndClick(e.joinFirstRoom);
    await modPage.page.locator(`${e.breakoutBox1} [data-test="draggableUser"]`).waitFor();
    await modPage.page.waitForTimeout(750);

    const roomOneCard = modPage.page.locator(e.breakoutBox1);
    await roomOneCard.focus();
    await modPage.page.keyboard.press('ArrowDown');
    const joinedRow = modPage.page.locator(`${e.breakoutBox1} [data-test="draggableUser"]`);
    await modPage.page.keyboard.press('Enter');
    await modPage.page.keyboard.press('Escape');
    await expect(joinedRow).toBeFocused();
    await expect(joinedRow).toHaveAttribute('data-test', 'draggableUser');
    await expect(joinedRow.locator('[data-test="unassignUserFromBreakoutRoom"]')).not.toBeFocused();

    await modPage.page.keyboard.press('Enter');
    await modPage.page.locator(e.moveUserToRoom2).press('Enter');
    await userPage.waitAndClick(e.modalConfirmButton);
    await expect(modPage.page.locator(e.breakoutBox2)).toContainText('Attendee');
    await modPage.page.waitForTimeout(750);

    const roomTwoRow = modPage.page.locator(`${e.breakoutBox2} [data-test="draggableUser"]`).first();
    await expect(roomTwoRow.locator(':scope > span')).toHaveText('Attendee');
    await roomTwoRow.focus();
    await modPage.page.keyboard.press('Enter');
    await modPage.page.locator(e.moveUserToMainRoom).press('Enter');
    await expect(modPage.page.locator(e.breakoutBox2)).not.toContainText('Attendee');
  });
});
