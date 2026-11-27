import { BrowserContext, expect, Locator, Page as PlaywrightPage, Request } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';
import tls from 'tls';

import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  UPLOAD_PDF_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { ClientSettingsOverrides, Page } from '../core/page';

// The host never resolves: the browser only gets this video through routeExternalVideo.
export const EXTERNAL_VIDEO_URL = 'https://bbb-test-stub.local/external-video.webm';

// Serves core/media/external-video.webm to every page of the context, answering range requests so the player can seek.
export async function routeExternalVideo(context: BrowserContext) {
  const video = readFileSync(path.join(__dirname, '../core/media/external-video.webm'));
  await context.route(EXTERNAL_VIDEO_URL, async (route) => {
    // A seeking <video> asks for a byte range ("Range: bytes=START-END", END optional); range[1] and
    // range[2] hold the two numbers, or range is null for a plain request that wants the whole file.
    const range = /^bytes=(\d+)-(\d*)$/.exec((await route.request().headerValue('range')) ?? '');
    if (!range) {
      await route.fulfill({ contentType: 'video/webm', headers: { 'accept-ranges': 'bytes' }, body: video });
      return;
    }
    const start = Number(range[1]);
    const end = range[2] ? Math.min(Number(range[2]), video.length - 1) : video.length - 1;
    await route.fulfill({
      status: 206,
      contentType: 'video/webm',
      headers: { 'accept-ranges': 'bytes', 'content-range': `bytes ${start}-${end}/${video.length}` },
      body: video.subarray(start, end + 1),
    });
  });
}

export async function getExternalVideoTime(testPage: Page): Promise<number> {
  return testPage.page.locator(e.externalVideo).evaluate((video: HTMLVideoElement) => video.currentTime);
}

export async function isExternalVideoPaused(testPage: Page): Promise<boolean> {
  return testPage.page.locator(e.externalVideo).evaluate((video: HTMLVideoElement) => video.paused);
}

export async function expectExternalVideoPlaying(testPage: Page, description: string) {
  const startTime = await getExternalVideoTime(testPage);
  await expect
    .poll(() => getExternalVideoTime(testPage), { message: description, timeout: ELEMENT_WAIT_EXTRA_LONG_TIME })
    .toBeGreaterThan(startTime + 1);
}

export async function checkSvgIndex(testPage: Page, element: string) {
  await testPage.waitForSelector(e.currentSlideImg);
  const check = await testPage.page.evaluate(
    ([el, slideImg]) => {
      const node = document.querySelector(slideImg);
      return !!node && node.outerHTML.includes(el);
    },
    [element, e.currentSlideImg],
  );
  await expect(check).toBeTruthy();
}

export async function getSlideOuterHtml(testPage: Page) {
  await testPage.waitForSelector(e.currentSlideImg);
  return testPage.page.evaluate(([slideImg]) => document.querySelector(slideImg)?.outerHTML, [e.currentSlideImg]);
}

