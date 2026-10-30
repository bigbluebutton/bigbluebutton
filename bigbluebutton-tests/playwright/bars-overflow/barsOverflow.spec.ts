import { initializePages } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { BarsOverflow } from './barsOverflow';

test.describe('Bars priority overflow', () => {
  let barsOverflow: BarsOverflow;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    barsOverflow = new BarsOverflow(browser, context);
    // At phone widths an open chat panel covers the actions bar; servers differ on opening it on join.
    await initializePages(barsOverflow, browser, { testInfo, joinParameter: c.showPublicChatOnLogin });
  });

  test('actions bar keeps essentials at narrow widths', async () => {
    await barsOverflow.essentialsStayVisibleAtNarrowWidth();
  });

  test('secondary items leave the actions bar in priority order', async () => {
    await barsOverflow.nativesCollapseInOrder();
  });

  test('overflow slot never shows a lone item and stays before the microphone', async () => {
    await barsOverflow.overflowSlotNeverShowsALoneItem();
  });

  test('overflowed reactions open the picker inside the viewport', async () => {
    await barsOverflow.overflowedReactionsOpenThePicker(900, 700, false);
    await barsOverflow.overflowedReactionsOpenThePicker(320, 844, true);
  });

  test('overflowed raise hand toggles the hand', { tag: '@ci' }, async ({ context }, testInfo) => {
    await barsOverflow.initModPage2(context, { testInfo });
    await barsOverflow.overflowedRaiseHandTogglesTheHand();
  });

  test('nav bar collapses connection status into options', async () => {
    await barsOverflow.connectionStatusCollapsesIntoOptions();
  });

  test('widening restores items', { tag: '@ci' }, async () => {
    await barsOverflow.wideningRestoresItems();
  });

  test('stable at threshold', async () => {
    await barsOverflow.stableAtThreshold();
  });

  test('no idle re-renders', { tag: '@ci' }, async () => {
    await barsOverflow.noIdleRerenders();
  });

  test('hidden items are not tabbable', { tag: '@ci' }, async () => {
    await barsOverflow.hiddenItemsAreNotTabbable();
  });

  // Plugin bar items can only be injected through the client's internal plugin state; the suite has
  // no plugin fixture for UI slots. Covered by the manual T6 checklist.
  test.fixme('plugin items overflow first', async () => {});

  test.fixme('expanded mode enters, exits with Escape and returns focus to the overflow button', async () => {});

  test.fixme('expanded mode exits when items fit again', async () => {});
});

test.describe('Bars priority overflow without reactions and raise hand', () => {
  let barsOverflow: BarsOverflow;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    barsOverflow = new BarsOverflow(browser, context);
    await initializePages(barsOverflow, browser, {
      testInfo,
      createParameter: 'disabledFeatures=raiseHand,userReactions',
      joinParameter: c.showPublicChatOnLogin,
    });
  });

  test('screen share hides without a menu entry or overflow button', async () => {
    await barsOverflow.screenshareHidesWithoutMenuEntry();
  });
});
