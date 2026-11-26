import React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';
import { describe, expect, it } from 'vitest';
import LayoutShellStyles from './styles';

describe('LayoutShellStyles', () => {
  it('holds the layout rules for #layout and its regions', () => {
    const sheet = new ServerStyleSheet();
    try {
      renderToString(sheet.collectStyles(<LayoutShellStyles />));
      const css = sheet.getStyleTags();
      expect(css).toContain('#layout');
      expect(css).toContain('[data-layout-region="camera-dock"]');
      expect(css).toContain('--bbb-media-width');
      // the stored dock size is a share of the dock's area along its axis
      expect(css).toContain('var(--bbb-camera-dock-fraction) * var(--bbb-media-height)');
      expect(css).toContain('var(--bbb-camera-dock-fraction) * var(--bbb-media-width)');
      expect(css).toContain('var(--bbb-camera-dock-fraction) * (100% - var(--bbb-banners))');
    } finally {
      sheet.seal();
    }
  });

  it("holds a presenter's side dock 440 px and the 1% sidebar margin short of the media width", () => {
    // the whiteboard toolbar (430 px) and a 10 px gap stay free, less the margin the stored width drops
    const sheet = new ServerStyleSheet();
    try {
      renderToString(sheet.collectStyles(<LayoutShellStyles />));
      expect(sheet.getStyleTags()).toMatch(
        /#layout\[data-presenter\]\s*\{\s*--bbb-dock-max-w:\s*calc\(var\(--bbb-media-width\) - 440px - 1vw\);/,
      );
    } finally {
      sheet.seal();
    }
  });
});
