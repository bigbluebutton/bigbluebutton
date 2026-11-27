import { expect, Page as PlaywrightPage, Request, WebSocketRoute } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { Create } from '../breakout/create';
import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  UPLOAD_PDF_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { applyClientSettingsOverridesToContext, ClientSettingsOverrides, Page } from '../core/page';
import { GeneratedFile, getCurrentSlideAspectRatio, getCurrentSlideSvg, uploadSinglePresentation } from './util';

// The upload POST of a presentation, after the token was received (service.js: <endpoint>/<token>/upload).
const UPLOAD_POST_URL = '**/bigbluebutton/presentation/*/upload';
const UPLOAD_POST_PATH = /\/bigbluebutton\/presentation\/[^/]+\/upload$/;
// The client gives up on the token request and on the blank-page mutation after this (TOKEN_TIMEOUT).
const CLIENT_REQUEST_TIMEOUT = 5000;
// The server stops an insert whose upload did not start within this after the token.
const SERVER_REQUEST_DEADLINE = 30000;
// How long a toast that must not show up is waited for.
const NO_MORE_TOASTS_TIME = 3000;

const successText = (count: number, position: number) =>
  `${count} ${count === 1 ? 'slide was' : 'slides were'} inserted at position ${position}`;
const failedText = (filename: string) => `${filename}: ${e.insertPagesFailedLabel}`;
const notConfirmedText = (filename: string) => `${filename}: ${e.insertPagesNotConfirmedLabel}`;

type FileToInsert = string | GeneratedFile;

// The event the plugin SDK dispatches for presentation.insertPages (PresentationCommandsEnum.INSERT_PAGES).
const PLUGIN_INSERT_PAGES_COMMAND = 'PRESENTATION_INSERT_PAGES_COMMAND';

interface HeldUpload {
  requests: Request[];
  release: () => void;
}

// What a page showed since the probe was installed: every toast, every screen-reader alert, the state of the
// insert button, the image of the current slide, the status of the rows in progress of the upload toast and
// the text of the export toast, each with the time it was seen.
interface ProbeMark {
  t: number;
  kind: 'toast' | 'alert' | 'button' | 'slide' | 'uploadStatus' | 'exportToast';
  value: string;
}

// The behavior the GraphQL socket route gives to each mutation of the insert.
type MutationMode = 'pass' | 'drop' | 'error' | 'hold';

// Extends the breakout helpers to open a breakout room as its presenter.
export class InsertPages extends Create {
  private uploadPosts = new Map<Page, Request[]>();

  private socketMode: { token: MutationMode; blank: MutationMode } = { token: 'pass', blank: 'pass' };

  private heldMessages: (() => void)[] = [];

  private tokenMutationsSent = 0;

  // When set, the route of the GraphQL socket drops the server's error notifications of the insert, so that any
  // warning left on the page is the client's own.
  private dropServerInsertErrors = false;

  private pageErrors: string[] = [];

  // ---------- setup ----------

  // Routes the GraphQL socket of the page, before it joins: each mutation of the insert goes through, is
  // dropped, answered with an error or held, as socketMode says.
  async routeGraphqlSocket(page: PlaywrightPage) {
    await page.routeWebSocket('**/graphql**', (webSocket: WebSocketRoute) => {
      const server = webSocket.connectToServer();
      webSocket.onMessage((message) => {
        const text = message.toString();
        const isToken = text.includes('presentationRequestUploadToken(');
        const isBlank = text.includes('presentationInsertBlankPage(');
        if (isToken) this.tokenMutationsSent += 1;
        const mode = (isToken && this.socketMode.token) || (isBlank && this.socketMode.blank) || 'pass';
        if (mode === 'drop') return;
        if (mode === 'error') {
          const { id } = JSON.parse(text);
          webSocket.send(JSON.stringify({ id, type: 'error', payload: [{ message: 'Refused by the e2e test' }] }));
          return;
        }
        if (mode === 'hold') {
          this.heldMessages.push(() => server.send(message));
          return;
        }
        server.send(message);
      });
      server.onMessage((message) => {
        if (this.dropServerInsertErrors && message.toString().includes('app.presentation.insertPages.error.')) return;
        webSocket.send(message);
      });
    });
  }

  // Fails the test on any unhandled error of the page (an unhandled rejection included).
  watchPageErrors(page: PlaywrightPage) {
    page.on('pageerror', (error) => this.pageErrors.push(error.message));
  }

  expectNoPageErrors() {
    expect(this.pageErrors, 'should raise no page error (unhandled rejection) in the client').toEqual([]);
  }

  // Counts the upload POSTs the page sends from now on.
  watchUploadPosts(testPage: Page) {
    const posts: Request[] = [];
    this.uploadPosts.set(testPage, posts);
    testPage.page.on('request', (request) => {
      if (request.method() === 'POST' && UPLOAD_POST_PATH.test(new URL(request.url()).pathname)) posts.push(request);
    });
  }

  private uploadPostCount(testPage: Page) {
    const posts = this.uploadPosts.get(testPage);
    if (!posts) throw new Error('watchUploadPosts was not called for this page');
    return posts.length;
  }

  // Holds the upload POSTs of the page until release() (a held POST never reaches the server).
  private static async holdUploadPost(testPage: Page): Promise<HeldUpload> {
    let release: () => void = () => {};
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    const requests: Request[] = [];
    await testPage.page.route(UPLOAD_POST_URL, async (route) => {
      requests.push(route.request());
      await released;
      await route.continue();
    });
    return { requests, release };
  }

  private static async waitForHeldPost(held: HeldUpload) {
    await expect
      .poll(() => held.requests.length, { message: 'should send the upload POST of the insert' })
      .toBeGreaterThan(0);
  }

