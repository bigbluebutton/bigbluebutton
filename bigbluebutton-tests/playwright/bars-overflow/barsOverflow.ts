import { expect } from '@playwright/test';

import { ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// Measured for a presenter on a desktop browser: raise hand and reactions leave together below
// ~387px, since a lone menu entry never collapses, and screen share below ~321px.
const OVERFLOW_ORDER = ['raiseHand', 'reactions', 'screenshare'];
const MENU_ITEMS = ['raiseHand', 'reactions'];
const THRESHOLD_SWEEP = { from: 410, to: 316, step: 2 };
const WIDE_VIEWPORT = { width: 1600, height: 900 };
const NARROW_WIDTH = 360;
const VERY_NARROW_WIDTH = 290;
// Sub-pixel layout (rem-based heights and gaps) is rounded differently by each measurement.
const SUBPIXEL_TOLERANCE = 1;
// With raise hand and reactions disabled, screen share is the only secondary item; it leaves below ~282px.
const SCREENSHARE_ONLY_WIDTH = 260;
const NAV_BAR_COLLAPSE_WIDTH = 200;
const SEARCH_RANGE = { fullyVisible: 500, collapsed: 300 };
const QUIET_WINDOW_MS = 300;

// Resolves once the actions bar has gone a quiet window without DOM changes after the resize.
async function settle(page: Page) {
  await page.page.evaluate(
    (quietMs) =>
      new Promise<void>((resolve) => {
        const bar = document.querySelector('#ActionsBar');
        if (!bar) {
          resolve();
          return;
        }
        let timer: ReturnType<typeof setTimeout>;
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(done, quietMs);
        });
        const done = () => {
          observer.disconnect();
          resolve();
        };
        observer.observe(bar, { attributes: true, childList: true, subtree: true });
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            timer = setTimeout(done, quietMs);
          }),
        );
      }),
    QUIET_WINDOW_MS,
  );
}

async function hiddenItemIds(page: Page): Promise<string[]> {
  return page.page.evaluate((selector) => {
    const ids = Array.from(document.querySelectorAll(selector)).map((node) => node.getAttribute('data-overflow-item'));
    return ids.filter((id): id is string => !!id);
  }, e.overflowedContentItem);
}

async function overflowSlotState(page: Page) {
  return page.page.evaluate(
    ([slotSelector, audioSelector, overflowedSelector]) => {
      const slot = document.querySelector(slotSelector);
      const siblingSlots = Array.from(slot?.parentElement?.children ?? []).filter((node) =>
        node.hasAttribute('data-overflow-item'),
      );
      const shown = !!slot && !slot.matches(overflowedSelector);
      return {
        firstInGroup: !!slot && siblingSlots[0] === slot,
        beforeAudio: !!slot?.nextElementSibling?.matches(audioSelector),
        buttons: shown ? Array.from(slot!.querySelectorAll('button')).map((b) => b.getAttribute('data-test')) : [],
      };
    },
    [e.overflowButtonSlot, e.audioOverflowSlot, e.overflowedItem],
  );
}

// Distances between the visible items of the center group and those of each side group, next to the
// gap between the center buttons, which the distances must not go below.
async function sectionDistances(page: Page) {
  return page.page.evaluate(
    ([slotSelector, overflowedSelector]) => {
      const center = document.querySelector(slotSelector)!.parentElement!;
      const extent = (group: Element | null) => {
        const rects = Array.from(group?.querySelectorAll('[data-overflow-item]') ?? [])
          .filter((node) => !node.closest(overflowedSelector) && getComputedStyle(node).display !== 'none')
          .map((node) => node.getBoundingClientRect())
          .filter((rect) => rect.width > 0);
        if (!rects.length) return null;
        return { start: Math.min(...rects.map((r) => r.left)), end: Math.max(...rects.map((r) => r.right)) };
      };
      const centerExtent = extent(center)!;
      const distances = [center.previousElementSibling, center.nextElementSibling]
        .map(extent)
        .filter((side): side is { start: number; end: number } => !!side)
        .map((side) => Math.max(side.start - centerExtent.end, centerExtent.start - side.end));
      return { gap: parseFloat(getComputedStyle(center).columnGap), distances };
    },
    [e.overflowButtonSlot, e.overflowedItem],
  );
}

