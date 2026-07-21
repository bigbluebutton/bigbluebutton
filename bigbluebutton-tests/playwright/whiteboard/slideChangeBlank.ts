import { expect, type Page } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

// Deferred far-slide index. Slide 1 is the initial page; the forward prefetch window is
// only 2 slides, so a slide this far ahead is guaranteed cold.
const TARGET = 9;

// How long the intercepted background SVG response is held back. Must be comfortably
// shorter than the decode-gate timeout in force during the test so the decode reliably
// wins the race and gates the swap, with margin for CI scheduling jitter between the fetch
// starting and the response being delivered.
const NET_DELAY_MS = 600;

// Decode-gate timeout the test forces at runtime (via window.meetingClientSettings, exactly
// where the component reads it - see whiteboard/component.jsx). We raise it well above the
// shipped default so the deliberate NET_DELAY_MS response reliably loses to the decode
// rather than to the fallback timer, keeping the gate assertions deterministic regardless of
// the server's configured value. Overriding it here also exercises the runtime-read wiring:
// if the component ignored the setting and used its own default, these tests would flake.
const FORCED_DECODE_TIMEOUT_MS = 5000;

// Note on the anchored `/svg/<n>(?:\?|["')]|$)` regex used throughout: it matches a
// `.tl-image` background-image URL for slide <n> without also matching `/svg/20` or
// `/svg/21` (the URL is followed by `?` for the sessionToken query, or the closing
// quote/paren of the CSS url()). It is inlined inside each page.evaluate/waitForFunction
// because those callbacks run in the browser and cannot close over a Node-scope helper.

// Regression tests for issue 25397 (blank presentation area on slide change).
//
// Before the fix, the [curPageId] effect in whiteboard/component.jsx swapped the
// visible tldraw page (cleanupStore + background + setCurrentPage) synchronously,
// mounting the new slide's background image-shape before its SVG had been
// fetched/decoded. On a cold cache (or a slow link) the presentation area went white
// until the asset arrived. The fix defers the visible swap behind an Image.decode()
// gate (bounded by a configurable timeout) so the page only becomes visible once it is
// paintable.
export class SlideChangeBlank extends MultiUsers {
  // Force the decode-gate timeout on a page to a known value. The component reads
  // window.meetingClientSettings.public.whiteboard.slideSwapDecodeTimeoutMs on every slide
  // change, so setting it here deterministically controls the race the tests depend on.
  static async setDecodeTimeout(page: Page, ms: number) {
    await page.evaluate((v: number) => {
      const settings = (
        window as unknown as {
          meetingClientSettings?: { public?: { whiteboard?: { slideSwapDecodeTimeoutMs?: number } } };
        }
      ).meetingClientSettings;
      if (settings?.public?.whiteboard) {
        settings.public.whiteboard.slideSwapDecodeTimeoutMs = v;
      }
    }, ms);
  }

  async waitForFirstSlidePainted() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the presenter',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(e.currentSlideImg, 'should display the first slide background');
    // Wait for the actual condition (slide 1's background painted) instead of a fixed
    // sleep, so the initial paint is settled but we do not burn a flat 3s per test.
    await this.modPage.page.waitForFunction(
      () => {
        const imgs = document.querySelectorAll('.tl-image');
        return Array.from(imgs).some((el) => {
          const bg = (el as HTMLElement).style?.backgroundImage || '';
          return bg.includes('/svg/');
        });
      },
      undefined,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
    // The default presentation must have enough slides to jump far ahead.
    await this.modPage.waitForSelector(e.skipSlide);
  }

