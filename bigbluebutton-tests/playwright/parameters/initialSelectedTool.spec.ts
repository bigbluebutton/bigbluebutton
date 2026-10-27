import { expect, type Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';
import { dragAcrossWhiteboard, getTldrawEditor } from '../whiteboard/util';

const tools = ['select', 'hand', 'draw', 'eraser', 'arrow', 'text', 'note', 'line', 'frame', 'highlight'];
const shapes = [
  'rectangle',
  'ellipse',
  'diamond',
  'triangle',
  'trapezoid',
  'rhombus',
  'hexagon',
  'cloud',
  'star',
  'oval',
  'x-box',
  'check-box',
  'arrow-left',
  'arrow-up',
  'arrow-down',
  'arrow-right',
];
const invalidTools = [
  'more',
  'actions',
  'delete-selected-items',
  'unknown-tool',
  '',
  'false',
  'null',
  '42',
  '[]',
  '{}',
];

const joinParameter = (tool: string) =>
  new URLSearchParams({
    'userdata-bbb_initial_selected_tool': tool,
    'userdata-bbb_auto_join_audio': 'false',
  }).toString();

async function expectTool(page: PlaywrightPage, tool: string) {
  await expect(page.locator('.tl-canvas')).toBeVisible();
  const editor = await getTldrawEditor(page);
  try {
    await expect
      .poll(() =>
        editor.evaluate((value) => ({
          tool: value.getCurrentToolId(),
          geo: value.getInstanceState().stylesForNextShape['tldraw:geo'],
        })),
      )
      .toMatchObject(shapes.includes(tool) ? { tool: 'geo', geo: tool } : { tool });
  } finally {
    await editor.dispose();
  }
  await expect(page.getByText("Something's gone wrong.", { exact: true })).toBeHidden();
}

async function expectDrawnShape(testPage: Page, geo: string) {
  await dragAcrossWhiteboard(testPage, 0.3, 0.6);
  const editor = await getTldrawEditor(testPage.page);
  try {
    await expect
      .poll(() =>
        editor.evaluate((value) =>
          value
            .getCurrentPageShapes()
            .filter((shape) => shape.type === 'geo')
            .map((shape) => shape.props.geo),
        ),
      )
      .toContain(geo);
  } finally {
    await editor.dispose();
  }
}

// Keep representative cases in CI; run the remaining variants with @nightly or the full file.
test.describe.parallel('Initial selected whiteboard tool', () => {
  for (const tool of [...tools, ...shapes]) {
    test(
      `selects ${tool}`,
      { tag: ['draw', 'rectangle'].includes(tool) ? '@ci' : '@nightly' },
      async ({ browser, page }, testInfo) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        const presenter = new Page(browser, page, testInfo);
        await presenter.init(true, { shouldCloseAudioModal: false, joinParameter: joinParameter(tool) });
        await expectTool(page, tool);
        if (shapes.includes(tool)) await expectDrawnShape(presenter, tool);
        expect(errors).toEqual([]);
      },
    );
  }

  for (const tool of invalidTools) {
    test(
      `falls back to draw for ${JSON.stringify(tool)}`,
      { tag: ['more', 'null'].includes(tool) ? '@ci' : '@nightly' },
      async ({ browser, page }, testInfo) => {
        const presenter = new Page(browser, page, testInfo);
        await presenter.init(true, { shouldCloseAudioModal: false, joinParameter: joinParameter(tool) });
        await expectTool(page, 'draw');
      },
    );
  }

  test('uses a configured shape as the default', { tag: '@nightly' }, async ({ browser, page }, testInfo) => {
    const presenter = new Page(browser, page, testInfo);
    await presenter.init(true, {
      shouldCloseAudioModal: false,
      joinParameter: joinParameter('more'),
      clientSettingsOverrides: { public: { whiteboard: { toolbar: { initialSelectedTool: 'ellipse' } } } },
    });
    await expectTool(page, 'ellipse');
    await expectDrawnShape(presenter, 'ellipse');
  });

  test(
    'uses draw if the configured default is also invalid',
    { tag: '@nightly' },
    async ({ browser, page }, testInfo) => {
      const presenter = new Page(browser, page, testInfo);
      await presenter.init(true, {
        shouldCloseAudioModal: false,
        joinParameter: joinParameter('unknown-tool'),
        clientSettingsOverrides: { public: { whiteboard: { toolbar: { initialSelectedTool: 'actions' } } } },
      });
      await expectTool(page, 'draw');
    },
  );

  test(
    'restores a saved shape on reload before the initial tool',
    { tag: '@ci' },
    async ({ browser, page }, testInfo) => {
      const presenter = new Page(browser, page, testInfo);
      await presenter.init(true, { shouldCloseAudioModal: false, joinParameter: joinParameter('rectangle') });
      await expectTool(page, 'rectangle');
      await page.getByTestId('tools.ellipse').click();
      await expectTool(page, 'ellipse');
      await expect
        .poll(() =>
          page.evaluate(
            () => JSON.parse(sessionStorage.getItem('BBB_whiteboardToolbarSavedState') || '{}').selectedTool,
          ),
        )
        .toBe('ellipse');
      await page.reload();
      await expectTool(page, 'ellipse');
      await expectDrawnShape(presenter, 'ellipse');
    },
  );

  for (const savedTool of ['more', 'rectangle']) {
    test(
      `ignores an invalid or unavailable saved tool (${savedTool})`,
      { tag: '@nightly' },
      async ({ browser, page }, testInfo) => {
        await page.addInitScript((selectedTool) => {
          sessionStorage.setItem('BBB_whiteboardToolbarSavedState', JSON.stringify({ selectedTool }));
        }, savedTool);
        const presenter = new Page(browser, page, testInfo);
        await presenter.init(true, {
          shouldCloseAudioModal: false,
          joinParameter: `${joinParameter('unknown-tool')}&userdata-bbb_presenter_tools=%5B%22ellipse%22%5D`,
        });
        await expectTool(page, 'ellipse');
        await expectDrawnShape(presenter, 'ellipse');
      },
    );
  }

  for (const [allowedTools, expected] of [
    [['arrow'], 'arrow'],
    [['ellipse', 'more'], 'ellipse'],
    [['actions', 'delete-selected-items'], 'noop'],
    [[], 'rectangle'],
  ] as const) {
    test(
      `respects presenter tools ${JSON.stringify(allowedTools)}`,
      { tag: expected === 'arrow' ? '@ci' : '@nightly' },
      async ({ browser, page }, testInfo) => {
        const presenter = new Page(browser, page, testInfo);
        await presenter.init(true, {
          shouldCloseAudioModal: false,
          joinParameter: `${joinParameter('rectangle')}&userdata-bbb_presenter_tools=${encodeURIComponent(JSON.stringify(allowedTools))}`,
        });
        await expectTool(page, expected);
      },
    );
  }

  for (const [tool, extra, expected] of [
    ['rectangle', '', 'rectangle'],
    ['unknown-tool', '', 'draw'],
    ['rectangle', '&userdata-bbb_multi_user_tools=%5B%22ellipse%22%5D', 'ellipse'],
    ['rectangle', '&userdata-bbb_multi_user_pen_only=true', 'draw'],
  ]) {
    test(
      `selects ${expected} when a viewer gets access (${tool}${extra})`,
      { tag: tool === 'rectangle' && extra === '' ? '@ci' : '@nightly' },
      async ({ browser, context, page }, testInfo) => {
        const users = new MultiUsers(browser, context);
        await users.initModPage(page, { shouldCloseAudioModal: false, joinParameter: joinParameter('draw'), testInfo });
        await users.initUserPage(context, {
          shouldCloseAudioModal: false,
          joinParameter: joinParameter(tool) + extra,
          testInfo,
        });
        await expectTool(users.userPage.page, 'noop');
        await users.modPage.waitAndClick(e.multiUsersWhiteboardOn);
        await expectTool(users.userPage.page, expected);
        if (tool === 'rectangle' && extra === '') {
          await users.userPage.page.reload();
          await expectTool(users.userPage.page, 'rectangle');
        }
        if (shapes.includes(expected)) await expectDrawnShape(users.userPage, expected);
        await users.modPage.waitAndClick(e.multiUsersWhiteboardOff);
        await expectTool(users.userPage.page, 'noop');
      },
    );
  }
});