// The nav bar counterpart: distances between the center group (title and its items) and the drawn
// items of each side group, next to the spacing between the first two right-side buttons.
async function navSectionDistances(page: Page) {
  return page.page.evaluate(
    ([titleSelector, overflowedSelector]) => {
      const center = document.querySelector(titleSelector)!.parentElement!;
      const visibleSlots = (group: Element | null) =>
        Array.from(group?.children ?? []).filter(
          (node) =>
            node.hasAttribute('data-overflow-item') &&
            !node.matches(overflowedSelector) &&
            getComputedStyle(node).display !== 'none',
        );
      const extentOf = (rects: DOMRect[]) =>
        rects.length
          ? { start: Math.min(...rects.map((r) => r.left)), end: Math.max(...rects.map((r) => r.right)) }
          : null;
      const drawnRects = (slot: Element) =>
        Array.from(slot.children)
          .map((node) => node.getBoundingClientRect())
          .filter((rect) => rect.width > 0);
      const centerExtent = extentOf([
        center.querySelector(titleSelector)!.getBoundingClientRect(),
        ...visibleSlots(center).flatMap(drawnRects),
      ])!;
      const sideExtent = (group: Element | null) => extentOf(visibleSlots(group).flatMap(drawnRects));
      const distances = [center.previousElementSibling, center.nextElementSibling]
        .map(sideExtent)
        .filter((side): side is { start: number; end: number } => !!side)
        .map((side) => Math.max(side.start - centerExtent.end, centerExtent.start - side.end));
      const rightButtons = visibleSlots(center.nextElementSibling)
        .map((slot) => extentOf(drawnRects(slot)))
        .filter((extent): extent is { start: number; end: number } => !!extent)
        .sort((a, b) => a.start - b.start);
      const gap = rightButtons.length > 1 ? rightButtons[1].start - rightButtons[0].end : null;
      return { gap, distances };
    },
    [e.presentationTitle, e.overflowedItem],
  );
}

async function resize(page: Page, width: number, height = 844) {
  await page.page.setViewportSize({ width, height });
  await settle(page);
}

export class BarsOverflow extends MultiUsers {
  async openOverflowMenu() {
    await this.modPage.waitAndClick(e.actionsBarOverflowButton);
    await this.modPage.hasElement(e.actionsBarOverflowMenu, 'should display the actions bar overflow menu');
  }

  async essentialsStayVisibleAtNarrowWidth() {
    await resize(this.modPage, NARROW_WIDTH);
    await this.modPage.hasElement(e.joinAudio, 'should keep the audio button visible');
    await this.modPage.hasElement(e.joinVideo, 'should keep the camera button visible');
    await this.modPage.hasElement(e.minimizePresentation, 'should keep the minimize presentation button visible');
    await this.modPage.hasElement(e.mediaAreaButton, 'should keep the + (media area) button visible');
    await this.modPage.hasElement(
      e.startScreenSharing,
      `should still display screen share inline at ${NARROW_WIDTH}px`,
    );
    await this.modPage.hasElementCount(e.raiseHandBtn, 0, `should not display raise hand inline at ${NARROW_WIDTH}px`);
    await this.modPage.hasElementCount(
      e.reactionsButton,
      0,
      `should not display reactions inline at ${NARROW_WIDTH}px`,
    );
    await this.modPage.hasElement(
      e.actionsBarOverflowButton,
      `should display the overflow button at ${NARROW_WIDTH}px`,
    );
    await resize(this.modPage, VERY_NARROW_WIDTH);
    await this.modPage.hasElement(e.joinAudio, 'should keep the audio button visible at the narrowest width');
    await this.modPage.hasElement(e.joinVideo, 'should keep the camera button visible at the narrowest width');
    await this.modPage.hasElement(
      e.minimizePresentation,
      'should keep the minimize presentation button visible at the narrowest width',
    );
    await this.modPage.hasElement(e.mediaAreaButton, 'should keep the + button visible at the narrowest width');
    await this.modPage.hasElementCount(e.startScreenSharing, 0, 'should hide the screen share button');
    await this.openOverflowMenu();
    await this.modPage.hasElement(e.raiseHandOption, 'should offer raise hand inside the overflow menu');
    await this.modPage.hasElement(e.reactionsOption, 'should offer reactions inside the overflow menu');
    await this.modPage.hasElementCount(
      e.actionsBarOverflowMenuItem,
      MENU_ITEMS.length,
      'should not offer screen share inside the overflow menu',
    );
  }

