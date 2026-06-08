import { test } from '../core/setup/fixtures';
import { GridTileCount, MAX_GRID_SIZE } from './gridTileCount';

// Regression test for issue 25073 (backport of PR 25103):
// "Unified Layout: tile count plus aggregated users does not match total participant count".
//
// Precondition: the server under test must set a small grid size, e.g.
//   public.kurento.pagination.desktopGridSizes: { moderator: 4, viewer: 4 }
// so the overflow path can be exercised with a practical number of webcams.
// (The issue's own reproduction likewise required a custom pagination config.)
// When the configured grid size is larger than MAX_GRID_SIZE the test is skipped.
test.describe('Grid layout participant tile count', () => {
  test('tile count plus aggregated overflow equals total participants', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const gridTileCount = new GridTileCount(browser, context);
    await gridTileCount.initModPage(page, { testInfo });

    const gridSize = await gridTileCount.getConfiguredGridSize();
    test.skip(
      !Number.isFinite(gridSize) || gridSize < 1 || gridSize > MAX_GRID_SIZE,
      `requires public.kurento.pagination.desktopGridSizes <= ${MAX_GRID_SIZE} ` +
        `to exercise the overflow path with a practical number of webcams (configured: ${gridSize})`,
    );

    // The test joins gridSize + 1 webcam users sequentially, so the timeout has to
    // scale with the grid size (the default would be too short for large grids).
    test.setTimeout((gridSize + 2) * 25_000 + 60_000);

    await gridTileCount.checkTileCountMatchesParticipants(gridSize);
  });
});
