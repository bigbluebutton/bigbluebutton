import { Browser, BrowserContext, chromium, expect, TestInfo } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// Viewports used to exercise the navigation rail (icon column) at 1280px wide.
// REGIME_A is tall enough that every icon fits with no scroll. GHOST_BAND is the
// height range where, before the fix, the classic 5px scrollbar reserved width
// with zero real overflow and shrank the icons that caused it (issue 25564).
// OVERFLOW is genuinely too short, so a real scrollbar is expected there.
const REGIME_A = { width: 1280, height: 616 };
const GHOST_BAND = { width: 1280, height: 550 };
const OVERFLOW = { width: 1280, height: 460 };

interface RailMetrics {
  offsetWidth: number;
  clientWidth: number;
  scrollHeight: number;
  clientHeight: number;
  buttonCount: number;
  buttonWidth: number | null;
  lastButtonReachable: boolean;
}

// Reads the geometry of the rail scrollbox and of its circular icon buttons.
async function measureRail(page: Page): Promise<RailMetrics> {
  return page.page.evaluate((selector) => {
    const scrollbox = document.querySelector(selector) as HTMLElement;
    // The rail icons are the only circular, square-aspect elements inside the scrollbox.
    const buttons = Array.from(scrollbox.querySelectorAll('div')).filter((el) => {
      const style = getComputedStyle(el);
      return style.borderRadius === '50%' && style.aspectRatio === '1 / 1';
    });
    const first = buttons[0] as HTMLElement | undefined;
    const last = buttons[buttons.length - 1] as HTMLElement | undefined;
    // Scroll to the bottom and check the last icon is inside the viewport (regime C).
    scrollbox.scrollTop = scrollbox.scrollHeight;
    let lastButtonReachable = false;
    if (last) {
      const boxRect = scrollbox.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();
      lastButtonReachable = lastRect.bottom <= boxRect.bottom + 1 && lastRect.top >= boxRect.top - 1;
    }
    scrollbox.scrollTop = 0;
    return {
      offsetWidth: scrollbox.offsetWidth,
      clientWidth: scrollbox.clientWidth,
      scrollHeight: scrollbox.scrollHeight,
      clientHeight: scrollbox.clientHeight,
      buttonCount: buttons.length,
      buttonWidth: first ? Number(first.getBoundingClientRect().width.toFixed(2)) : null,
      lastButtonReachable,
    };
  }, e.sidebarNavigationScrollbox);
}

async function measureAt(page: Page, viewport: { width: number; height: number }): Promise<RailMetrics> {
  await page.setHeightWidthViewPortSize(viewport);
  // Let the layout engine and the rail ResizeObserver settle after the resize.
  await page.page.waitForTimeout(600);
  return measureRail(page);
}

export class SidebarNavigation extends MultiUsers {
  private scrollbarBrowser?: Browser;

  private scrollbarContext?: BrowserContext;

  // The ghost scrollbar only forms with classic (space-consuming) scrollbars.
  // Playwright launches Chromium with --hide-scrollbars by default, which paints
  // zero-width scrollbars and hides the bug entirely. This moderator page runs on
  // an own browser with that flag removed, so the rail behaves like a real desktop
  // Chrome. It still runs headless in CI (no @only-headed needed).
  async initModPageWithVisibleScrollbars(testInfo?: TestInfo): Promise<void> {
    this.scrollbarBrowser = await chromium.launch({
      headless: true,
      ignoreDefaultArgs: ['--hide-scrollbars'],
    });
    this.scrollbarContext = await this.scrollbarBrowser.newContext();
    const page = await this.scrollbarContext.newPage();
    this.modPage = new Page(this.scrollbarBrowser, page, testInfo ?? null);
    await this.modPage.setHeightWidthViewPortSize(REGIME_A);
    await this.modPage.init(true, { fullName: 'Moderator', testInfo });
    await this.modPage.hasElement(e.sidebarNavigationScrollbox, 'the sidebar navigation rail should be displayed');
  }

  async closeVisibleScrollbarsPage(): Promise<void> {
    await this.scrollbarContext?.close();
    await this.scrollbarBrowser?.close();
  }

  // Spec A - the ghost scrollbar itself. With real (space-consuming) scrollbars,
  // the icon buttons must keep the same size at the ghost-band height as in the
  // tall regime. Before the fix they shrink (39px -> 35.75px) because the bar
  // steals width, which is the feedback loop that keeps a zero-overflow bar alive.
  async assertGhostScrollbarAbsent(): Promise<void> {
    const tall = await measureAt(this.modPage, REGIME_A);
    expect(tall.buttonWidth, 'a reference icon size should be measured in the tall regime').not.toBeNull();

    const band = await measureAt(this.modPage, GHOST_BAND);
    expect(
      band.buttonWidth,
      'icon buttons must not shrink when the rail height enters the old ghost-scrollbar band',
    ).toBe(tall.buttonWidth);
    // Honest bar: if the content fits, there is no scroll; if it does not, the bar
    // is backed by real overflow. Either way a zero-overflow reserved bar is gone.
    if (band.scrollHeight <= band.clientHeight) {
      expect(band.lastButtonReachable, 'every icon should be visible when the content fits').toBeTruthy();
    } else {
      expect(band.lastButtonReachable, 'the last icon should be reachable by scrolling when it overflows').toBeTruthy();
    }
  }