// sessionToken is per-user, so it differs between moderator and attendee pages.
// Strip it from the slide URL query string so cross-page comparisons match.
function stripSessionToken(html: string | undefined): string | undefined {
  if (!html) return html;
  return html
    .replace(/&amp;sessionToken=[^&"'\s<>]*/g, '')
    .replace(/&sessionToken=[^&"'\s<>]*/g, '')
    .replace(/\?sessionToken=[^&"'\s<>]*&amp;/g, '?')
    .replace(/\?sessionToken=[^&"'\s<>]*&/g, '?')
    .replace(/\?sessionToken=[^&"'\s<>]*/g, '');
}

// Cross-page comparison can race against subscription propagation
// Poll the user page until it matches the (already-stable) moderator slide.
export async function expectSlidesEqualBetweenPages(
  modPage: Page,
  userPage: Page,
  description: string,
  timeout = ELEMENT_WAIT_LONGER_TIME,
) {
  const modSlide = stripSessionToken(await getSlideOuterHtml(modPage));
  await expect
    .poll(async () => stripSessionToken(await getSlideOuterHtml(userPage)), { message: description, timeout })
    .toBe(modSlide);
}

export async function getCurrentPresentationHeight(locator: Locator) {
  return locator.evaluate((element) => window.getComputedStyle(element).getPropertyValue('height'));
}

// Returns the content of the current slide image: the server-generated SVG referenced
// by the tl-image background, fetched through the authenticated browser context.
export async function getCurrentSlideSvg(testPage: Page): Promise<string> {
  await testPage.waitForSelector(e.currentSlideImg);
  const slideUrl = await testPage.page.evaluate(
    ([selector]) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.style?.backgroundImage?.split('"')[1] ?? null;
    },
    [e.currentSlideImg],
  );
  expect(slideUrl, 'should resolve the current slide image URL from the whiteboard').toBeTruthy();

  const response = await testPage.page.request.get(slideUrl as string);
  expect(response.ok(), `should fetch the current slide image (HTTP ${response.status()})`).toBeTruthy();
  return response.text();
}

// Rasterizes the current slide image onto an off-screen canvas and returns the fraction
// of near-black pixels. Used to detect slides that converted to a blank image, e.g.
// when an embedded figure is silently dropped during conversion (issue #23953).
export async function getCurrentSlideDarkPixelRatio(testPage: Page): Promise<number> {
  // Rasterize the SVG in-page via a same-origin blob URL so the canvas is not tainted.
  const svg = await getCurrentSlideSvg(testPage);

  return testPage.page.evaluate(async (svgText) => {
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('failed to load slide image'));
        img.src = url;
      });
      const width = 400;
      const height = Math.max(1, Math.round((width * (img.height || 595)) / (img.width || 842)));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('failed to get canvas 2d context');
      // Composite over white so transparent regions read as white, matching the client.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const { data } = ctx.getImageData(0, 0, width, height);
      let dark = 0;
      const total = width * height;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] + data[i + 1] + data[i + 2] < 150) dark += 1;
      }
      return dark / total;
    } finally {
      URL.revokeObjectURL(url);
    }
  }, svg);
}

// The rendered slide image (a tldraw shape) keeps the aspect ratio of the source page,
// independent of the current zoom. Reading it lets a test assert that bbb-web sized the
// slide from the SVG's real dimensions instead of silently falling back to the 1440x1080
// (4:3) default. Returns null while the slide image has not laid out yet.
export async function getCurrentSlideAspectRatio(testPage: Page): Promise<number | null> {
  await testPage.waitForSelector(e.currentSlideImg);
  return testPage.page.evaluate(
    ([slideImg]) => {
      const node = document.querySelector(slideImg) as HTMLElement | null;
      if (!node) return null;
      const style = window.getComputedStyle(node);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      if (!width || !height) return null;
      return width / height;
    },
    [e.currentSlideImg],
  );
}

export async function getCurrentPresentationToastLocator(testPage: Page) {
  return testPage.page.locator(e.smallToastMsg).filter({ hasText: e.defaultCurrentPresentationLabel });
}

export async function hasCurrentPresentationToastElement(
  testPage: Page,
  { description, timeout = ELEMENT_WAIT_TIME }: { description?: string; timeout?: number } = {},
) {
  const toastLocator = await getCurrentPresentationToastLocator(testPage);
  await expect(
    toastLocator,
    description ?? 'should display the current presentation element after uploading the presentation',
  ).toBeVisible({ timeout });
}

// The presentation manager lists the presentations from a subscription that can start when it opens: while a
// presentation is shown or minimized, wait until the list has it.
async function waitForPresentationList(testPage: Page) {
  const hasPresentation =
    (await testPage.checkElement(e.currentSlideImg)) || (await testPage.checkElement(e.restorePresentation));
  if (!hasPresentation) return;
  await expect(
    testPage.page.locator(e.presentationThumbnails).first(),
    'should list the current presentation in the presentation manager',
  ).toBeVisible();
}

export async function uploadSinglePresentation(
  testPage: Page,
  fileName: string,
  uploadTimeout = UPLOAD_PDF_WAIT_TIME,
  thumbnailIndex = 1,
) {
  const firstSlideSrc = await testPage.page.evaluate(
    ([selector]) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.style?.backgroundImage?.split('"')[1] ?? null;
    },
    [e.currentSlideImg],
  );
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the presentation space for uploading a new file, when the manage presentations is opened',
  );
  await waitForPresentationList(testPage);
  const numPresentationsBefore = await testPage.getSelectorCount(e.presentationThumbnails);

  await testPage.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));

  await testPage.hasElement(
    e.presentationUploadProgressToast,
    'should display the toast presentation upload progress after confirming the presentation to be uploaded',
  );
  // wait for the upload to finish
  await testPage.waitUntilHaveCountSelector(e.presentationThumbnails, numPresentationsBefore + 1, uploadTimeout);

  // select and share the uploaded presentation
  const newPDFThumbnail = await testPage.getLocatorByIndex(e.presentationThumbnails, thumbnailIndex);
  await newPDFThumbnail.click();
  await testPage.waitAndClick(e.sharePresentationButton);
  await testPage.press('Escape'); // close the media sharing menu
  // ensures current slide differs from previous slide - successful upload
  await testPage.page.waitForFunction(
    ([selector, previousSlideSrc]) => {
      if (typeof selector !== 'string') return false;
      const currentSrc = (document.querySelector(selector) as HTMLElement)?.style?.backgroundImage?.split('"')[1];
      return currentSrc !== previousSlideSrc;
    },
    [e.currentSlideImg, firstSlideSrc],
    {
      timeout: uploadTimeout,
    },
  );
  await hasCurrentPresentationToastElement(testPage, { timeout: uploadTimeout });
}

