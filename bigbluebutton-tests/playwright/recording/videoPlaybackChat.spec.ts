import { expect, Page } from '@playwright/test';
import { join } from 'path';

import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';

// The video format player is served from the repository files, with a video.xml built
// here, so the chat rendering is tested without processing a real recording.
const PLAYER_DIR = join(__dirname, '../../../record-and-playback/video/playback/video');
const PLAYBACK_ORIGIN = 'https://video-playback.test';

const BBB_URL = 'https://www.bigbluebutton.org/';
const DOCS_URL = 'https://docs.bigbluebutton.org/';

// Same markup the recorder stores: CommonMark HTML (always wrapped in a block element)
// with the rel attribute added while processing the recording.
const link = (href: string, text = href) => `<a rel="noopener nofollow" href="${href}" target="_blank">${text}</a>`;

interface ChatFixture {
  id: string;
  message: string;
  replyToMessageId?: string;
}

const chatMessages: ChatFixture[] = [
  { id: 'paragraph', message: `<p>see ${link(BBB_URL)} for docs</p>` },
  { id: 'line-break', message: `<p>first line<br />\nsecond line ${link(DOCS_URL)}</p>` },
  { id: 'strong', message: `<p><strong>${link(BBB_URL)}</strong></p>` },
  { id: 'emphasis', message: `<p><em>${link(DOCS_URL)}</em></p>` },
  { id: 'list', message: `<ul>\n<li>${link(BBB_URL)}</li>\n<li>${link(DOCS_URL)}</li>\n</ul>` },
  { id: 'blockquote', message: `<blockquote>\n<p>quoted ${link(BBB_URL)}</p>\n</blockquote>` },
  { id: 'typed-markup', message: `<p>&lt;b&gt;not bold&lt;/b&gt; ${link(BBB_URL)}</p>` },
  { id: 'reply', message: '<p>reply to the docs link</p>', replyToMessageId: 'paragraph' },
  { id: 'javascript-href', message: '<p><strong><a href=" JavaScript:void(0)">script link</a></strong></p>' },
  { id: 'data-href', message: '<p><em><a href="DATA:text/plain,docs">data link</a></em></p>' },
];

const escapeXmlAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '&#10;');

const videoXml = `<?xml version="1.0"?>
<popcorn>
${chatMessages
  .map(
    ({ id, message, replyToMessageId = '' }, index) =>
      `  <chattimeline in="${index + 1}" id="${id}" direction="down" name="Moderator" senderId="w_moderator" ` +
      `chatEmphasizedText="false" senderRole="MODERATOR" message="${escapeXmlAttribute(message)}" ` +
      `replyToMessageId="${replyToMessageId}" lastEditedTimestamp="" target="chat"/>`,
  )
  .join('\n')}
</popcorn>`;

// Minimal version of index.html.erb: same scripts and the elements they rely on.
const indexHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <script src="video-js/video.min.js"></script>
    <script src="js/popcorn-complete.min.js"></script>
    <script src="js/popcorn.chattimeline.js"></script>
    <script src="js/video.js"></script>
  </head>
  <body>
    <video id="video" class="video-js" controls></video>
    <div id="chat-area">
      <input type="checkbox" id="exposechat" checked="checked">
      <div id="chat"></div>
    </div>
  </body>
</html>`;

async function openVideoPlayback(page: Page) {
  await page.route(`${PLAYBACK_ORIGIN}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/') return route.fulfill({ contentType: 'text/html', body: indexHtml });
    if (pathname === '/video.xml') return route.fulfill({ contentType: 'text/xml', body: videoXml });
    return route.fulfill({ path: join(PLAYER_DIR, pathname) });
  });
  await page.goto(`${PLAYBACK_ORIGIN}/`);
  // Messages are rendered hidden and only shown when the video reaches them, so the
  // assertions below check the DOM instead of visibility.
  await expect(page.locator('#chat .chat-message'), 'should render every chat message').toHaveCount(
    chatMessages.length,
  );
}

const chatText = (page: Page, id: string) => page.locator(`[id="${id}"] .chat-text`);

async function expectLinks(page: Page, id: string, hrefs: string[]) {
  const links = chatText(page, id).locator('a');
  await expect(links, `message "${id}" should keep ${hrefs.length} link(s)`).toHaveCount(hrefs.length);
  for (let i = 0; i < hrefs.length; i++) {
    await expect(links.nth(i), `link ${i} of "${id}" should keep its href`).toHaveAttribute('href', hrefs[i]);
    await expect(links.nth(i), `link ${i} of "${id}" should open in a new tab`).toHaveAttribute('target', '_blank');
    await expect(links.nth(i), `link ${i} of "${id}" should not leak the referrer`).toHaveAttribute(
      'rel',
      'nofollow noreferrer',
    );
  }
}

test.describe('Video format playback chat', { tag: '@ci' }, () => {
  test('Keep chat links clickable in the video playback', async ({ page }) => {
    linkIssue(25997);
    await openVideoPlayback(page);

    await expectLinks(page, 'paragraph', [BBB_URL]);
    await expect(chatText(page, 'paragraph')).toHaveText(`see ${BBB_URL} for docs`);

    await expectLinks(page, 'line-break', [DOCS_URL]);
    await expect(chatText(page, 'line-break').locator('br'), 'should keep the line break').toHaveCount(1);
    await expect(chatText(page, 'line-break')).toHaveText(`first line second line ${DOCS_URL}`);

    await expectLinks(page, 'strong', [BBB_URL]);
    await expectLinks(page, 'emphasis', [DOCS_URL]);
    await expectLinks(page, 'list', [BBB_URL, DOCS_URL]);
    await expectLinks(page, 'blockquote', [BBB_URL]);
    await expect(chatText(page, 'blockquote')).toHaveText(`quoted ${BBB_URL}`);

    await expectLinks(page, 'typed-markup', [BBB_URL]);
    await expect(chatText(page, 'typed-markup'), 'typed markup should stay as text').toHaveText(
      `<b>not bold</b> ${BBB_URL}`,
    );
    await expect(chatText(page, 'typed-markup').locator('b'), 'typed markup should not render').toHaveCount(0);

    const replyQuoteLinks = page.locator('[id="reply"] .chat-reply a');
    await expect(replyQuoteLinks, 'reply quote should keep the replied message link').toHaveCount(1);
    await expect(replyQuoteLinks).toHaveAttribute('href', BBB_URL);

    for (const id of ['javascript-href', 'data-href']) {
      const unsafeLink = chatText(page, id).locator('a');
      await expect(unsafeLink, `message "${id}" should keep the link text`).toHaveCount(1);
      await expect(unsafeLink, `message "${id}" should drop the unsafe href`).not.toHaveAttribute('href');
    }
  });
});
