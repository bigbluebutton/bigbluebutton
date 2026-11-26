import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { computeMediaOnlyFit, MediaOnlyFitInputs, useMediaOnlyFit } from './mediaOnlyFit';

// mediaOnlyLayout.jsx calculatesMediaBounds: the content is fit to the area's height when it is then
// narrower than the area (strictly, desktop only), else to its width; no content size, none.

const base: MediaOnlyFitInputs = {
  areaWidth: 1260,
  areaHeight: 550,
  contentWidth: 4,
  contentHeight: 3,
  isMobile: false,
  hasExternalVideoOrPluginContent: false,
};

describe('computeMediaOnlyFit', () => {
  it('fits a 4:3 slide in a wide area to the height', () => {
    expect(computeMediaOnlyFit(base)).toBe('height');
  });

  it('fits to the width when the content is as wide as the area or wider, or on a phone', () => {
    expect(computeMediaOnlyFit({ ...base, contentWidth: 1260, contentHeight: 550 })).toBe('width');
    expect(computeMediaOnlyFit({ ...base, contentWidth: 16, contentHeight: 3 })).toBe('width');
    expect(computeMediaOnlyFit({ ...base, isMobile: true })).toBe('width');
    expect(computeMediaOnlyFit({ ...base, areaHeight: 0 })).toBe('width');
  });

  it('has no fit without a content size, or for video and plugin content', () => {
    expect(computeMediaOnlyFit({ ...base, contentWidth: 0 })).toBe('none');
    expect(computeMediaOnlyFit({ ...base, contentHeight: 0 })).toBe('none');
    expect(computeMediaOnlyFit({ ...base, hasExternalVideoOrPluginContent: true })).toBe('none');
  });
});

const Probe: React.FC<{ content: Omit<MediaOnlyFitInputs, 'areaWidth' | 'areaHeight'> }> = ({ content }) => {
  const { fit, areaRef } = useMediaOnlyFit(content);
  return (
    <div id="layout">
      <div ref={areaRef} data-fit={fit} />
    </div>
  );
};

describe('useMediaOnlyFit', () => {
  it('measures the area onto #layout and follows the content', () => {
    const spy = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = () => ({
      width: 1260, height: 550, x: 0, y: 0, top: 0, left: 0, right: 1260, bottom: 550, toJSON: () => ({}),
    });
    const content = {
      contentWidth: 4, contentHeight: 3, isMobile: false, hasExternalVideoOrPluginContent: false,
    };
    const { container, rerender, unmount } = render(<Probe content={content} />);
    const layout = container.querySelector('#layout') as HTMLElement;
    expect(layout.style.getPropertyValue('--bbb-media-only-width')).toBe('1260px');
    expect(layout.style.getPropertyValue('--bbb-media-only-height')).toBe('550px');
    expect(container.querySelector('[data-fit]')?.getAttribute('data-fit')).toBe('height');
    rerender(<Probe content={{ ...content, contentWidth: 16 }} />);
    expect(container.querySelector('[data-fit]')?.getAttribute('data-fit')).toBe('width');
    unmount();
    HTMLElement.prototype.getBoundingClientRect = spy;
  });
});