  // No white flash: the new slide's background must not become visible in the DOM
  // before its image has been delivered/decoded. We hold back the target SVG's
  // network response, and assert the tldraw page swap (a `.tl-image` whose
  // background-image references `/svg/<target>`) never happens before that response.
  async noBlankOnSlideChange() {
    const { page } = this.modPage;
    const target = TARGET;
    const delayMs = NET_DELAY_MS;

    await this.waitForFirstSlidePainted();
    // Raise the gate timeout so the held-back response (NET_DELAY_MS) reliably wins the race
    // against the fallback timer; the assertion below then measures the gate, not the timer.
    await SlideChangeBlank.setDecodeTimeout(page, FORCED_DECODE_TIMEOUT_MS);

    // Instrument the page: record, on the page clock, the first moment the target
    // slide's background is mounted into the DOM.
    await page.evaluate((tgt) => {
      const svgMatches = (bg: string): boolean => new RegExp(`/svg/${tgt}(?:\\?|["')]|$)`).test(bg);
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
          if (svgMatches(bg)) {
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
      { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME },
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
    const target = TARGET;

    await this.waitForFirstSlidePainted();

    // Note: route.abort() below makes Playwright log "failed to load resource" console
    // errors for the aborted SVG. They are harmless here (that is the scenario) but would
    // trip a run with CONSOLE_FAIL=true (core/helpers.ts). We only assert on pageerror.
    const pageErrors: string[] = [];
    const onPageError = (err: Error) => pageErrors.push(err.message);
    page.on('pageerror', onPageError);

    try {
      // Make the target slide's background permanently unreachable (network error ->
      // Image.decode() rejects).
      await page.route(`**/svg/${target}**`, (route) => route.abort());

      await this.modPage.selectSlide(`Slide ${target}`);

      // Navigation must still complete: the swap runs even though the asset is broken (there
      // is simply nothing to paint), so the `.tl-image` for the target page mounts. We assert
      // the outcome (swap happens, no error), not the timing: measuring elapsed from after
      // selectSlide would include the akka/Hasura round-trip and flake on a loaded box.
      await page.waitForFunction(
        (tgt) => {
          const imgs = document.querySelectorAll('.tl-image');
          return Array.from(imgs).some((el) =>
            new RegExp(`/svg/${tgt}(?:\\?|["')]|$)`).test((el as HTMLElement).style?.backgroundImage || ''),
          );
        },
        target,
        { timeout: ELEMENT_WAIT_LONGER_TIME },
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
          return Array.from(imgs).some((el) =>
            /\/svg\/2(?:\?|["')]|$)/.test((el as HTMLElement).style?.backgroundImage || ''),
          );
        },
        undefined,
        { timeout: ELEMENT_WAIT_LONGER_TIME },
      );
    } finally {
      page.off('pageerror', onPageError);
    }
  }

  // Invariant: a slide change that arrives while a viewer is still calibrating its camera
  // (right after join) must still be applied - the viewer must converge to the presenter's
  // slide, not be permanently stranded on slide 1. isMountedRef is not "the component is
  // mounted": it flips true only late, inside adjustCameraOnMount's double-rAF, and
  // adjustCameraOnMount is itself invoked from the decode-gated applyPageSwap. Gating the
  // swap on isMountedRef therefore drops a slide change that lands during that window (the
  // effect only re-fires on curPageId change, so the drop is permanent).
  //
  // We force that window deterministically: hold back the viewer's slide-1 background and
  // raise the viewer's decode-gate timeout, so slide 1's applyPageSwap - and thus its
  // adjustCameraOnMount, and thus isMountedRef flipping true - stays pending while the
  // presenter jumps to a far slide. The viewer MUST follow.
  async viewerFollowsSlideChangeDuringMount() {
    const target = TARGET;

    await this.waitForFirstSlidePainted();
    // Bring a viewer in; they follow the presenter's current slide.
    await this.initUserPage(this.modPage.context);
    await this.userPage.hasElement(e.whiteboard, 'viewer should see the whiteboard', ELEMENT_WAIT_LONGER_TIME);

    // Keep the viewer inside the calibration window: raise its decode-gate timeout and hold
    // back slide 1's background so slide 1's applyPageSwap (which runs adjustCameraOnMount,
    // which sets isMountedRef) stays pending. released lets late duplicates through so no
    // long delay is left in flight at teardown.
    await SlideChangeBlank.setDecodeTimeout(this.userPage.page, FORCED_DECODE_TIMEOUT_MS);
    let released = false;
    await this.userPage.page.route('**/svg/1**', async (route) => {
      if (released) {
        await route.continue().catch(() => {});
        return;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, FORCED_DECODE_TIMEOUT_MS);
      });
      await route.continue().catch(() => {});
    });

    // Navigate immediately, while the viewer's slide-1 swap (and camera calibration) is
    // still pending. No awaited delay here: the change must land inside that window.
    await this.modPage.selectSlide(`Slide ${target}`);

    // The viewer must converge to the target slide. Since the buggy drop is permanent, a
    // generous wait still fails on unfixed code (the viewer stays on slide 1).
    await this.userPage.page.waitForFunction(
      (tgt) => {
        const imgs = document.querySelectorAll('.tl-image');
        return Array.from(imgs).some((el) =>
          new RegExp(`/svg/${tgt}(?:\\?|["')]|$)`).test((el as HTMLElement).style?.backgroundImage || ''),
        );
      },
      target,
      { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME },
    );

    released = true;
    await this.userPage.page.unrouteAll({ behavior: 'ignoreErrors' });

    // Confirm it is actually the target slide (not merely still slide 1).
    const onTarget = await this.userPage.page.evaluate((tgt) => {
      const imgs = document.querySelectorAll('.tl-image');
      return Array.from(imgs).some((el) =>
        new RegExp(`/svg/${tgt}(?:\\?|["')]|$)`).test((el as HTMLElement).style?.backgroundImage || ''),
      );
    }, target);
    expect(
      onTarget,
      `viewer must follow the presenter to slide ${target} even when the change arrives during camera ` +
        'calibration; a permanent strand here means the swap was gated on isMountedRef again.',
    ).toBe(true);
  }
}
