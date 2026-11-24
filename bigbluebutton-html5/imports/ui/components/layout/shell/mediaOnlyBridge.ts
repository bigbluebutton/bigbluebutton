import { layoutSelect, layoutSelectOutput } from '../context';
import { LAYOUT_TYPE } from '../enums';
import { Layout, Output } from '../layoutTypes';

type MediaRegion = 'presentation' | 'screenShare' | 'externalVideo' | 'genericMainContent' | 'sharedNotes';

/**
 * TEMPORARY, until the mediaOnly layout is in CSS: the engine's box for a media region while mediaOnly is
 * on (its fit to the content's aspect ratio is not in CSS yet), undefined otherwise.
 */
const useMediaOnlyBridge = (region: MediaRegion): React.CSSProperties | undefined => {
  const layoutType = layoutSelect((i: Layout) => i.layoutType);
  const box = layoutSelectOutput((i: Output) => i[region]) as {
    top?: number; left?: number; right?: number; width?: number; height?: number;
  };
  if (layoutType !== LAYOUT_TYPE.MEDIA_ONLY || !box) return undefined;
  return {
    top: box.top, left: box.left, right: box.right, width: box.width, height: box.height,
  };
};

export default useMediaOnlyBridge;

/**
 * TEMPORARY, until camerasOnly and mediaOnly are in CSS: the engine's camera dock in those layouts (its
 * box and the position it reports), undefined in the others.
 */
export const useSpecialLayoutDockBridge = (): { style: React.CSSProperties; position?: string } | undefined => {
  const layoutType = layoutSelect((i: Layout) => i.layoutType);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const dock = layoutSelectOutput((i: Output) => i.cameraDock);
  if (layoutType !== LAYOUT_TYPE.MEDIA_ONLY && layoutType !== LAYOUT_TYPE.CAMERAS_ONLY) return undefined;
  // the engine placed the dock with a translate(left - right, top) from its static position
  const x = (dock.left ?? 0) - (dock.right ?? 0);
  return {
    position: dock.position,
    style: {
      top: dock.top,
      left: isRTL ? 'auto' : x,
      right: isRTL ? -x : 'auto',
      width: dock.width,
      height: dock.height,
      zIndex: dock.zIndex,
    },
  };
};
