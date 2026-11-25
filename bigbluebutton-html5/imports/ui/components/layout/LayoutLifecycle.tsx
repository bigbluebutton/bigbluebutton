import { useEffect, useRef } from 'react';
import { layoutDispatch, layoutSelect, layoutSelectInput } from './context';
import {
  ACTIONS, DEVICE_TYPE, LAYOUT_TYPE, PANELS,
} from './enums';
import { Input, Layout } from './layoutTypes';
import { getWaitLayout } from './utils';
import { reconcileLayoutInput } from './reconcile';
import { renderedLayoutType } from './shell/selectors';
import Session from '/imports/ui/services/storage/in-memory';
import getFromUserSettings from '/imports/ui/services/users-settings';

const LAYOUTS_WITHOUT_SIDEBARS: string[] = [LAYOUT_TYPE.CAMERAS_ONLY, LAYOUT_TYPE.PRESENTATION_ONLY];

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
 * - keeps the sidebars closed in camerasOnly and presentationOnly.
 * The dock size the user chose is stored by the dock itself when a resize ends (layout/dockSize.ts).
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

  return null;
};

export default LayoutLifecycle;