// bbb-web refuses the file on size (maxFileSizeUpload, 30 MB by default) before the PDF is ever
// parsed, so the payload only has to be big enough, not a valid document. Building it in memory
// keeps a file that large out of the repo.
const OVERSIZED_PRESENTATION_BYTES = 31 * 1000 * 1000;

// The client refuses a file over uploadSizeMax on its own: raising it lets the file reach bbb-web
export const REACH_BBB_WEB_SIZE_CHECK_OVERRIDE: ClientSettingsOverrides = {
  public: { presentation: { mirroredFromBBBCore: { uploadSizeMax: 2 * OVERSIZED_PRESENTATION_BYTES } } },
};

function buildOversizedPdf(sizeInBytes: number): Buffer {
  const header = Buffer.from(
    '%PDF-1.4\n' +
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n',
  );
  const trailer = Buffer.from('\ntrailer<</Root 1 0 R/Size 4>>\n%%EOF\n');
  const padding = Buffer.alloc(sizeInBytes - header.length - trailer.length, 0x25); // '%' - a PDF comment
  return Buffer.concat([header, padding, trailer]);
}

// Sibling of uploadSinglePresentation for the rejected path: that one asserts a successful
// upload (new thumbnail and slide change), which never happens for a rejected file.
export async function uploadOversizedPresentation(testPage: Page, fileName: string) {
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the presentation space for uploading a new file, when the manage presentations is opened',
  );
  await waitForPresentationList(testPage);

  await testPage.page.setInputFiles(e.presentationFileUpload, {
    name: fileName,
    mimeType: 'application/pdf',
    buffer: buildOversizedPdf(OVERSIZED_PRESENTATION_BYTES),
  });

  await testPage.hasText(
    e.presentationUploadProgressToast,
    e.presentationTooLargeLabel,
    'should display the size rejection on the presentation upload toast',
    UPLOAD_PDF_WAIT_TIME,
  );
  await testPage.press('Escape'); // close the media sharing menu
  await testPage.waitForSelectorDetached(e.presentationFileUpload);
}

