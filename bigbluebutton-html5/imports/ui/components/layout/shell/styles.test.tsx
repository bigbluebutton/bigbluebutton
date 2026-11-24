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
    } finally {
      sheet.seal();
    }
  });
});