  // Spec C - dynamic viewport resizes (the real field trigger). The icon size must
  // stay constant across the whole critical range, a real scrollbar must appear
  // only on genuine overflow, and resizing back to the tall regime must leave no
  // residual scrollbar.
  async assertResizeInvariant(): Promise<void> {
    const base = await measureAt(this.modPage, REGIME_A);
    const reference = base.buttonWidth;

    for (const height of [590, 560, 550, 520, 490, 460]) {
      // eslint-disable-next-line no-await-in-loop
      const metrics = await measureAt(this.modPage, { width: 1280, height });
      expect(metrics.buttonWidth, `icon size must stay constant at 1280x${height}`).toBe(reference);
    }

    const overflow = await measureAt(this.modPage, OVERFLOW);
    expect(overflow.scrollHeight, 'the content should really overflow at a very short height').toBeGreaterThan(
      overflow.clientHeight,
    );
    expect(
      overflow.lastButtonReachable,
      'the last icon should be reachable by scrolling on real overflow',
    ).toBeTruthy();

    const backToTall = await measureAt(this.modPage, REGIME_A);
    expect(
      backToTall.scrollHeight,
      'no overflow should remain after resizing back to the tall regime',
    ).toBeLessThanOrEqual(backToTall.clientHeight);
    expect(backToTall.buttonWidth, 'icon size must return to the reference size').toBe(reference);
  }

  // Spec B - CI-safe invariant guard on the default (scrollbars-hidden) browser.
  // It does not see the ghost bar, but it guards the height budget: the content
  // fits in the tall regime and a real scroll reaches the last icon when short.
  async assertOverflowIsHonest(): Promise<void> {
    const tall = await measureAt(this.modPage, REGIME_A);
    expect(tall.scrollHeight, 'the rail content should fit without scroll in the tall regime').toBeLessThanOrEqual(
      tall.clientHeight,
    );

    const overflow = await measureAt(this.modPage, OVERFLOW);
    expect(overflow.scrollHeight, 'the rail content should overflow at a very short height').toBeGreaterThan(
      overflow.clientHeight,
    );
    expect(
      overflow.lastButtonReachable,
      'the last icon should be reachable by scrolling when it overflows',
    ).toBeTruthy();
  }

  // Measures the rail at one user font-size setting. BBB applies the setting to the
  // html root element (settings/submenus/application, 12-20px), and the layout
  // observer only rewrites the root font size on a viewport resize, so the value
  // survives a plain measurement here. Restored before returning.
  private measureAtFontSize(fontSize: string): Promise<{
    buttonWidth: number | null;
    clientWidth: number;
    scrollWidth: number;
  }> {
    return this.modPage.page.evaluate(
      ([selector, size]) => {
        const html = document.getElementsByTagName('html')[0];
        const previousFontSize = html.style.fontSize;
        html.style.fontSize = size;
        const scrollbox = document.querySelector(selector) as HTMLElement;
        const button = Array.from(scrollbox.querySelectorAll('div')).find((el) => {
          const style = getComputedStyle(el);
          return style.borderRadius === '50%' && style.aspectRatio === '1 / 1';
        }) as HTMLElement | undefined;
        const result = {
          buttonWidth: button ? Number(button.getBoundingClientRect().width.toFixed(2)) : null,
          clientWidth: scrollbox.clientWidth,
          scrollWidth: scrollbox.scrollWidth,
        };
        html.style.fontSize = previousFontSize;
        return result;
      },
      [e.sidebarNavigationScrollbox, fontSize],
    );
  }

  // Spec D - locks in the font-size coupling and its bound. The desktop icon size is
  // min(calc(39rem / 14), 100%), so it follows the user font-size setting up to the
  // scrollbox content box (the rail minus the reserved scrollbar gutter). It must keep
  // tracking the setting, and at the largest setting it must stay inside that content
  // box, so the rail never overflows horizontally (issue 25564). This needs real
  // (space-consuming) scrollbars: with --hide-scrollbars the gutter is zero and the
  // content box is the whole rail, so the bound being guarded here cannot be observed.
  async assertFontSizeScaling(): Promise<void> {
    const base = await measureAt(this.modPage, REGIME_A);
    const reference = base.buttonWidth;
    expect(reference, 'a reference icon size should be measured at the default font size').not.toBeNull();

    // Below the cap the icon still tracks the setting, which is the rem coupling.
    const smallest = await this.measureAtFontSize('12px');
    expect(
      smallest.buttonWidth as number,
      'the icon size should follow the user font size at the smallest setting',
    ).toBeLessThan(reference as number);

    const largest = await this.measureAtFontSize('20px');
    expect(
      largest.buttonWidth as number,
      'the icon must stay within the scrollbox content box at the largest font size',
    ).toBeLessThanOrEqual(largest.clientWidth);
    expect(largest.scrollWidth, 'the rail must not overflow horizontally at the largest font size').toBeLessThanOrEqual(
      largest.clientWidth,
    );
  }
}