export interface GeneratedFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

// A fixture as a drop payload, so it can share a drop with a generated file
export function fixtureFile(fileName: string): GeneratedFile {
  return {
    name: fileName,
    mimeType: 'application/pdf',
    buffer: readFileSync(path.join(__dirname, `../core/media/${fileName}`)),
  };
}

// The smallest fixture: a spec can set uploadSizeMax to exactly this size
export const MASK_SAMPLE_PDF_BYTES = fixtureFile(e.maskSamplePdf).buffer.length;

// The first half of a real PDF, as an interrupted download leaves it: no trailer and no
// cross-reference table, so the page count cannot be read.
export function buildTruncatedPdf(): GeneratedFile {
  const pdf = readFileSync(path.join(__dirname, '../core/media/sample.pdf'));
  return { name: 'truncated.pdf', mimeType: 'application/pdf', buffer: pdf.subarray(0, Math.floor(pdf.length / 2)) };
}

// A Windows executable named like a PDF: the extension is allowed, the content type is not.
export function buildExecutableNamedPdf(): GeneratedFile {
  return {
    name: 'program.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.concat([Buffer.from('MZ'), Buffer.alloc(510, 0x90)]),
  };
}

// A valid PDF of blank pages, a few dozen bytes each.
export function buildPdfWithPages(pageCount: number): GeneratedFile {
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    `<</Type/Pages/Kids[${Array.from({ length: pageCount }, (_, i) => `${i + 3} 0 R`).join(' ')}]/Count ${pageCount}>>`,
    ...Array.from({ length: pageCount }, () => '<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 150]>>'),
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj${body}endobj\n`;
    return offset;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return { name: `${pageCount}Pages.pdf`, mimeType: 'application/pdf', buffer: Buffer.from(pdf) };
}

export function getCurrentSlideSrc(testPage: Page) {
  return testPage.page.evaluate(
    ([selector]) => (document.querySelector(selector) as HTMLElement | null)?.style?.backgroundImage ?? null,
    [e.currentSlideImg],
  );
}

// Sibling of uploadSinglePresentation for a file the server refuses after the upload: the
// upload toast shows the reason on the file's row, and nothing replaces the current presentation.
export async function uploadRefusedPresentation(testPage: Page, file: GeneratedFile, errorText: string) {
  await testPage.hasElement(e.whiteboard, 'should display the current presentation', UPLOAD_PDF_WAIT_TIME);
  await expect
    .poll(() => getCurrentSlideSrc(testPage), { message: 'should show a slide before the upload' })
    .toBeTruthy();
  const slideBefore = await getCurrentSlideSrc(testPage);
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the presentation space for uploading a new file, when the manage presentations is opened',
  );
  await testPage.page.waitForTimeout(500); // wait a bit for the presentations to load
  const presentationsBefore = await testPage.page.locator(e.presentationNames).allInnerTexts();

  await testPage.page.setInputFiles(e.presentationFileUpload, file);

  await expect(
    testPage.page.locator(e.presentationUploadProgressToast).filter({ hasText: file.name }),
    `should show why ${file.name} was refused on the upload toast`,
  ).toContainText(errorText, { timeout: UPLOAD_PDF_WAIT_TIME });
  await testPage.press('Escape'); // close the media sharing menu
  await testPage.waitForSelectorDetached(e.presentationFileUpload);
  expect(await getCurrentSlideSrc(testPage), 'should keep the current presentation on the whiteboard').toBe(
    slideBefore,
  );
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await expect(
    testPage.page.locator(e.presentationNames),
    'should not add the refused file to the presentations',
  ).toHaveText(presentationsBefore);
  await testPage.press('Escape');
}

// The whiteboard swaps in a new slide once its image is decoded, so the slide it shows next can be painted at once.
export async function waitForSlideChange(testPage: Page, slideBefore: string | null) {
  await expect
    .poll(() => getCurrentSlideSrc(testPage), {
      message: 'should show the new slide on the whiteboard',
      timeout: ELEMENT_WAIT_LONGER_TIME,
    })
    .not.toBe(slideBefore);
}

// Waits until the current slide image has stopped moving or resizing for half a second.
export async function waitForSlideToSettle(testPage: Page) {
  let box = '';
  await expect
    .poll(
      async () => {
        const previous = box;
        box = JSON.stringify(await testPage.page.locator(e.currentSlideImg).boundingBox());
        return box !== 'null' && box === previous;
      },
      { message: 'should settle the slide on the whiteboard', intervals: [500], timeout: ELEMENT_WAIT_LONGER_TIME },
    )
    .toBe(true);
}

export async function uploadMultiplePresentations(
  testPage: Page,
  fileNames: string[],
  uploadTimeout = ELEMENT_WAIT_EXTRA_LONG_TIME,
) {
  // Capture the initial slide state before uploading
  const firstSlideSrc = await testPage.page.evaluate(
    ([selector]) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.style?.backgroundImage?.split('"')[1] ?? null;
    },
    [e.currentSlideImg],
  );
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the modal for uploading a new presentation after opening the manage presentations',
  );

  await testPage.page.setInputFiles(
    e.presentationFileUpload,
    fileNames.map((fileName) => path.join(__dirname, `../core/media/${fileName}`)),
  );
  await testPage.hasElement(
    e.presentationUploadProgressToast,
    'should display a toast presentation upload progress after confirming the presentation to be uploaded',
  );

  await testPage.hasNElements(
    e.uploadDoneIcon,
    fileNames.length,
    'should display the upload done icon after all presentations are successfully uploaded',
  );
  // wait for the uploads to finish
  await testPage.waitUntilHaveCountSelector(e.presentationThumbnails, fileNames.length + 1, uploadTimeout);
  // select and share a new uploaded presentation
  const newPDFThumbnail = await testPage.getLocatorByIndex(e.presentationThumbnails, 1);
  await newPDFThumbnail.click();
  await testPage.waitAndClick(e.sharePresentationButton);
  await testPage.press('Escape'); // close the media sharing menu
  // ensures current slide differs from previous slide - successful upload
  await testPage.page.waitForFunction(
    ([selector, previousSlideSrc]) => {
      if (typeof selector !== 'string') return false;
      const currentSrc = (document.querySelector(selector) as HTMLElement)?.style?.backgroundImage?.split('"')[1];
      return currentSrc !== previousSlideSrc;
    },
    [e.currentSlideImg, firstSlideSrc],
    {
      timeout: uploadTimeout,
    },
  );

  // Poll row count instead of asserting visibility on transient processing/done icons —
  // the toast auto-dismisses ~2s after completion and the status span briefly renders 0-height.
  const uploadItemsLocator = testPage.page.locator(`${e.processingPresentationItem}, ${e.uploadDoneIcon}`);
  await expect
    .poll(() => uploadItemsLocator.count(), {
      message: 'should display one upload row per file in the upload progress toast after confirming the upload',
      timeout: uploadTimeout,
    })
    .toBeGreaterThanOrEqual(fileNames.length);
  await hasCurrentPresentationToastElement(testPage, { timeout: uploadTimeout });
}

export async function skipSlide(testPage: Page) {
  const selectSlideLocator = testPage.page.locator(e.skipSlide);
  const currentSlideNumber = await selectSlideLocator.getAttribute('data-current-slide');
  await testPage.waitAndClick(e.nextSlide);
  await expect(selectSlideLocator).not.toHaveAttribute('data-current-slide', currentSlideNumber ?? '');
}

export async function hasTextOnCurrentPresentationToast(
  testPage: Page,
  text: string,
  description: string,
  timeout = ELEMENT_WAIT_TIME,
) {
  const toastLocator = await getCurrentPresentationToastLocator(testPage);
  await expect(toastLocator, description).toContainText(text, { timeout });
}

// The request that carries the file of an upload; the upload token is part of its path.
const UPLOAD_REQUEST = '**/bigbluebutton/presentation/*/upload';

// Stops the page's upload requests on their way out and never answers them: the client is left
// waiting, so it neither finishes the upload nor learns that it failed. `url` resolves with the
// address of the first one, for a test to send its own request with that upload token.
export async function holdUploadRequests(testPage: Page): Promise<{ url: Promise<string> }> {
  let seen: (url: string) => void = () => {};
  const url = new Promise<string>((resolve) => {
    seen = resolve;
  });
  await testPage.page.route(UPLOAD_REQUEST, (route) => seen(route.request().url()));
  return { url };
}

// Answers the page's upload requests the way the server does when it refuses one.
export async function refuseUploadRequests(testPage: Page) {
  await testPage.page.route(UPLOAD_REQUEST, (route) =>
    route.fulfill({ status: 403, contentType: 'text/plain', body: 'upload token scope mismatch' }),
  );
}

// What the page gets for an upload request the server has accepted: nothing, as when the answer
// is lost on its way back, or the 504 nginx answers with when bbb-web takes too long to answer.
export type LostUploadAnswer = 'no answer' | 'gateway timeout';

// Delivers the file of the page's upload request to the server and keeps the server's answer from
// the page. The browser does not hand a file's bytes to a route, so the request's other fields
// are read and the file is sent again. `pageRequestEnded` resolves once the page's own request
// has ended: only then has the client learned that its upload went wrong.
export async function loseUploadAnswers(
  testPage: Page,
  file: GeneratedFile,
  answer: LostUploadAnswer,
): Promise<{ pageRequestEnded: Promise<unknown> }> {
  const ofUpload = {
    predicate: (request: Request) => request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/upload'),
    timeout: UPLOAD_PDF_WAIT_TIME,
  };
  const pageRequestEnded =
    answer === 'no answer'
      ? testPage.page.waitForEvent('requestfailed', ofUpload)
      : testPage.page.waitForEvent('requestfinished', ofUpload);
  // A test that fails before it gets to wait for this must not leave a rejection nobody handles
  pageRequestEnded.catch(() => {});
  await testPage.page.route(UPLOAD_REQUEST, async (route) => {
    const request = route.request();
    const fields = Object.fromEntries(
      [...(request.postData() ?? '').matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)\r\n/g)].map((field) => [
        field[1],
        field[2],
      ]),
    );
    const response = await testPage.page.request.post(request.url(), {
      multipart: { fileUpload: file, ...fields },
    });
    expect(response.status(), 'should have the server accept the upload').toBe(200);
    if (answer === 'no answer') {
      await route.abort('failed');
    } else {
      await route.fulfill({
        status: 504,
        contentType: 'text/html',
        body: '<html><h1>504 Gateway Time-out</h1></html>',
      });
    }
  });
  return { pageRequestEnded };
}

export async function stopInterceptingUploadRequests(testPage: Page) {
  await testPage.page.unroute(UPLOAD_REQUEST);
}

// Sends the file to uploadUrl without the fields that name its meeting. The server takes the
// upload token and then refuses the request, which is also how it treats a request whose body
// was cut short.
export async function sendUploadWithoutItsMeeting(testPage: Page, uploadUrl: string, file: GeneratedFile) {
  const response = await testPage.page.request.post(uploadUrl, { multipart: { fileUpload: file } });
  expect(response.status(), 'should have the server refuse the upload request').toBe(403);
}

// Starts sending a file to uploadUrl and then goes silent without closing the connection, as an
// upload over a connection that stalls does. state() says how the connection stands: the server
// giving up on the request is 'closed by the server'. close() ends it from this side.
export type StalledUploadState = 'open' | 'closed by the server' | 'failed' | 'closed';

export function sendStalledUpload(
  uploadUrl: string,
  file: GeneratedFile,
): { state: () => StalledUploadState; close: () => void } {
  const { hostname, port, pathname } = new URL(uploadUrl);
  const boundary = '----stalledUpload';
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="fileUpload"; filename="${file.name}"\r\n` +
      `Content-Type: ${file.mimeType}\r\n\r\n`,
  );
  let state: StalledUploadState = 'open';
  const end = (how: StalledUploadState) => {
    if (state === 'open') state = how;
  };
  const socket = tls.connect({ host: hostname, port: Number(port) || 443, servername: hostname }, () => {
    socket.write(
      `POST ${pathname} HTTP/1.1\r\nHost: ${hostname}\r\n` +
        `Content-Type: multipart/form-data; boundary=${boundary}\r\n` +
        // more than is ever sent, so the server keeps waiting for the rest
        `Content-Length: ${head.length + file.buffer.length + 1024}\r\nConnection: close\r\n\r\n`,
    );
    socket.write(head);
    socket.write(file.buffer.subarray(0, Math.ceil(file.buffer.length / 2)));
  });
  socket.resume(); // the answer is not needed, but unread data would keep the connection from closing
  socket.on('error', () => {
    end('failed');
    socket.destroy();
  });
  socket.on('close', () => end('closed by the server'));
  return {
    state: () => state,
    close: () => {
      end('closed');
      socket.destroy();
    },
  };
}