  private static async installProbe(testPage: Page) {
    await testPage.page.evaluate(
      ([toastSel, alertSel, buttonSel, slideSel, uploadStatusSel, exportToastSel]) => {
        const w = window as unknown as { insertPagesProbe?: ProbeMark[] };
        if (w.insertPagesProbe) return;
        const marks: ProbeMark[] = [];
        const seenToasts = new WeakSet<Element>();
        const last: Record<string, string> = { alert: '', button: '', slide: '', uploadStatus: '', exportToast: '' };
        const record = (kind: ProbeMark['kind'], value: string) => marks.push({ t: Date.now(), kind, value });
        const changed = (kind: Exclude<ProbeMark['kind'], 'toast'>, value: string) => {
          if (last[kind] === value) return;
          last[kind] = value;
          record(kind, value);
        };
        const scan = () => {
          document.querySelectorAll(toastSel).forEach((toast) => {
            const text = toast.textContent?.trim() ?? '';
            if (text && !seenToasts.has(toast)) {
              seenToasts.add(toast);
              record('toast', text);
            }
          });
          changed('alert', document.querySelector(alertSel)?.textContent?.trim() ?? '');
          // the Button component disables with aria-disabled
          const button = document.querySelector(buttonSel);
          const disabled = button?.getAttribute('aria-disabled') === 'true' || (button as HTMLButtonElement)?.disabled;
          changed('button', button ? `${disabled ? 'disabled' : 'enabled'}` : 'absent');
          const slide = document.querySelector(slideSel) as HTMLElement | null;
          const url = slide?.style?.backgroundImage?.split('"')[1] ?? '';
          changed('slide', url ? new URL(url).pathname : '');
          const texts = (selector: string) =>
            Array.from(document.querySelectorAll(selector))
              .map((element) => element.textContent?.trim() ?? '')
              .join(' | ');
          changed('uploadStatus', texts(uploadStatusSel));
          changed('exportToast', texts(exportToastSel));
        };
        new MutationObserver(scan).observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['disabled', 'aria-disabled', 'style'],
        });
        scan();
        w.insertPagesProbe = marks;
      },
      [
        e.smallToastMsg,
        e.ariaPoliteAlert,
        e.insertPagesButton,
        e.currentSlideImg,
        e.processingPresentationItem,
        e.downloadPresentationToast,
      ],
    );
  }

  private static async probeMarks(testPage: Page, kind: ProbeMark['kind'], since = 0): Promise<ProbeMark[]> {
    const marks = await testPage.page.evaluate(
      () => (window as unknown as { insertPagesProbe?: ProbeMark[] }).insertPagesProbe ?? [],
    );
    return marks.filter((mark) => mark.kind === kind && mark.t >= since);
  }

  private static async toastsWith(testPage: Page, text: string, since = 0) {
    return (await InsertPages.probeMarks(testPage, 'toast', since)).filter((mark) => mark.value.includes(text));
  }

  private static async now(testPage: Page) {
    return testPage.page.evaluate(() => Date.now());
  }

  // Waits for the next render: two animation frames.
  private static async nextRender(testPage: Page) {
    await testPage.page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
  }

  // ---------- toolbar and slides ----------

  private static async currentSlide(testPage: Page) {
    return Number(await testPage.page.locator(e.skipSlide).inputValue());
  }

  private static async totalSlides(testPage: Page) {
    return testPage.page.locator(`${e.skipSlide} option`).count();
  }

  private static async expectTotalSlides(
    testPage: Page,
    total: number,
    message: string,
    timeout = UPLOAD_PDF_WAIT_TIME,
  ) {
    await expect(testPage.page.locator(`${e.skipSlide} option`), message).toHaveCount(total, { timeout });
  }

  private static async expectCurrentSlide(testPage: Page, num: number, message: string, timeout = ELEMENT_WAIT_TIME) {
    await expect(testPage.page.locator(e.skipSlide), message).toHaveValue(String(num), { timeout });
  }

  // The /svg/<pageId> path of the current slide, once the whiteboard shows it.
  private static async slidePath(testPage: Page): Promise<string> {
    await testPage.waitForSelector(e.currentSlideImg, ELEMENT_WAIT_LONGER_TIME);
    let slidePath = '';
    await expect
      .poll(
        async () => {
          slidePath = await testPage.page.evaluate(
            ([selector]) => {
              const url = (document.querySelector(selector) as HTMLElement | null)?.style?.backgroundImage?.split(
                '"',
              )[1];
              return url ? new URL(url).pathname : '';
            },
            [e.currentSlideImg],
          );
          return slidePath;
        },
        { message: 'should show the image of the current slide' },
      )
      .toMatch(/\/svg\/[^/]+$/);
    return slidePath;
  }

  private static async expectSlidePath(testPage: Page, expected: string, message: string) {
    await expect
      .poll(() => InsertPages.slidePath(testPage), { message, timeout: ELEMENT_WAIT_LONGER_TIME })
      .toBe(expected);
  }

  // Goes to slide num (the presenter) and returns the path of its image, once the whiteboard shows it.
  private static async goToSlide(testPage: Page, num: number): Promise<string> {
    const before = await InsertPages.slidePath(testPage);
    if ((await InsertPages.currentSlide(testPage)) === num) return before;
    await testPage.page.locator(e.skipSlide).selectOption(String(num));
    await InsertPages.expectCurrentSlide(testPage, num, `should go to slide ${num}`);
    // the toolbar changes before the image
    await expect
      .poll(() => InsertPages.slidePath(testPage), {
        message: `should show the image of slide ${num}`,
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .not.toBe(before);
    return InsertPages.slidePath(testPage);
  }

  // The image path of each of the slides from..to (navigating the presenter through them).
  private static async slidePaths(testPage: Page, from: number, to: number): Promise<string[]> {
    const paths: string[] = [];
    for (let num = from; num <= to; num += 1) paths.push(await InsertPages.goToSlide(testPage, num));
    return paths;
  }

  private static async waitForPresentation(testPage: Page) {
    await testPage.hasElement(e.whiteboard, 'should display the whiteboard', ELEMENT_WAIT_LONGER_TIME);
    await InsertPages.slidePath(testPage);
    await testPage.hasElement(e.insertPagesButton, 'should display the insert pages button to the presenter');
  }

  private static async expectButtonEnabled(testPage: Page, message: string, timeout = ELEMENT_WAIT_TIME) {
    await expect(testPage.page.locator(e.insertPagesButton), message).toBeEnabled({ timeout });
  }

  private static async expectButtonDisabled(testPage: Page, message: string) {
    await expect(testPage.page.locator(e.insertPagesButton), message).toBeDisabled();
  }

  private static async openInsertMenu(testPage: Page) {
    await InsertPages.expectButtonEnabled(testPage, 'should enable the insert pages button');
    await testPage.waitAndClick(e.insertPagesButton);
    await testPage.hasElement(e.insertBlankPage, 'should open the insert pages menu');
  }

  private static async insertBlankPage(testPage: Page) {
    await InsertPages.openInsertMenu(testPage);
    await testPage.waitAndClick(e.insertBlankPage);
  }

  private static async insertFile(testPage: Page, file: FileToInsert, timeout = ELEMENT_WAIT_LONGER_TIME) {
    await InsertPages.openInsertMenu(testPage);
    const fileChooser = testPage.page.waitForEvent('filechooser');
    await testPage.waitAndClick(e.insertPagesFromFile);
    await (
      await fileChooser
    ).setFiles(typeof file === 'string' ? path.join(__dirname, `../core/media/${file}`) : file, { timeout });
  }

  private static async expectToast(testPage: Page, text: string, message: string, timeout = UPLOAD_PDF_WAIT_TIME) {
    await expect(testPage.page.locator(e.smallToastMsg, { hasText: text }).first(), message).toBeVisible({ timeout });
  }

  // Waits for a toast that may already have closed: the probe saw it.
  private static async expectToastSeen(testPage: Page, text: string, message: string, timeout = UPLOAD_PDF_WAIT_TIME) {
    await expect
      .poll(async () => (await InsertPages.toastsWith(testPage, text)).length, { message, timeout })
      .toBeGreaterThan(0);
  }

  private static async writeText(testPage: Page, text: string) {
    await testPage.waitAndClick(e.wbTextShape);
    const wbBox = await testPage.page.locator(e.whiteboard).boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
    await testPage.page.mouse.click(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    // a key typed before the text editor has the focus is a tool shortcut
    await testPage.page.waitForFunction(() => {
      const active = document.activeElement as HTMLElement | null;
      return !!active && (active.tagName === 'TEXTAREA' || active.isContentEditable);
    });
    await testPage.page.keyboard.type(text);
    await testPage.press('Escape');
    await testPage.press('Escape');
    await InsertPages.expectTexts(testPage, [text], `should write "${text}" on the slide`);
  }

  // The text shapes on the current slide, by their content (a text shape renders its text more than once).
  private static async expectTexts(testPage: Page, texts: string[], message: string) {
    const shapes = testPage.page.locator(e.wbTextTrue);
    await expect(shapes, message).toHaveCount(texts.length, { timeout: ELEMENT_WAIT_LONGER_TIME });
    for (const text of texts) {
      await expect(shapes.filter({ hasText: text }), `${message}: "${text}"`).toHaveCount(1);
    }
  }

  private static async slideWidth(testPage: Page) {
    const box = await testPage.page.locator(e.currentSlideImg).boundingBox();
    return box?.width ?? 0;
  }

  private static async expectAspectRatio(testPage: Page, ratio: number, message: string) {
    await expect
      .poll(async () => Math.round(((await getCurrentSlideAspectRatio(testPage)) ?? 0) * 100) / 100, { message })
      .toBe(Math.round(ratio * 100) / 100);
  }

  // The width and height of the current slide's page, as its image (the SVG made from the PDF page) declares.
  private static async slideSize(testPage: Page) {
    const svg = await getCurrentSlideSvg(testPage);
    const tag = /<svg\b[^>]*>/.exec(svg)?.[0] ?? '';
    const attribute = (name: string) => Number(new RegExp(`\\b${name}="([0-9.]+)`).exec(tag)?.[1] ?? NaN);
    return { width: attribute('width'), height: attribute('height') };
  }

  // Each alert stays 15 s, after the ones queued before it.
  private static async waitForEmptyAlert(testPage: Page, queuedAlerts = 2) {
    await expect(testPage.page.locator(e.ariaPoliteAlert), 'should empty the screen reader alert').toHaveText('', {
      timeout: queuedAlerts * ELEMENT_WAIT_EXTRA_LONG_TIME + ELEMENT_WAIT_TIME,
    });
  }

  private async switchPresentation(name: string) {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    const item = this.modPage.page.locator(e.presentationItem, {
      has: this.modPage.page.locator(e.presentationNames, { hasText: name }),
    });
    await item.locator(e.presentationThumbnails).click();
    await this.modPage.waitAndClick(e.sharePresentationButton);
    await this.modPage.press('Escape');
    await this.modPage.waitForSelectorDetached(e.presentationFileUpload);
  }

  private async presentationNames(): Promise<string[]> {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await expect(this.modPage.page.locator(e.presentationNames).first()).toBeVisible();
    const names = await this.modPage.page.locator(e.presentationNames).allInnerTexts();
    await this.modPage.press('Escape');
    await this.modPage.waitForSelectorDetached(e.presentationFileUpload);
    return names.map((name) => name.trim()).sort();
  }

  // ---------- Ac-B 1 ----------

  // A blank page inserted after slide 1 keeps the annotations and the zoom of every page on it.
  async blankPageKeepsAnnotationsAndZoom() {
    await InsertPages.waitForPresentation(this.modPage);
    await this.userPage.hasElement(e.whiteboard, 'should display the whiteboard to the viewer');
    const total = await InsertPages.totalSlides(this.modPage);
    await InsertPages.installProbe(this.modPage);

    const slideOne = await InsertPages.slidePath(this.modPage);
    await InsertPages.expectSlidePath(this.userPage, slideOne, 'the viewer should see slide 1');
    await expect
      .poll(() => InsertPages.slideWidth(this.userPage), { message: 'the viewer should lay out slide 1' })
      .toBeGreaterThan(0);
    const unzoomedWidth = await InsertPages.slideWidth(this.userPage);
    await InsertPages.writeText(this.modPage, '1a');
    const slideTwo = await InsertPages.goToSlide(this.modPage, 2);
    await InsertPages.writeText(this.modPage, '2a');
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(this.modPage.page.locator(e.resetZoomButton), 'should zoom slide 2 to 125%').toContainText('125%');
    await InsertPages.expectSlidePath(this.userPage, slideTwo, 'the viewer should follow to slide 2');
    await expect
      .poll(() => InsertPages.slideWidth(this.userPage), { message: 'the viewer should see slide 2 zoomed' })
      .toBeGreaterThan(unzoomedWidth * 1.2);
    await InsertPages.goToSlide(this.modPage, 1);
    await InsertPages.expectSlidePath(this.userPage, slideOne, 'the viewer should follow back to slide 1');
    await expect
      .poll(() => InsertPages.slideWidth(this.userPage), { message: 'the viewer should see slide 1 unzoomed' })
      .toBeLessThan(unzoomedWidth * 1.1);

    const since = await InsertPages.now(this.modPage);
    await InsertPages.insertBlankPage(this.modPage);
    await InsertPages.expectTotalSlides(this.modPage, total + 1, 'should add one slide for the presenter');
    await InsertPages.expectCurrentSlide(this.modPage, 2, 'should take the presenter to the new page');
    const blank = await InsertPages.slidePath(this.modPage);
    expect(blank, 'should show a new page, not slide 1').not.toBe(slideOne);
    expect(blank, 'should show a new page, not the old slide 2').not.toBe(slideTwo);
    await InsertPages.expectSlidePath(this.userPage, blank, 'the viewer should see the new page');
    await InsertPages.expectTexts(this.modPage, [], 'the new page should have no annotation');
    await InsertPages.expectToastSeen(this.modPage, successText(1, 2), 'should notify the insert of 1 slide');
    expect(
      await InsertPages.toastsWith(this.modPage, 'inserted at position', since),
      'should notify the insert only once',
    ).toHaveLength(1);

    await InsertPages.writeText(this.modPage, '1b');
    await InsertPages.expectTexts(this.userPage, ['1b'], 'the viewer should see "1b" on the new page');

    await InsertPages.goToSlide(this.modPage, 1);
    await InsertPages.expectSlidePath(this.userPage, slideOne, 'the viewer should see slide 1');
    for (const [role, testPage] of [
      ['presenter', this.modPage],
      ['viewer', this.userPage],
    ] as const) {
      await InsertPages.expectTexts(testPage, ['1a'], `${role}: slide 1 should keep "1a"`);
    }
    await expect(this.modPage.page.locator(e.resetZoomButton), 'slide 1 should stay unzoomed').toContainText('100%');

    await InsertPages.goToSlide(this.modPage, 2);
    await InsertPages.expectSlidePath(this.userPage, blank, 'the viewer should see the new page as slide 2');
    for (const [role, testPage] of [
      ['presenter', this.modPage],
      ['viewer', this.userPage],
    ] as const) {
      await InsertPages.expectTexts(testPage, ['1b'], `${role}: slide 2 should have "1b"`);
    }

    expect(await InsertPages.goToSlide(this.modPage, 3), 'slide 3 should be the old slide 2').toBe(slideTwo);
    await InsertPages.expectSlidePath(this.userPage, slideTwo, 'the viewer should see the old slide 2 as slide 3');
    for (const [role, testPage] of [
      ['presenter', this.modPage],
      ['viewer', this.userPage],
    ] as const) {
      await InsertPages.expectTexts(testPage, ['2a'], `${role}: slide 3 should keep "2a"`);
    }
    await expect(this.modPage.page.locator(e.resetZoomButton), 'slide 3 should keep the zoom').toContainText('125%');
    await expect
      .poll(() => InsertPages.slideWidth(this.userPage), { message: 'the viewer should see slide 3 zoomed' })
      .toBeGreaterThan(unzoomedWidth * 1.2);

    // the arrow keys on the whiteboard know the new total: they go past the old last page
    await this.modPage.waitAndClick(e.wbHandButton);
    await this.modPage.page.locator(e.whiteboard).click({ position: { x: 20, y: 20 } });
    await this.modPage.press('ArrowRight');
    await InsertPages.expectCurrentSlide(this.modPage, 4, 'ArrowRight on the whiteboard should go to slide 4');
    await InsertPages.goToSlide(this.modPage, total);
    await this.modPage.page.locator(e.whiteboard).click({ position: { x: 20, y: 20 } });
    await this.modPage.press('ArrowRight');
    await InsertPages.expectCurrentSlide(
      this.modPage,
      total + 1,
      'ArrowRight on the whiteboard should go past the old last page',
    );
  }

  // ---------- Ac-B 2 ----------

  // A PDF of 3 pages, one of them 16:9, inserted into a 4:3 deck: contiguous pages with their own ratio.
  async insertPdfWithMixedRatios() {
    await InsertPages.waitForPresentation(this.modPage);
    await uploadSinglePresentation(this.modPage, e.insertDeck4x3FileName);
    await InsertPages.waitForPresentation(this.modPage);
    await InsertPages.installProbe(this.modPage);

    const accept = await this.modPage.page.locator(e.insertPagesFileInput).getAttribute('accept');
    const validTypes = await this.modPage.page.evaluate(
      () =>
        (
          window as unknown as {
            meetingClientSettings: {
              public: { presentation: { uploadValidMimeTypes: { extension: string; mime: string }[] } };
            };
          }
        ).meetingClientSettings.public.presentation.uploadValidMimeTypes,
    );
    const accepted = (accept ?? '').split(',');
    expect(accepted, 'the file chooser should accept the document types').toEqual(
      validTypes.filter((type) => !type.mime.startsWith('image/')).map((type) => type.extension),
    );
    expect(accepted, 'the file chooser should accept PDF').toContain('.pdf');
    for (const image of validTypes.filter((type) => type.mime.startsWith('image/'))) {
      expect(accepted, `the file chooser should not accept the image type ${image.extension}`).not.toContain(
        image.extension,
      );
    }

    const deck = await InsertPages.slidePaths(this.modPage, 1, 3);
    await InsertPages.goToSlide(this.modPage, 2);
    await InsertPages.insertFile(this.modPage, e.insertThreePagesFileName);
    await InsertPages.expectTotalSlides(this.modPage, 6, 'should add the 3 pages of the file');
    await InsertPages.expectCurrentSlide(this.modPage, 3, 'should take the presenter to the first inserted page');
    await InsertPages.expectToastSeen(this.modPage, successText(3, 3), 'should notify the insert of 3 slides at 3');

    const after = await InsertPages.slidePaths(this.modPage, 1, 6);
    expect(after.slice(0, 2), 'slides 1 and 2 should stay in place').toEqual(deck.slice(0, 2));
    expect(after[5], 'the old slide 3 should move to slide 6').toBe(deck[2]);
    expect(new Set(after.slice(2, 5)).size, 'slides 3 to 5 should be three different pages').toBe(3);
    for (const inserted of after.slice(2, 5)) {
      expect(deck, 'slides 3 to 5 should be new pages').not.toContain(inserted);
    }
    const ratios = [4 / 3, 16 / 9, 4 / 3];
    for (const [index, ratio] of ratios.entries()) {
      await InsertPages.goToSlide(this.modPage, index + 3);
      await InsertPages.expectAspectRatio(
        this.modPage,
        ratio,
        `slide ${index + 3} should keep the ratio of page ${index + 1}`,
      );
    }
  }

  // ---------- Ac-B 3 ----------

  async buttonAbsentWhenDisabled() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.skipSlide, 'should display the presentation toolbar to the presenter');
    await this.modPage.hasElementCount(e.insertPagesButton, 0, 'should not display the insert pages button');
    await this.modPage.hasHiddenElementCount(e.insertPagesFileInput, 0, 'should not render the file input');
  }

  // ---------- Ac-B 4 ----------

  // The presenter changes the slide while the upload is held: the pages enter after the slide of the
  // request, the presenter stays on the page, which moves forward, and no screen reader alert fires.
  async slideChangeWhileUploadHeld() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    // each slide change leaves an alert for 15 s, so the pages are told apart by their size, not by visiting them
    const deckSize = await InsertPages.slideSize(this.modPage);
    const slideTwo = await InsertPages.goToSlide(this.modPage, 2);
    await InsertPages.waitForEmptyAlert(this.modPage);
    await InsertPages.installProbe(this.modPage);

    const held = await InsertPages.holdUploadPost(this.modPage);
    await InsertPages.insertFile(this.modPage, e.insertThreePagesFileName);
    await InsertPages.waitForHeldPost(held);
    const slideFive = await InsertPages.goToSlide(this.modPage, 5);
    // the slide change leaves a legitimate alert for 15 s: an alert of the insert would queue after it
    await InsertPages.waitForEmptyAlert(this.modPage);
    const since = await InsertPages.now(this.modPage);
    held.release();

    await InsertPages.expectTotalSlides(this.modPage, total + 3, 'should add the 3 pages');
    await InsertPages.nextRender(this.modPage);
    await InsertPages.nextRender(this.modPage);
    expect(
      (await InsertPages.probeMarks(this.modPage, 'alert', since)).filter((mark) => mark.value),
      'should fire no screen reader alert for a page that only moved',
    ).toEqual([]);
    await expect(this.modPage.page.locator(e.ariaPoliteAlert), 'the alert should stay empty').toHaveText('');
    await InsertPages.expectCurrentSlide(this.modPage, 8, 'the current page should move from 5 to 8');
    expect(await InsertPages.slidePath(this.modPage), 'the presenter should stay on the same page').toBe(slideFive);
    await InsertPages.expectToastSeen(this.modPage, successText(3, 3), 'should notify the insert at position 3');

    expect(await InsertPages.goToSlide(this.modPage, 2), 'slide 2 should stay in place').toBe(slideTwo);
    const inserted = [
      { width: 1024, height: 768 },
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
    ];
    for (const [index, size] of [...inserted, deckSize, deckSize].entries()) {
      await InsertPages.goToSlide(this.modPage, index + 3);
      expect(
        await InsertPages.slideSize(this.modPage),
        `slide ${index + 3} should be ${index < 3 ? `page ${index + 1} of the file` : 'a page of the deck'}`,
      ).toEqual(size);
    }
  }

  // The presenter shows another presentation while the upload is held: the pages enter the target, at the
  // position of the request, and the presenter stays on the other presentation.
  async presentationChangeWhileUploadHeld() {
    await InsertPages.waitForPresentation(this.modPage);
    await uploadSinglePresentation(this.modPage, e.insertDeck4x3FileName);
    await InsertPages.waitForPresentation(this.modPage);
    await InsertPages.installProbe(this.modPage);

    const held = await InsertPages.holdUploadPost(this.modPage);
    await InsertPages.insertFile(this.modPage, e.insertThreePagesFileName);
    await InsertPages.waitForHeldPost(held);
    await this.switchPresentation('default.pdf');
    const defaultTotal = 15;
    await InsertPages.expectTotalSlides(this.modPage, defaultTotal, 'should show the default presentation');
    const shown = await InsertPages.slidePath(this.modPage);
    held.release();

    await InsertPages.expectToastSeen(this.modPage, successText(3, 2), 'should notify 3 slides inserted at 2');
    await InsertPages.nextRender(this.modPage);
    await InsertPages.expectTotalSlides(this.modPage, defaultTotal, 'the shown presentation should keep its pages');
    await InsertPages.expectCurrentSlide(this.modPage, 1, 'the presenter should stay on slide 1');
    expect(await InsertPages.slidePath(this.modPage), 'the presenter should stay on the other presentation').toBe(
      shown,
    );

    await this.switchPresentation(e.insertDeck4x3FileName);
    await InsertPages.expectTotalSlides(this.modPage, 6, 'the target should have the 3 inserted pages');
  }

  // ---------- Ac-B 5 ----------

  // A file that cannot be inserted: one error notification, the button enabled, the target intact, and the
  // next insert (a blank page) is applied.
  async refusedFileThenBlankPage(file: string, errorText: string) {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    const slides = await InsertPages.slidePaths(this.modPage, 1, 2);
    await InsertPages.goToSlide(this.modPage, 1);
    await InsertPages.installProbe(this.modPage);

    await InsertPages.insertFile(this.modPage, file);
    await InsertPages.expectToastSeen(this.modPage, `${file}: ${errorText}`, `should notify that ${file} failed`);
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button after the failure');
    await this.modPage.page.waitForTimeout(NO_MORE_TOASTS_TIME);
    expect(
      (await InsertPages.probeMarks(this.modPage, 'toast')).filter((mark) => mark.value.includes(file)),
      `should notify the failure of ${file} once`,
    ).toHaveLength(1);
    expect(await InsertPages.totalSlides(this.modPage), 'should keep the pages of the target').toBe(total);
    expect(await InsertPages.slidePath(this.modPage), 'should keep slide 1').toBe(slides[0]);

    const blankAt = Date.now();
    await InsertPages.insertBlankPage(this.modPage);
    await InsertPages.expectTotalSlides(this.modPage, total + 1, 'should apply the next insert', UPLOAD_PDF_WAIT_TIME);
    await InsertPages.expectToastSeen(this.modPage, successText(1, 2), 'should notify the blank page');
    return Date.now() - blankAt;
  }

  // ---------- Ac-B 6 ----------

  async buttonDisabledUntilUploadEnds() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    await InsertPages.installProbe(this.modPage);

    const held = await InsertPages.holdUploadPost(this.modPage);
    await InsertPages.insertFile(this.modPage, e.insertManyPagesFileName);
    await InsertPages.waitForHeldPost(held);
    await InsertPages.expectButtonDisabled(this.modPage, 'should disable the button while the upload is held');
    await this.modPage.page.waitForTimeout(1000);
    await InsertPages.expectButtonDisabled(this.modPage, 'should keep the button disabled while the upload is held');
    await this.expectMenuStaysClosed();
    const since = await InsertPages.now(this.modPage);
    held.release();

    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button once the upload ends');
    await InsertPages.expectToastSeen(this.modPage, successText(30, 2), 'should notify the 30 inserted slides');
    const enabledAt = (await InsertPages.probeMarks(this.modPage, 'button', since)).find(
      (mark) => mark.value === 'enabled',
    )?.t;
    const notifiedAt = (await InsertPages.toastsWith(this.modPage, successText(30, 2), since))[0]?.t;
    expect(enabledAt, 'should enable the button').toBeDefined();
    expect(enabledAt!, 'should enable the button before the success notification').toBeLessThan(notifiedAt!);
    await InsertPages.expectTotalSlides(this.modPage, total + 30, 'should add the 30 pages');
    await InsertPages.openInsertMenu(this.modPage);
    await this.modPage.press('Escape');
  }

  // A click forced on the disabled button, and Enter on it, leave the menu closed: no item can start a second insert.
  private async expectMenuStaysClosed() {
    const trigger = this.modPage.page.locator(e.insertPagesButton);
    const items = [e.insertBlankPage, e.insertPagesFromFile];
    const expectClosed = async (how: string) => {
      await InsertPages.nextRender(this.modPage);
      for (const item of items) {
        await expect(this.modPage.page.locator(item), `should keep the menu closed after ${how}`).toBeHidden();
      }
    };
    await trigger.click({ force: true });
    await expectClosed('a click on the disabled button');
    await trigger.focus();
    await this.modPage.page.keyboard.press('Enter');
    await expectClosed('Enter on the disabled button');
  }

  // ---------- Ac-B 7 ----------

  async twoBlankPagesInARow() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    const [slideOne, slideTwo] = await InsertPages.slidePaths(this.modPage, 1, 2);
    await InsertPages.goToSlide(this.modPage, 1);
    await InsertPages.installProbe(this.modPage);

    await InsertPages.insertBlankPage(this.modPage);
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button once the request is answered');
    await InsertPages.insertBlankPage(this.modPage);

    await InsertPages.expectTotalSlides(this.modPage, total + 2, 'should add the two blank pages');
    // two notifications with the same text show as one toast
    await InsertPages.expectToastSeen(this.modPage, 'slide was inserted', 'should notify the inserts');
    await InsertPages.nextRender(this.modPage);
    const current = await InsertPages.currentSlide(this.modPage);
    expect([2, 3], 'the presenter should be on one of the two new pages').toContain(current);
    const currentPath = await InsertPages.slidePath(this.modPage);

    const after = await InsertPages.slidePaths(this.modPage, 1, 4);
    expect(after[0], 'slide 1 should stay in place').toBe(slideOne);
    expect(after[3], 'the old slide 2 should move to slide 4').toBe(slideTwo);
    expect(new Set(after.slice(1, 3)).size, 'slides 2 and 3 should be two different new pages').toBe(2);
    expect(after.slice(1, 3), 'slides 2 and 3 should be new pages').not.toContain(slideTwo);
    expect(after[current - 1], 'the presenter was on a new page').toBe(currentPath);
  }

  // ---------- Ac-B 8 ----------

  async uploadToastAndExportToast() {
    await InsertPages.waitForPresentation(this.modPage);
    // the export toast, closed while the export runs, must not show other presentations afterwards
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.waitAndClick(e.sendPresentationInCurrentStateBtn);
    await this.modPage.press('Escape');
    await this.modPage.waitForSelectorDetached(e.presentationFileUpload);
    await this.modPage.hasElement(e.downloadPresentationToast, 'should display the export toast');
    // closed while the export runs (a DOM click: the toast sits under the actions bar); it shows again with the
    // next progress of the export, and closes when the export ends
    await this.modPage.waitAndClickElement(e.downloadPresentationToast);
    await this.userPage.hasElement(e.downloadPresentation, 'should export the presentation', UPLOAD_PDF_WAIT_TIME);
    await this.modPage.wasRemoved(e.downloadPresentationToast, 'should close the export toast');

    // from here on, the export toast must show no other presentation
    await InsertPages.installProbe(this.modPage);

    // a presentation uploaded and never exported
    await uploadSinglePresentation(this.modPage, e.insertDeck4x3FileName);
    await InsertPages.waitForPresentation(this.modPage);
    await this.modPage.closeAllToastNotifications();

    const held = await InsertPages.holdUploadPost(this.modPage);
    await InsertPages.insertFile(this.modPage, e.insertThreePagesFileName);
    await InsertPages.waitForHeldPost(held);
    const uploadRow = this.modPage.page.locator(e.presentationUploadProgressToast).locator('div', {
      has: this.modPage.page.locator(e.processingPresentationItem),
      hasText: e.insertThreePagesFileName,
    });
    await expect(uploadRow.last(), 'the upload toast should have the row of the file').toBeVisible({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    const status = uploadRow.last().locator(e.processingPresentationItem);
    await expect(status, 'the row should be in progress').toHaveCount(1);
    await expect(status, 'the row should have no status before the conversion').toHaveText('');
    expect(await this.presentationNames(), 'the presentation list should not show the upload').toEqual([
      'default.pdf',
      e.insertDeck4x3FileName,
    ]);
    held.release();

    await expect
      .poll(
        async () =>
          (await InsertPages.probeMarks(this.modPage, 'uploadStatus')).some((mark) =>
            mark.value.includes(e.convertingPresentationFileToast),
          ),
        { message: 'the row should show the conversion', timeout: UPLOAD_PDF_WAIT_TIME },
      )
      .toBe(true);
    await InsertPages.expectToastSeen(this.modPage, successText(3, 2), 'should notify the insert');
    await expect(
      this.modPage.page.locator(e.processingPresentationItem),
      'the row should leave the upload toast after the outcome',
    ).toHaveCount(0, { timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      this.modPage.page.locator(e.presentationUploadProgressToast).filter({ hasText: e.insertThreePagesFileName }),
      'the upload toast should not keep the row of the insert',
    ).toHaveCount(0, { timeout: ELEMENT_WAIT_LONGER_TIME });
    expect(await this.presentationNames(), 'the presentation list should not show the upload').toEqual([
      'default.pdf',
      e.insertDeck4x3FileName,
    ]);
    for (const { value } of await InsertPages.probeMarks(this.modPage, 'exportToast')) {
      expect(value, 'the export toast should not show the insert').not.toContain(e.insertThreePagesFileName);
      expect(value, 'the export toast should not show a presentation never exported').not.toContain(
        e.insertDeck4x3FileName,
      );
    }
  }

  // ---------- Ac-B 9 ----------

  // A inserts many pages with the upload held; B takes presenter and inserts a blank page at the same slide.
  async queueOrderAcrossPresenters() {
    const a = this.modPage;
    const b = this.modPage2;
    await InsertPages.waitForPresentation(a);
    await b.hasElement(e.whiteboard, 'B should display the whiteboard');
    const total = await InsertPages.totalSlides(a);
    const slideOne = await InsertPages.slidePath(a);
    await InsertPages.installProbe(a);

    const held = await InsertPages.holdUploadPost(a);
    await InsertPages.insertFile(a, e.insertManyPagesFileName);
    await InsertPages.waitForHeldPost(held);
    await this.takePresenter();
    await b.press('Escape');
    await InsertPages.waitForPresentation(b);
    await InsertPages.installProbe(b);
    await InsertPages.expectCurrentSlide(b, 1, 'B should be on slide 1');
    const since = await InsertPages.now(b);
    await InsertPages.insertBlankPage(b);

    const bToast = b.page.locator(e.presentationUploadProgressToast);
    await expect(bToast, "B's upload toast should show B's blank page").toContainText(e.blankPageFileName, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await expect(bToast, "B's upload toast should show A's upload").toContainText(e.insertManyPagesFileName);
    await expect(
      a.page.locator(e.presentationUploadProgressToast).filter({ hasText: e.insertManyPagesFileName }),
      "A's upload toast should no longer show A's row",
    ).toHaveCount(0);
    held.release();

    await InsertPages.expectTotalSlides(b, total + 31, 'should apply both inserts', 2 * UPLOAD_PDF_WAIT_TIME);
    await InsertPages.expectToastSeen(a, successText(30, 2), 'A should be notified of its 30 slides');
    await InsertPages.expectToastSeen(b, successText(1, 32), "B should be notified of its slide after A's pages");
    expect(await InsertPages.toastsWith(a, successText(1, 32)), "A should not get B's notification").toHaveLength(0);
    expect(await InsertPages.toastsWith(b, successText(30, 2)), "B should not get A's notification").toHaveLength(0);
    await InsertPages.expectCurrentSlide(b, 32, 'B should be taken to its page, after the pages of A');
    const blank = await InsertPages.slidePath(b);
    await InsertPages.expectSlidePath(a, blank, 'A should see the page of B');
    const shown = (await InsertPages.probeMarks(b, 'slide', since)).map((mark) => mark.value).filter(Boolean);
    expect(shown, 'the presenter should go from slide 1 to the page of B only (A is taken nowhere)').toEqual([blank]);
    expect(slideOne, 'B started on slide 1').not.toBe(blank);

    const pages = await InsertPages.slidePaths(b, 1, 33);
    expect(pages[31], 'slide 32 should be the page of B').toBe(blank);
    expect(new Set(pages.slice(1, 31)).size, "slides 2 to 31 should be A's 30 pages").toBe(30);
    expect(pages.slice(1, 31), "A's pages should come before B's").not.toContain(blank);
  }

  // ---------- Ac-B 10 ----------

  // A blank page after a page of a portrait A4 (fractional size) or square deck: the size of the page
  // before it, rounded, and no upload from the browser.
  async blankPageSizeFollowsReference(file: string) {
    await InsertPages.waitForPresentation(this.modPage);
    await uploadSinglePresentation(this.modPage, file);
    await InsertPages.waitForPresentation(this.modPage);
    await InsertPages.goToSlide(this.modPage, 1);
    const reference = await InsertPages.slideSize(this.modPage);
    const referenceRatio = (await getCurrentSlideAspectRatio(this.modPage)) ?? 0;
    expect(reference.width, 'should read the size of the reference page').toBeGreaterThan(0);
    this.watchUploadPosts(this.modPage);

    await InsertPages.insertBlankPage(this.modPage);
    await InsertPages.expectTotalSlides(this.modPage, 3, 'should add the blank page');
    await InsertPages.expectCurrentSlide(this.modPage, 2, 'should take the presenter to the blank page');
    await expect
      .poll(async () => (await InsertPages.slideSize(this.modPage)).width, { message: 'should show the blank page' })
      .toBe(Math.round(reference.width));
    expect(await InsertPages.slideSize(this.modPage), 'the blank page should have the rounded size').toEqual({
      width: Math.round(reference.width),
      height: Math.round(reference.height),
    });
    await InsertPages.expectAspectRatio(
      this.modPage,
      Math.round(reference.width) / Math.round(reference.height),
      'the blank page should show in its own ratio',
    );
    expect(
      Math.abs(((await getCurrentSlideAspectRatio(this.modPage)) ?? 0) - referenceRatio),
      'the blank page should have the ratio of the reference page',
    ).toBeLessThan(0.01);
    expect(this.uploadPostCount(this.modPage), 'a blank page should send no upload from the browser').toBe(0);
  }

  // ---------- breakout rooms ----------

  // The presenter of a breakout room is offered the button only when allowPresentationManagementInBreakouts is on,
  // as the other entry points of presentation management (actions-bar/media-area/container.tsx).
  async insertButtonInBreakoutRoom(allowedInRooms: boolean, overrides?: ClientSettingsOverrides) {
    if (!this?.userPage) throw new Error('userPage not initialized');
    // control: the setting does not apply outside a breakout room
    await InsertPages.waitForPresentation(this.modPage);

    await this.createRoomsWith([this.userPage]);
    if (overrides) await applyClientSettingsOverridesToContext(this.modPage.page.context(), overrides);
    const room = new Page(this.browser, await this.joinFirstBreakoutRoomAsModerator(), this.modPage.testInfo);
    expect(
      await room.page.evaluate(
        () =>
          (window as unknown as { meetingClientSettings: { public: { app: { breakouts: Record<string, unknown> } } } })
            .meetingClientSettings.public.app.breakouts.allowPresentationManagementInBreakouts,
      ),
      `the breakout room should run with allowPresentationManagementInBreakouts=${allowedInRooms}`,
    ).toBe(allowedInRooms);

    // control: the moderator is the room's presenter and the toolbar of the presentation is shown
    await room.hasElement(e.whiteboard, 'should display the whiteboard in the room', ELEMENT_WAIT_LONGER_TIME);
    await room.hasElement(
      e.nextSlide,
      'should show the slide controls to the room presenter',
      ELEMENT_WAIT_LONGER_TIME,
    );
    if (allowedInRooms) {
      await room.hasElement(e.insertPagesButton, 'should offer the room presenter to insert pages');
    } else {
      await room.wasRemoved(e.insertPagesButton, 'should not offer the room presenter to insert pages');
    }
    await room.page.close();
  }

  // ---------- Ac-B 21 ----------

  // The token request gets no answer: after 5 s, the failed warning, no POST, and the button enabled.
  async tokenRequestWithoutAnswer() {
    await InsertPages.waitForPresentation(this.modPage);
    this.watchUploadPosts(this.modPage);
    await InsertPages.installProbe(this.modPage);
    this.socketMode.token = 'drop';
    const startedAt = Date.now();
    await InsertPages.insertFile(this.modPage, e.insertThreePagesFileName);
    await InsertPages.expectButtonDisabled(this.modPage, 'should disable the button while the token is requested');
    await InsertPages.expectToast(
      this.modPage,
      failedText(e.insertThreePagesFileName),
      'should warn that the pages could not be inserted',
      2 * CLIENT_REQUEST_TIMEOUT,
    );
    expect(Date.now() - startedAt, 'should warn after the 5 s of the token request').toBeGreaterThanOrEqual(
      CLIENT_REQUEST_TIMEOUT,
    );
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button after the timeout');
    expect(this.uploadPostCount(this.modPage), 'should send no upload').toBe(0);
    this.socketMode.token = 'pass';
    this.expectNoPageErrors();
  }

  // A file over uploadSizeMax: the 413 text with the maximum, no token request, and the button enabled at once.
  async fileTooLarge() {
    await InsertPages.waitForPresentation(this.modPage);
    this.watchUploadPosts(this.modPage);
    const maxSize = await this.modPage.page.evaluate(
      () =>
        (
          window as unknown as {
            meetingClientSettings: { public: { presentation: { mirroredFromBBBCore: { uploadSizeMax: number } } } };
          }
        ).meetingClientSettings.public.presentation.mirroredFromBBBCore.uploadSizeMax,
    );
    const file: GeneratedFile = {
      name: 'oversized.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(maxSize + 1 - 9, 0x25)]),
    };
    const tokensBefore = this.tokenMutationsSent;
    // a file of 30 MB takes a while to reach the browser
    await InsertPages.insertFile(this.modPage, file, UPLOAD_PDF_WAIT_TIME);
    await InsertPages.expectToast(
      this.modPage,
      `oversized.pdf: ${e.presentationTooLargeLabel} ${(maxSize / 1000 / 1000).toFixed(2)} MB`,
      'should refuse the file over the maximum size',
      ELEMENT_WAIT_TIME,
    );
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button at once', 1000);
    expect(this.tokenMutationsSent, 'should request no upload token').toBe(tokensBefore);
    expect(this.uploadPostCount(this.modPage), 'should send no upload').toBe(0);
    this.expectNoPageErrors();
  }

  // An image presentation as the target: one unsupportedTarget notification from the server, no client warning.
  async tokenRefusedForImageTarget() {
    await InsertPages.waitForPresentation(this.modPage);
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);
    await InsertPages.waitForPresentation(this.modPage);
    await this.modPage.closeAllToastNotifications();
    this.watchUploadPosts(this.modPage);
    await InsertPages.installProbe(this.modPage);

    await InsertPages.insertFile(this.modPage, e.insertThreePagesFileName);
    const refusal = `${e.insertThreePagesFileName}: ${e.insertPagesUnsupportedTargetLabel}`;
    await InsertPages.expectToastSeen(this.modPage, refusal, 'should notify that an image cannot take pages');
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button after the refusal');
    await this.modPage.page.waitForTimeout(NO_MORE_TOASTS_TIME);
    expect(await InsertPages.toastsWith(this.modPage, refusal), 'should notify the refusal once').toHaveLength(1);
    expect(
      await InsertPages.toastsWith(this.modPage, failedText(e.insertThreePagesFileName)),
      'should show no failed warning of the client',
    ).toHaveLength(0);
    expect(this.uploadPostCount(this.modPage), 'should send no upload').toBe(0);
    this.expectNoPageErrors();
  }

  // The upload POST fails without an answer: the client cannot tell whether the file arrived, so it warns that the
  // insert could not be confirmed and enables the button; the server stops the insert at its request deadline and
  // notifies the timeout. The client never says the pages could not be inserted.
  async uploadPostFails() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    await InsertPages.installProbe(this.modPage);
    await this.modPage.page.route(UPLOAD_POST_URL, (route) => route.abort());

    await InsertPages.insertFile(this.modPage, e.insertThreePagesFileName);
    await InsertPages.expectToast(
      this.modPage,
      notConfirmedText(e.insertThreePagesFileName),
      'should warn that the insert could not be confirmed',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button after the failed upload');
    await InsertPages.expectToastSeen(
      this.modPage,
      `${e.insertThreePagesFileName}: ${e.insertPagesTimeoutLabel}`,
      'the server should notify the timeout of the insert',
      SERVER_REQUEST_DEADLINE + UPLOAD_PDF_WAIT_TIME,
    );
    expect(await InsertPages.totalSlides(this.modPage), 'should keep the pages of the target').toBe(total);
    expect(
      await InsertPages.toastsWith(this.modPage, failedText(e.insertThreePagesFileName)),
      'should not say the pages could not be inserted',
    ).toHaveLength(0);
    this.expectNoPageErrors();
  }

  // nginx answers 504 while bbb-web still takes the file: the client warns that the insert could not be confirmed,
  // and the server then applies it and notifies it; nothing says the pages could not be inserted.
  async uploadAnswered504ThenApplied() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    await InsertPages.goToSlide(this.modPage, 1);
    await InsertPages.installProbe(this.modPage);
    await this.modPage.page.route(UPLOAD_POST_URL, async (route) => {
      // The intercepted request does not carry the bytes of the file, so the same form is sent again with them.
      const form = route.request().postData() ?? '';
      const field = (name: string) => form.match(new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)\\r\\n`))?.[1] ?? '';
      const fields = ['conference', 'room', 'temporaryPresentationId', 'pod_id', 'is_downloadable', 'current'];
      const sent = await this.modPage.page.request.post(route.request().url(), {
        multipart: {
          ...Object.fromEntries(fields.map((name) => [name, field(name)])),
          fileUpload: {
            name: e.insertThreePagesFileName,
            mimeType: 'application/pdf',
            buffer: fs.readFileSync(path.join(__dirname, `../core/media/${e.insertThreePagesFileName}`)),
          },
        },
      });
      expect(sent.status(), 'bbb-web should take the file').toBe(200);
      await route.fulfill({ status: 504, contentType: 'text/html', body: '504 Gateway Time-out' });
    });

    await InsertPages.insertFile(this.modPage, e.insertThreePagesFileName);
    await InsertPages.expectToastSeen(
      this.modPage,
      notConfirmedText(e.insertThreePagesFileName),
      'should warn that the insert could not be confirmed',
    );
    await InsertPages.expectTotalSlides(this.modPage, total + 3, 'the server should insert the 3 pages');
    await InsertPages.expectToastSeen(this.modPage, successText(3, 2), 'the server should notify the insert');
    await this.modPage.page.waitForTimeout(NO_MORE_TOASTS_TIME);
    expect(
      await InsertPages.toastsWith(this.modPage, failedText(e.insertThreePagesFileName)),
      'should not say the pages could not be inserted',
    ).toHaveLength(0);
    this.expectNoPageErrors();
  }

  // A file at the upload limit passes the client's check of its size, but its upload, a little larger with the form
  // around it, is refused by bbb-web (413), which notifies the failure itself: with that notification dropped on
  // the way, the page shows no warning of the client.
  async fileAtTheLimitSilentOnClient() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    const maxSize = await this.modPage.page.evaluate(
      () =>
        (
          window as unknown as {
            meetingClientSettings: { public: { presentation: { mirroredFromBBBCore: { uploadSizeMax: number } } } };
          }
        ).meetingClientSettings.public.presentation.mirroredFromBBBCore.uploadSizeMax,
    );
    const file: GeneratedFile = {
      name: 'atTheLimit.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(maxSize - 9, 0x25)]),
    };
    await InsertPages.installProbe(this.modPage);
    this.dropServerInsertErrors = true;
    const answered = this.modPage.page.waitForResponse(
      (response) => UPLOAD_POST_PATH.test(new URL(response.url()).pathname),
      { timeout: UPLOAD_PDF_WAIT_TIME },
    );

    // a file of 30 MB takes a while to reach the browser
    await InsertPages.insertFile(this.modPage, file, UPLOAD_PDF_WAIT_TIME);
    expect((await answered).status(), 'bbb-web should refuse the upload over the limit with 413').toBe(413);
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button after the refusal');
    await this.modPage.page.waitForTimeout(NO_MORE_TOASTS_TIME);
    expect(
      await InsertPages.toastsWith(this.modPage, file.name),
      'should show no warning of the client for a refusal the server reports',
    ).toHaveLength(0);
    this.dropServerInsertErrors = false;
    expect(await InsertPages.totalSlides(this.modPage), 'should keep the pages of the target').toBe(total);
    this.expectNoPageErrors();
  }

  // The blank-page mutation answered with an error: the failed warning of blank.pdf. Not answered: the client
  // cannot tell whether the request arrived, so it warns that the insert could not be confirmed.
  async blankPageMutationFails(mode: 'error' | 'drop') {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    await InsertPages.installProbe(this.modPage);
    this.socketMode.blank = mode;
    const startedAt = Date.now();
    await InsertPages.insertBlankPage(this.modPage);
    await InsertPages.expectToast(
      this.modPage,
      mode === 'error' ? failedText(e.blankPageFileName) : notConfirmedText(e.blankPageFileName),
      mode === 'error'
        ? 'should warn that the blank page could not be inserted'
        : 'should warn that the insert of the blank page could not be confirmed',
      2 * CLIENT_REQUEST_TIMEOUT,
    );
    if (mode === 'drop') {
      expect(Date.now() - startedAt, 'should warn after the 5 s of the request').toBeGreaterThanOrEqual(
        CLIENT_REQUEST_TIMEOUT,
      );
    }
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button after the failure');
    this.socketMode.blank = 'pass';
    expect(await InsertPages.totalSlides(this.modPage), 'should keep the pages').toBe(total);
    this.expectNoPageErrors();
  }

  // The blank-page mutation reaches the server only after the client gave up: the warning that the insert could
  // not be confirmed, then the server applies the insert and notifies it. Nothing said it failed, and the late
  // answer brings no second warning.
  async blankPageMutationAnsweredLate() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    await InsertPages.installProbe(this.modPage);
    this.socketMode.blank = 'hold';
    const startedAt = Date.now();
    await InsertPages.insertBlankPage(this.modPage);
    await InsertPages.expectToast(
      this.modPage,
      notConfirmedText(e.blankPageFileName),
      'should warn that the insert of the blank page could not be confirmed',
      2 * CLIENT_REQUEST_TIMEOUT,
    );
    expect(Date.now() - startedAt, 'should warn after the 5 s of the request').toBeGreaterThanOrEqual(
      CLIENT_REQUEST_TIMEOUT,
    );
    await InsertPages.expectButtonEnabled(this.modPage, 'should enable the button after the timeout');
    this.socketMode.blank = 'pass';
    expect(this.heldMessages, 'should have held the mutation').toHaveLength(1);
    this.heldMessages.splice(0).forEach((send) => send());

    await InsertPages.expectTotalSlides(this.modPage, total + 1, 'the server should insert the page');
    await InsertPages.expectToastSeen(this.modPage, successText(1, 2), 'the server should notify the insert');
    await this.modPage.page.waitForTimeout(NO_MORE_TOASTS_TIME);
    expect(
      await InsertPages.toastsWith(this.modPage, notConfirmedText(e.blankPageFileName)),
      'the late answer should bring no second warning',
    ).toHaveLength(1);
    expect(
      await InsertPages.toastsWith(this.modPage, failedText(e.blankPageFileName)),
      'should not say the blank page could not be inserted',
    ).toHaveLength(0);
    this.expectNoPageErrors();
  }

  // ---------- Ac-B 44 ----------

  // With two presentations, each left on slide 2, showing the other one fires the slide content alert.
  async alertOnPresentationChange() {
    await InsertPages.waitForPresentation(this.modPage);
    await InsertPages.goToSlide(this.modPage, 2);
    await uploadSinglePresentation(this.modPage, e.insertDeck4x3FileName);
    await InsertPages.waitForPresentation(this.modPage);
    await InsertPages.goToSlide(this.modPage, 2);
    // the chat message, the slide changes and the new presentation each left an alert
    await InsertPages.waitForEmptyAlert(this.modPage, 5);
    await this.switchPresentation('default.pdf');
    await InsertPages.expectCurrentSlide(this.modPage, 2, 'the default presentation should be on slide 2');
    await expect(
      this.modPage.page.locator(e.ariaPoliteAlert),
      'should alert the screen reader that the slide content changed',
    ).toHaveText(`${e.presentationChangedSlideLabel} 2`, { timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  // ---------- Ac-C 1 and 2: the plugin command presentation.insertPages ----------

  // Sends the plugin command the way the plugin SDK does: a CustomEvent on the window of the page.
  private static async sendInsertCommands(testPage: Page, commands: { position: number; file?: string }[]) {
    const details = commands.map(({ position, file }) =>
      file
        ? {
            position,
            content: { base64: fs.readFileSync(path.join(__dirname, `../core/media/${file}`)).toString('base64') },
            mimeType: 'application/pdf',
            filename: file,
          }
        : { position, content: null },
    );
    await testPage.page.evaluate(
      ([eventName, list]) => {
        list.forEach((detail) => window.dispatchEvent(new CustomEvent(eventName, { detail })));
      },
      [PLUGIN_INSERT_PAGES_COMMAND, details] as const,
    );
  }

  // From slide 2, three commands sent in a row, without waiting: the 3 pages of a PDF at position 3, a blank
  // page at position 3 and a blank page at position 0. The blank page of position 3 comes right after the
  // pages of the PDF, a new page 1 is added, the presenter stays on the same page and no alert fires.
  async pluginCommandsInARow() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    const deck = await InsertPages.slidePaths(this.modPage, 1, 3);
    await InsertPages.goToSlide(this.modPage, 2);
    // the chat message and each slide change leave an alert for 15 s
    await InsertPages.waitForEmptyAlert(this.modPage, 5);
    await InsertPages.installProbe(this.modPage);
    const since = await InsertPages.now(this.modPage);

    await InsertPages.sendInsertCommands(this.modPage, [
      { position: 3, file: e.insertThreePagesFileName },
      { position: 3 },
      { position: 0 },
    ]);

    await InsertPages.expectTotalSlides(this.modPage, total + 5, 'should insert the 3 pages and the 2 blank pages');
    await InsertPages.nextRender(this.modPage);
    await InsertPages.nextRender(this.modPage);
    expect(
      (await InsertPages.probeMarks(this.modPage, 'alert', since)).filter((mark) => mark.value),
      'should fire no screen reader alert',
    ).toEqual([]);
    await expect(this.modPage.page.locator(e.ariaPoliteAlert), 'the alert should stay empty').toHaveText('');
    const shown = (await InsertPages.probeMarks(this.modPage, 'slide', since)).map((mark) => mark.value);
    expect(
      shown.filter((value) => value && value !== deck[1]),
      'the presenter should not change page',
    ).toEqual([]);
    await InsertPages.expectCurrentSlide(this.modPage, 3, 'the current page should move from 2 to 3');
    expect(await InsertPages.slidePath(this.modPage), 'the presenter should stay on the same page').toBe(deck[1]);

    const after = await InsertPages.slidePaths(this.modPage, 1, 8);
    expect(deck, 'slide 1 should be a new page').not.toContain(after[0]);
    expect(after.slice(1, 3), 'the old slides 1 and 2 should move to 2 and 3').toEqual(deck.slice(0, 2));
    const inserted = [
      { width: 1024, height: 768 },
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
    ];
    for (const [index, size] of inserted.entries()) {
      await InsertPages.goToSlide(this.modPage, index + 4);
      expect(
        await InsertPages.slideSize(this.modPage),
        `slide ${index + 4} should be page ${index + 1} of the file`,
      ).toEqual(size);
    }
    expect(deck, 'slide 7 should be a new page').not.toContain(after[6]);
    expect(new Set(after.slice(0, 7)).size, 'slides 1 to 7 should be seven different pages').toBe(7);
    expect(after[7], 'the old slide 3 should come after the blank page of position 3').toBe(deck[2]);
    this.expectNoPageErrors();
  }

  // Two commands with a PDF, sent without waiting, with the upload POSTs held: both POSTs are pending at the
  // same time, and once released the pages of the first command come before those of the second.
  async pluginCommandsUploadInParallel() {
    await InsertPages.waitForPresentation(this.modPage);
    const total = await InsertPages.totalSlides(this.modPage);
    const deck = await InsertPages.slidePaths(this.modPage, 1, 2);
    await InsertPages.goToSlide(this.modPage, 1);
    const held = await InsertPages.holdUploadPost(this.modPage);

    await InsertPages.sendInsertCommands(this.modPage, [
      { position: 2, file: e.insertThreePagesFileName },
      { position: 2, file: e.insertSquareFileName },
    ]);
    await expect
      .poll(() => held.requests.length, {
        message: 'should send the second upload POST while the first one is still pending',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBe(2);
    held.release();

    await InsertPages.expectTotalSlides(this.modPage, total + 5, 'should insert the pages of both files');
    await InsertPages.expectCurrentSlide(this.modPage, 1, 'the presenter should stay on slide 1');
    const after = await InsertPages.slidePaths(this.modPage, 1, 7);
    expect(after[0], 'slide 1 should stay in place').toBe(deck[0]);
    expect(after[6], 'the old slide 2 should come after the inserted pages').toBe(deck[1]);
    const expected = [
      { width: 1024, height: 768 },
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
      { width: 600, height: 600 },
      { width: 600, height: 600 },
    ];
    for (const [index, size] of expected.entries()) {
      await InsertPages.goToSlide(this.modPage, index + 2);
      expect(
        await InsertPages.slideSize(this.modPage),
        `slide ${index + 2} should be ${index < 3 ? `page ${index + 1} of the first file` : 'a page of the second file'}`,
      ).toEqual(size);
    }
    this.expectNoPageErrors();
  }
}