  async nativesCollapseInOrder() {
    const widths = [600, 420, 380, 370, 360, 340, 320, 300, 290];
    for (const width of widths) {
      await resize(this.modPage, width);
      const hidden = await hiddenItemIds(this.modPage);
      const hiddenNatives = OVERFLOW_ORDER.filter((id) => hidden.includes(id));
      const expectedPrefix = OVERFLOW_ORDER.slice(0, hiddenNatives.length);
      expect(hiddenNatives, `should only hide items in collapse order at ${width}px`).toEqual(expectedPrefix);
      expect(hidden.sort(), `should not hide anything but the known secondary items at ${width}px`).toEqual(
        hiddenNatives.sort(),
      );
      await this.modPage.hasElement(e.minimizePresentation, `should never hide the presentation button (${width}px)`);
      const hiddenMenuItems = MENU_ITEMS.filter((id) => hidden.includes(id));
      expect([0, MENU_ITEMS.length], `should collapse raise hand and reactions together (${width}px)`).toContain(
        hiddenMenuItems.length,
      );
    }
    const hiddenAtNarrowest = await hiddenItemIds(this.modPage);
    expect(hiddenAtNarrowest.sort(), 'should have collapsed every secondary item at the narrowest width').toEqual(
      [...OVERFLOW_ORDER].sort(),
    );
  }

  // A lone collapsed item would take the overflow slot as its own button, so slowly narrowing the bar
  // would look like that item morphing into the overflow button.
  async overflowSlotNeverShowsALoneItem() {
    const narrowing: number[] = [];
    for (let width = THRESHOLD_SWEEP.from; width >= THRESHOLD_SWEEP.to; width -= THRESHOLD_SWEEP.step) {
      narrowing.push(width);
    }
    const widening = [...narrowing].reverse().slice(1);
    for (const width of [...narrowing, ...widening]) {
      await resize(this.modPage, width);
      const slot = await overflowSlotState(this.modPage);
      expect(slot.firstInGroup, `should keep the overflow slot first in its group (${width}px)`).toBe(true);
      expect(slot.beforeAudio, `should keep the overflow slot right before the microphone (${width}px)`).toBe(true);
      expect(slot.buttons, `should only show the overflow button in its slot (${width}px)`).toEqual(
        slot.buttons.length ? ['actionsBarOverflowButton'] : [],
      );
      const hidden = await hiddenItemIds(this.modPage);
      const hiddenMenuItems = MENU_ITEMS.filter((id) => hidden.includes(id));
      expect(hiddenMenuItems.length, `should never collapse a single menu item (${width}px)`).not.toBe(1);
      const { gap, distances } = await sectionDistances(this.modPage);
      for (const distance of distances) {
        expect(
          distance,
          `should keep the bar sections at least the center gap (${gap}px) apart (${width}px)`,
        ).toBeGreaterThanOrEqual(gap - SUBPIXEL_TOLERANCE);
      }
      const nav = await navSectionDistances(this.modPage);
      expect(nav.gap, `should have two right-side nav bar buttons to read their spacing (${width}px)`).not.toBeNull();
      for (const distance of nav.distances) {
        expect(
          distance,
          `should keep the nav bar sections at least the button spacing (${nav.gap}px) apart (${width}px)`,
        ).toBeGreaterThanOrEqual(nav.gap! - SUBPIXEL_TOLERANCE);
      }
    }
  }

