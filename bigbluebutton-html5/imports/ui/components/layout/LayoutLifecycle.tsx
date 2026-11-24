import { useEffect, useRef } from 'react';
import { layoutDispatch, layoutSelect, layoutSelectInput } from './context';
import {
  ACTIONS, CAMERADOCK_POSITION, DEVICE_TYPE, LAYOUT_TYPE, PANELS,
} from './enums';
import { Input, Layout } from './layoutTypes';
import { getWaitLayout } from './utils';
import { reconcileLayoutInput } from './reconcile';
import { useShellState } from './shell/context';
import {
  cameraDockState, effectiveCameraDockPosition, isUnifiedLayout, renderedLayoutType,
} from './shell/selectors';
import { SIDEBAR_CONTENT_MARGIN_TO_MEDIA_PERCENTAGE_WIDTH } from './defaultValues';
import { usePreviousValue } from '/imports/ui/hooks/usePreviousValue';
import Session from '/imports/ui/services/storage/in-memory';
import Storage from '/imports/ui/services/storage/session';
import getFromUserSettings from '/imports/ui/services/users-settings';

const LAYOUTS_WITHOUT_SIDEBARS: string[] = [LAYOUT_TYPE.CAMERAS_ONLY, LAYOUT_TYPE.PRESENTATION_ONLY];

interface StoredDockSize { width: number; height: number }

/** the value before its last change (the engine's usePrevious, updated only when the value changes) */
const usePreviousDistinct = <T, >(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

/**
 * The layout engine's jobs besides geometry:
 * - reconciles the layout input (reconcile.ts) when a layout is first rendered, a switch included, and
 *   when the device type changes, then marks the layout ready (Session layoutReady);
 * - marks the layout state as set up once (Session hasLayoutEngineLoadedOnce), from its first render;
 * - waits while an enforced layout loads (waitLayout);
 * - keeps the sidebars closed in camerasOnly and presentationOnly;
 * - stores the dock size when a resize stops (sessionStorage webcamSize): the dragged height for a top,
 *   bottom or sidebar dock, the dragged width less 1% of the window for a side dock.
 */
const LayoutLifecycle = () => {
  const dispatch = layoutDispatch();
  const layoutType = layoutSelect((i: Layout) => i.layoutType);
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const layoutLoading = layoutSelect((i: Layout & { layoutLoading?: boolean }) => !!i.layoutLoading);
  const navigationOpen = layoutSelectInput((i: Input) => i.sidebarNavigation.isOpen);
  const contentOpen = layoutSelectInput((i: Input) => i.sidebarContent.isOpen);
  const contentPanel = layoutSelectInput((i: Input) => i.sidebarContent.sidebarContentPanel);
  const auxiliaryOpen = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary.isOpen);
  const auxiliaryPanel = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary.sidebarContentPanel);
  const shell = useShellState();
  const pending = !!getWaitLayout() && layoutLoading;
  const rendered = renderedLayoutType(layoutType);
  // the layout before the last change of type, as the engine passed it to the layouts
  const previousLayoutType = usePreviousDistinct(layoutType);
  const reconciledFor = useRef<string | null>(null);

  useEffect(() => {
    if (pending) {
      // the layout renders again once the enforced layout is known
      reconciledFor.current = null;
      return;
    }
    if (deviceType === null) return;
    const key = `${rendered}|${deviceType}`;
    if (reconciledFor.current === key) return;
    reconciledFor.current = key;
    const ctx = {
      layoutType: rendered,
      previousLayoutType,
      isMobile: deviceType === DEVICE_TYPE.MOBILE,
      hasLoadedOnce: !!Session.getItem('hasLayoutEngineLoadedOnce'),
      hideSidebarNavigation: !!getFromUserSettings('bbb_hide_sidebar_navigation', false),
    };
    dispatch({
      type: ACTIONS.SET_LAYOUT_INPUT,
      value: (prev: Input) => reconcileLayoutInput(prev, ctx),
    });
    Session.setItem('layoutReady', true);
  }, [pending, rendered, deviceType]);

  // after the first reconciliation: the engine's own mount ran after its layout's
  useEffect(() => {
    if (!Session.getItem('hasLayoutEngineLoadedOnce')) Session.setItem('hasLayoutEngineLoadedOnce', true);
  }, []);

  useEffect(() => {
    if (pending || deviceType === null || !LAYOUTS_WITHOUT_SIDEBARS.includes(rendered)) return;
    dispatch({ type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN, value: false });
    dispatch({ type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN, value: false });
    dispatch({ type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL, value: PANELS.NONE });
  }, [pending, deviceType, rendered, navigationOpen, contentOpen, contentPanel, auxiliaryOpen, auxiliaryPanel]);

  const isResizing = !!shell?.isResizing;
  const wasResizing = usePreviousValue(isResizing);
  useEffect(() => {
    if (!shell || !wasResizing || isResizing) return;
    if (!isUnifiedLayout(shell) || cameraDockState(shell) !== 'positioned') return;
    const position = effectiveCameraDockPosition(shell);
    const alongHeight = position === CAMERADOCK_POSITION.CONTENT_TOP
      || position === CAMERADOCK_POSITION.CONTENT_BOTTOM
      || position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM;
    const last = (Storage.getItem('webcamSize') || { width: 0, height: 0 }) as StoredDockSize;
    const margin = window.document.documentElement.clientWidth * SIDEBAR_CONTENT_MARGIN_TO_MEDIA_PERCENTAGE_WIDTH;
    Storage.setItem('webcamSize', {
      width: alongHeight ? last.width : shell.dockInputWidth - margin,
      height: alongHeight ? shell.dockInputHeight : last.height,
    });
  }, [isResizing]);

  return null;
};

export default LayoutLifecycle;
