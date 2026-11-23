import { describe, expect, it } from 'vitest';
import { snapCameraDockDimensionToGrid } from './component';

// Characterization: after a top/bottom dock resize stops, the dock height snaps DOWN to the
// camera grid only when it is more than 12 px larger than the grid; otherwise it is left as is.
describe('snapCameraDockDimensionToGrid', () => {
  const MIN = 120;
  const MAX = 495;

  it('keeps the size when there is no grid size', () => {
    expect(snapCameraDockDimensionToGrid(300, undefined, MIN, MAX)).toBe(300);
    expect(snapCameraDockDimensionToGrid(300, 0, MIN, MAX)).toBe(300);
  });

  it('keeps the size when it exceeds the grid by 12 px or less', () => {
    expect(snapCameraDockDimensionToGrid(212, 200, MIN, MAX)).toBe(212);
    expect(snapCameraDockDimensionToGrid(200, 200, MIN, MAX)).toBe(200);
  });

  it('keeps the size when it is smaller than the grid', () => {
    expect(snapCameraDockDimensionToGrid(150, 200, MIN, MAX)).toBe(150);
  });

  it('snaps down to the grid when it exceeds it by more than 12 px', () => {
    expect(snapCameraDockDimensionToGrid(213, 200, MIN, MAX)).toBe(200);
    expect(snapCameraDockDimensionToGrid(480, 240, MIN, MAX)).toBe(240);
  });

  it('clamps the snapped size to [min, max]', () => {
    expect(snapCameraDockDimensionToGrid(300, 80, MIN, MAX)).toBe(MIN);
    expect(snapCameraDockDimensionToGrid(900, 600, MIN, MAX)).toBe(MAX);
  });
});