  async screenshareHidesWithoutMenuEntry() {
    await resize(this.modPage, SCREENSHARE_ONLY_WIDTH);
    expect(await hiddenItemIds(this.modPage), 'should only hide the screen share button').toEqual(['screenshare']);
    await this.modPage.hasElementCount(e.startScreenSharing, 0, 'should not display the screen share button');
    await this.modPage.hasElementCount(
      e.actionsBarOverflowButton,
      0,
      'should not display the overflow button when only screen share left',
    );
    await this.modPage.hasHiddenElementCount(
      e.overflowButtonPlaceholder,
      1,
      'should keep the overflow button slot as a hidden placeholder',
    );
    await this.modPage.hasElement(e.mediaAreaButton, 'should keep the + button, which also shares the screen');
    await resize(this.modPage, WIDE_VIEWPORT.width, WIDE_VIEWPORT.height);
    await this.modPage.hasElement(e.startScreenSharing, 'should show the screen share button again when wide');
  }

  async overflowedReactionsOpenThePicker(width: number, height: number, viaOverflow: boolean) {
    await resize(this.modPage, width, height);
    if (viaOverflow) {
      await this.openOverflowMenu();
      await this.modPage.waitAndClick(e.reactionsOption);
    } else {
      await this.modPage.waitAndClick(e.reactionsButton);
    }
    await this.modPage.hasElement(e.reactionsDropdownMenu, 'should display the reactions picker');
    const picker = this.modPage.page.locator(e.reactionsPickerList);
    await expect(async () => {
      const box = await picker.boundingBox();
      const viewport = this.modPage.page.viewportSize();
      expect(box, 'should have a rendered picker').not.toBeNull();
      expect(box!.x, 'should keep the picker inside the left edge').toBeGreaterThanOrEqual(0);
      expect(box!.y, 'should keep the picker inside the top edge').toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, 'should keep the picker inside the right edge').toBeLessThanOrEqual(viewport!.width);
      expect(box!.y + box!.height, 'should keep the picker inside the bottom edge').toBeLessThanOrEqual(
        viewport!.height,
      );
      if (viaOverflow) {
        const bar = await this.modPage.page.locator(e.actionsBarBackground).boundingBox();
        expect(box!.y + box!.height, 'should open the picker above the actions bar').toBeLessThanOrEqual(
          bar!.y + SUBPIXEL_TOLERANCE,
        );
      }
    }).toPass({ timeout: ELEMENT_WAIT_TIME });
    await this.modPage.page.keyboard.press('Escape');
    await this.modPage.wasRemoved(e.reactionsDropdownMenu, 'should close the reactions picker');
  }

  async overflowedRaiseHandTogglesTheHand() {
    await resize(this.modPage, VERY_NARROW_WIDTH);
    await this.modPage.hasElementCount(e.raiseHandBtn, 0, 'should not display the raise hand button inline');
    await this.openOverflowMenu();
    await this.modPage.waitAndClick(e.raiseHandOption);
    await this.modPage2.waitAndClick(e.usersListSidebarButton);
    await this.modPage2.hasElement(e.raisedHandsListItem, 'should display the raised hand in the user list');
    await this.modPage.page.keyboard.press('Escape');
    await this.openOverflowMenu();
    await this.modPage.waitAndClick(e.lowerHandOption);
    await this.modPage2.wasRemoved(e.raisedHandsListItem, 'should remove the raised hand from the user list');
  }

  async connectionStatusCollapsesIntoOptions() {
    await resize(this.modPage, NAV_BAR_COLLAPSE_WIDTH);
    await this.modPage.hasElementCount(
      e.connectionStatusBtn,
      0,
      'should not display the connection status button inline',
    );
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.hasElement(e.appSettingsDropdownMenu, 'should display the options menu');
    await this.modPage.waitAndClick(e.connectionStatusOption);
    await this.modPage.hasElement(e.connectionStatusModal, 'should open the connection status modal');
  }

  async wideningRestoresItems() {
    await resize(this.modPage, NARROW_WIDTH);
    await this.modPage.hasElement(e.actionsBarOverflowButton, 'should display the overflow button when narrow');
    await resize(this.modPage, WIDE_VIEWPORT.width, WIDE_VIEWPORT.height);
    await this.modPage.hasElementCount(e.actionsBarOverflowButton, 0, 'should remove the overflow button when wide');
    await this.modPage.hasElementCount(e.overflowedContentItem, 0, 'should leave no overflowed item when wide');
    await this.modPage.hasElement(e.raiseHandBtn, 'should show raise hand inline again');
    await this.modPage.hasElement(e.reactionsButton, 'should show reactions inline again');
  }

  // Finds the widest viewport at which something collapses, by bisection over settled layouts.
  async findCollapseThreshold(): Promise<number> {
    let visible = SEARCH_RANGE.fullyVisible;
    let { collapsed } = SEARCH_RANGE;
    await resize(this.modPage, visible);
    expect(await hiddenItemIds(this.modPage), 'should start the search with nothing hidden').toEqual([]);
    await resize(this.modPage, collapsed);
    expect((await hiddenItemIds(this.modPage)).length, 'should start the search with items hidden').toBeGreaterThan(0);
    while (visible - collapsed > 1) {
      const middle = Math.floor((visible + collapsed) / 2);
      await resize(this.modPage, middle);
      if ((await hiddenItemIds(this.modPage)).length > 0) collapsed = middle;
      else visible = middle;
    }
    return collapsed;
  }

  async observeOverflowAttributeChanges(durationMs: number): Promise<number> {
    return this.modPage.page.evaluate(
      (duration) =>
        new Promise<number>((resolve) => {
          let changes = 0;
          const observer = new MutationObserver((records) => {
            changes += records.filter((r) => r.attributeName === 'data-overflowed').length;
          });
          observer.observe(document.body, { attributes: true, attributeFilter: ['data-overflowed'], subtree: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(changes);
          }, duration);
        }),
      durationMs,
    );
  }

  async stableAtThreshold() {
    const threshold = await this.findCollapseThreshold();
    for (const width of [threshold, threshold + 1]) {
      await resize(this.modPage, width);
      const changes = await this.observeOverflowAttributeChanges(1000);
      expect(changes, `should not flip data-overflowed while idle at ${width}px`).toBe(0);
    }
  }

  async noIdleRerenders() {
    await resize(this.modPage, WIDE_VIEWPORT.width, WIDE_VIEWPORT.height);
    await settle(this.modPage);
    const mutations = await this.modPage.page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const bar = document.querySelector('#ActionsBar')!;
          let count = 0;
          const observer = new MutationObserver((records) => {
            count += records.filter((r) => r.type === 'childList' || r.attributeName === 'data-overflowed').length;
          });
          observer.observe(bar, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-overflowed'],
          });
          setTimeout(() => {
            observer.disconnect();
            resolve(count);
          }, 2000);
        }),
    );
    expect(mutations, 'should not mutate the actions bar while idle').toBe(0);
  }

  async hiddenItemsAreNotTabbable() {
    await resize(this.modPage, VERY_NARROW_WIDTH);
    expect((await hiddenItemIds(this.modPage)).length, 'should have hidden items to check').toBeGreaterThan(0);
    const focusedInsideHidden: string[] = [];
    const tabStops = 60;
    for (let i = 0; i < tabStops; i += 1) {
      await this.modPage.page.keyboard.press('Tab');
      const hiddenOwner = await this.modPage.page.evaluate(
        (selector) => document.activeElement?.closest(selector)?.getAttribute('data-overflow-item') ?? null,
        e.overflowedItem,
      );
      if (hiddenOwner && hiddenOwner !== 'overflowButton') focusedInsideHidden.push(hiddenOwner);
    }
    expect(focusedInsideHidden, 'should never focus a descendant of a hidden overflow slot').toEqual([]);
  }
}