// Holds the page's request for an upload token on its way to the server, as a connection that
// drops for a moment does, until release() sends it on. removalRequested() says whether the page
// has since asked the server to remove a presentation. Call it before the page joins the meeting.
export type HeldUploadTokenRequest = { release: () => void; removalRequested: () => boolean };

export async function holdUploadTokenRequest(page: PlaywrightPage): Promise<HeldUploadTokenRequest> {
  let sendHeldRequest: (() => void) | null = null;
  let released = false;
  let removalRequested = false;
  await page.routeWebSocket(/\/graphql/, (ws) => {
    const server = ws.connectToServer();
    ws.onMessage((message) => {
      const text = typeof message === 'string' ? message : '';
      if (!released && text.includes('presentationRequestUploadToken')) {
        sendHeldRequest = () => server.send(message);
        return;
      }
      if (text.includes('presentationRemove')) removalRequested = true;
      server.send(message);
    });
  });
  return {
    release: () => {
      released = true;
      sendHeldRequest?.();
      sendHeldRequest = null;
    },
    removalRequested: () => removalRequested,
  };
}

// Opens the presentation manager, lists the presentations in it and closes it again.
export async function listPresentations(testPage: Page): Promise<string[]> {
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(e.presentationFileUpload, 'should display the presentation manager');
  await waitForPresentationList(testPage);
  const names = await testPage.page.locator(e.presentationNames).allInnerTexts();
  await testPage.press('Escape');
  await testPage.waitForSelectorDetached(e.presentationFileUpload);
  return names;
}

// Chooses a file in the presentation manager, which starts its upload, and closes the manager.
export async function startUpload(testPage: Page, file: GeneratedFile) {
  await testPage.waitAndClick(e.mediaAreaButton);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(e.presentationFileUpload, 'should display the presentation manager');
  await waitForPresentationList(testPage);
  await testPage.page.setInputFiles(e.presentationFileUpload, file);
  await testPage.press('Escape');
  await testPage.waitForSelectorDetached(e.presentationFileUpload);
}

// The upload toast of a file, whatever state it shows.
export function uploadToastOf(testPage: Page, fileName: string): Locator {
  return testPage.page.locator(e.presentationUploadProgressToast).filter({ hasText: fileName });
}
