import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import type { MediaOnlyFit } from './selectors';

export interface MediaOnlyFitInputs {
  /** the media area's measured size (window less the bars and a 10 px margin) */
  areaWidth: number;
  areaHeight: number;
  /** the content's own size: the screen share's while one is on, else the current slide's */
  contentWidth: number;
  contentHeight: number;
  isMobile: boolean;
  /** an external video or plugin content shows instead: the engine gave it no content size */
  hasExternalVideoOrPluginContent: boolean;
}

/**
 * How mediaOnly fits the content next to the cameras (mediaOnlyLayout.jsx calculatesMediaBounds): when
 * the content, scaled to the area's height, is narrower than the area (desktop only), the cameras go on
 * its left; otherwise on top. Without a content size (none yet, or video/plugin content) the cameras take
 * a fixed 20% on top.
 */
export const computeMediaOnlyFit = (s: MediaOnlyFitInputs): MediaOnlyFit => {
  if (s.hasExternalVideoOrPluginContent || s.contentWidth === 0 || s.contentHeight === 0) return 'none';
  if (s.areaHeight <= 0) return 'width';
  const widthAtAreaHeight = (s.contentWidth * s.areaHeight) / s.contentHeight;
  return widthAtAreaHeight < s.areaWidth && !s.isMobile ? 'height' : 'width';
};

type ContentInputs = Omit<MediaOnlyFitInputs, 'areaWidth' | 'areaHeight'>;

/**
 * Measures the mediaOnly area (an invisible box the CSS layout sizes) and publishes its size on #layout
 * as --bbb-media-only-width / --bbb-media-only-height, for the formulas that cross axes (a width from
 * the area's height and the content's aspect ratio). Returns the ref for that box and the fit, which
 * changes only when the content flips from one side to the other.
 */
export const useMediaOnlyFit = (content: ContentInputs) => {
  const [fit, setFit] = useState<MediaOnlyFit>('none');
  const area = useRef({ width: 0, height: 0 });
  const contentRef = useRef(content);
  const observer = useRef<ResizeObserver | null>(null);
  contentRef.current = content;

  const update = useCallback(() => {
    setFit(computeMediaOnlyFit({
      ...contentRef.current,
      areaWidth: area.current.width,
      areaHeight: area.current.height,
    }));
  }, []);

  const areaRef = useCallback((element: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!element) return;
    const layout = element.closest<HTMLElement>('#layout');
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      area.current = { width, height };
      layout?.style.setProperty('--bbb-media-only-width', `${width}px`);
      layout?.style.setProperty('--bbb-media-only-height', `${height}px`);
      update();
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    observer.current = new ResizeObserver(measure);
    observer.current.observe(element);
  }, [update]);

  useEffect(update, [
    content.contentWidth, content.contentHeight, content.isMobile, content.hasExternalVideoOrPluginContent,
  ]);
  useEffect(() => () => observer.current?.disconnect(), []);

  return { fit, areaRef };
};
