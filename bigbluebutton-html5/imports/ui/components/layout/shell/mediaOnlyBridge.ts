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
