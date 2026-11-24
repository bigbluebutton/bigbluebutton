import { createContext, useContext } from 'react';
import type { ShellOutput, ShellState } from './shellState';
import type { MediaBoxCollapse } from './selectors';

/** What #layout carries (layout/shell/useLayoutShell.ts), for the regions that act on it in JS. */
export const LayoutShellContext = createContext<ShellOutput>({ attributes: {}, style: {} });

/**
 * Whether the media box has an area (selectors.ts mediaBoxCollapse). The presentation unmounts and the
 * other media regions hide on 'zero', as they did when the engine gave them no width or height.
 */
export const useMediaBoxCollapse = (): MediaBoxCollapse => (
  useContext(LayoutShellContext).attributes['data-media-box'] ?? 'none'
) as MediaBoxCollapse;

/** The layout state the shell derived #layout from; undefined outside the app (unit tests). */
export const useShellState = (): ShellState | undefined => useContext(LayoutShellContext).state;
