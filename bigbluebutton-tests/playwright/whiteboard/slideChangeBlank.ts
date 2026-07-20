import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

// Regression tests for issue 25397 (blank presentation area on slide change).
//
// Before the fix, the [curPageId] effect in whiteboard/component.jsx swapped the
// visible tldraw page (cleanupStore + updateStore(bgShape) + setCurrentPage)
// synchronously, mounting the new slide's background image-shape before its SVG had
// been fetched/decoded. On a cold cache (or a slow link) the presentation area went
// white until the asset arrived. The fix defers the swap behind an Image.decode()
// gate (bounded by a timeout) so the page only becomes visible once it is paintable.
export class SlideChangeBlank extends MultiUsers {
  // Deferred far-slide index. Slide 1 is the initial page; the forward prefetch
  // window is only 2 slides, so a slide this far ahead is guaranteed cold.
  static TARGET = 9;

  // How long the intercepted background SVG response is held back. Must be shorter
  // than the fix's SLIDE_SWAP_DECODE_TIMEOUT (1500ms) so the decode wins the race
  // and gates the swap (rather than the timeout fallback firing).
  static NET_DELAY_MS = 1000;

  async waitForFirstSlidePainted() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the presenter',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(e.currentSlideImg, 'should display the first slide background');
    // Let slide 1's asset finish loading/decoding so the initial paint is not what we measure.
    await this.modPage.page.waitForTimeout(3000);
    // The default presentation must have enough slides to jump far ahead.
    await this.modPage.waitForSelector(e.skipSlide);
  }

  // No white flash: the new slide's background must not become visible in the DOM
  // before its image has been delivered/decoded. We hold back the target SVG's
  // network response, and assert the tldraw page swap (a `.tl-image` whose
  // background-image references `/svg/<target>`) never happens before that response.
  async noBlankOnSlideChange() {
    const { page } = this.modPage;
    const target = SlideChangeBlank.TARGET;
    const delayMs = SlideChangeBlank.NET_DELAY_MS;

    await this.waitForFirstSlidePainted();

    // Instrument the page: record, on the page clock, the first moment the target
    // slide's background is mounted into the DOM.
    await page.evaluate((tgt) => {
      const marker = `/svg/${tgt}`;
      const probe = { tSwap: null as number | null, tResp: null as number | null };
      (window as unknown as { bbbBlankProbe: typeof probe }).bbbBlankProbe = probe;
      const iv = setInterval(() => {
        if (probe.tSwap !== null) {
          clearInterval(iv);
          return;
        }
        const imgs = document.querySelectorAll('.tl-image');
        for (const el of Array.from(imgs)) {
          const bg = (el as HTMLElement).style?.backgroundImage || '';
          if (bg.includes(marker)) {
            probe.tSwap = Date.now();
            clearInterval(iv);
            return;
          }
        }
      }, 10);
    }, target);

    // Hold back the FIRST request for the target slide's background SVG (the fix and
    // tldraw both fetch it), then stamp the delivery time (page clock) right before
    // letting it through. Later duplicate requests continue immediately so no long
    // delay is left in flight at teardown; the page.evaluate is guarded because a late
    // callback can fire after the page starts closing.
    let firstHandled = false;
    await page.route(`**/svg/${target}**`, async (route) => {
      if (firstHandled) {
        await route.continue().catch(() => {});
        return;
      }
      firstHandled = true;
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
      await page
        .evaluate(() => {
          const probe = (window as unknown as { bbbBlankProbe: { tResp: number | null } }).bbbBlankProbe;
          if (probe.tResp === null) probe.tResp = Date.now();
        })
        .catch(() => {});
      await route.continue().catch(() => {});
    });

    await this.modPage.selectSlide(`Slide ${target}`);

    // Wait (bounded) for BOTH the asset delivery (tResp, ~NET_DELAY_MS after the fetch
    // starts) AND the DOM swap (tSwap). Waiting for both avoids reading the probe while
    // the delayed response is still in flight: the buggy synchronous swap sets tSwap at
    // ~200ms, long before the held-back response records tResp, so a naive
    // "wait for tSwap" would read tResp as still-null and mis-report the failure.
    await page.waitForFunction(
      () => {
        const p = (window as unknown as { bbbBlankProbe: { tSwap: number | null; tResp: number | null } })
          .bbbBlankProbe;
        return p.tSwap !== null && p.tResp !== null;
      },
      undefined,
      { timeout: 15000 },
    );

    const probe = await page.evaluate(
      () => (window as unknown as { bbbBlankProbe: { tSwap: number | null; tResp: number | null } }).bbbBlankProbe,
    );

    // Drop any routes still in flight so their callbacks do not run against a closing page.
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    expect(probe.tResp, 'the target slide SVG request should have been intercepted and delivered').not.toBeNull();
    expect(
      probe.tSwap,
      `slide ${target} must not become visible before its background image is delivered/decoded ` +
        `(swap at ${probe.tSwap}ms, asset delivered at ${probe.tResp}ms). A swap before the asset arrives ` +
        'is the white flash of issue 25397.',
    ).toBeGreaterThanOrEqual(probe.tResp as number);
  }

  // Broken / undecodable asset must degrade, never wedge navigation. This guards the
  // async decode-gate the fix introduces: the decode().catch + timeout race must still
  // resolve (and run the swap) when the asset can never decode, and must not leak an
  // uncaught rejection or trip the error boundary.
  async brokenAssetDegradesWithoutHanging() {
    const { page } = this.modPage;
    const target = SlideChangeBlank.TARGET;

    await this.waitForFirstSlidePainted();

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // Make the target slide's background permanently unreachable (network error ->
    // Image.decode() rejects).
    await page.route(`**/svg/${target}**`, (route) => route.abort());

    const start = Date.now();
    await this.modPage.selectSlide(`Slide ${target}`);

    // Navigation must still complete: the page swap runs even though the asset is broken
    // (there is simply nothing to paint). The `.tl-image` for the target page is mounted.
    await page.waitForFunction(
      (tgt) => {
        const marker = `/svg/${tgt}`;
        const imgs = document.querySelectorAll('.tl-image');
        return Array.from(imgs).some((el) => ((el as HTMLElement).style?.backgroundImage || '').includes(marker));
      },
      target,
      // Fix timeout is 1500ms; a rejected decode should resolve well before this bound.
      { timeout: 8000 },
    );
    const elapsed = Date.now() - start;
    expect(elapsed, 'a broken asset must not stall navigation up to (or past) the decode timeout wall').toBeLessThan(
      8000,
    );

    // The whiteboard is still mounted (no error boundary fallback) and no uncaught
    // decode rejection surfaced.
    await this.modPage.hasElement(e.whiteboard, 'whiteboard should remain mounted after a broken slide asset');
    const decodeErrors = pageErrors.filter((m) => /decode|Uncaught \(in promise\)/i.test(m));
    expect(decodeErrors, `no uncaught decode errors expected (got: ${pageErrors.join(' | ')})`).toHaveLength(0);

    // The client is not wedged: navigating to a healthy slide still swaps normally.
    await page.unroute(`**/svg/${target}**`);
    await this.modPage.selectSlide('Slide 2');
    await page.waitForFunction(
      () => {
        const imgs = document.querySelectorAll('.tl-image');
        return Array.from(imgs).some((el) => ((el as HTMLElement).style?.backgroundImage || '').includes('/svg/2'));
      },
      undefined,
      { timeout: 10000 },
    );
  }
}
