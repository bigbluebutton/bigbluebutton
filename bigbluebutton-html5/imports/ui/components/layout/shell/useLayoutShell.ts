import { useMemo } from 'react';
import { layoutSelect, layoutSelectInput } from '../context';
import { Input, Layout } from '../layoutTypes';
import { getWaitLayout, isPhoneLandscape } from '../utils';
import { useIsPresentationEnabled } from '/imports/ui/services/features';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { useStorageKey, STORAGES } from '/imports/ui/services/storage/hooks';
import { shellState, ShellOutput } from './shellState';

interface StoredDockSize {
  width?: number;
  height?: number;
}

/**
 * The data attributes and custom properties for #layout, from the layout state. Each field is selected on
 * its own, so #layout re-renders only on a semantic change, never on a window resize.
 */
const useLayoutShell = (): ShellOutput => {
  const layoutType = layoutSelect((i: Layout) => i.layoutType);
  // not in the Layout type: set by SET_LAYOUT_LOADING while the user's enforced layout loads
  const layoutLoading = layoutSelect((i: Layout & { layoutLoading?: boolean }) => !!i.layoutLoading);
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const fullscreenElement = layoutSelect((i: Layout) => i.fullscreen.element);
  const fullscreenGroup = layoutSelect((i: Layout) => i.fullscreen.group);
  const hasBanner = layoutSelectInput((i: Input) => i.bannerBar.hasBanner);
  const hasNotification = layoutSelectInput((i: Input) => i.notificationsBar.hasNotification);
  const hasNavBar = layoutSelectInput((i: Input) => i.navBar.hasNavBar);
  const hasActionBar = layoutSelectInput((i: Input) => i.actionBar.hasActionBar);
  const sidebarNavigationIsOpen = layoutSelectInput((i: Input) => i.sidebarNavigation.isOpen);
  const sidebarContentIsOpen = layoutSelectInput((i: Input) => i.sidebarContent.isOpen);
  const sidebarContentWidth = layoutSelectInput((i: Input) => i.sidebarContent.width);
  const sidebarContentAuxiliaryIsOpen = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary.isOpen);
  const sidebarContentAuxiliaryWidth = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary.width);
  const numCameras = layoutSelectInput((i: Input) => i.cameraDock.numCameras);
  const dockPosition = layoutSelectInput((i: Input) => i.cameraDock.position);
  const isDragging = layoutSelectInput((i: Input) => i.cameraDock.isDragging);
  const isResizing = layoutSelectInput((i: Input) => i.cameraDock.isResizing);
  const dockInputWidth = layoutSelectInput((i: Input) => i.cameraDock.width);
  const dockInputHeight = layoutSelectInput((i: Input) => i.cameraDock.height);
  const cameraGridWidth = layoutSelectInput((i: Input) => i.cameraDock.cameraOptimalGridSize?.width ?? 0);
  const cameraGridHeight = layoutSelectInput((i: Input) => i.cameraDock.cameraOptimalGridSize?.height ?? 0);
  const presentationIsOpen = layoutSelectInput((i: Input) => i.presentation.isOpen);
  const slidesLength = layoutSelectInput((i: Input) => i.presentation.slidesLength);
  const hasScreenShare = layoutSelectInput((i: Input) => i.screenShare.hasScreenShare);
  const hasExternalVideo = layoutSelectInput((i: Input) => i.externalVideo?.hasExternalVideo ?? false);
  const genericContentId = layoutSelectInput((i: Input) => i.genericMainContent.genericContentId);
  const notesPinned = layoutSelectInput((i: Input) => i.sharedNotes.isPinned);
  const phoneLandscape = layoutSelectInput((i: Input) => isPhoneLandscape(i.browser));
  const presentationEnabled = useIsPresentationEnabled();
  const storedDockSize = (useStorageKey('webcamSize', STORAGES.SESSION) ?? {}) as StoredDockSize;
  // bbb_hide_controls hides the nav bar's top row (observer.tsx), from userdata that does not change
  const hideTopRow = !!getFromUserSettings('bbb_hide_controls', false);
  const layoutPending = !!getWaitLayout() && layoutLoading;

  return useMemo(() => shellState({
    layoutType,
    layoutPending,
    deviceType,
    isRTL: !!isRTL,
    hasBanner,
    hasNotification,
    hasNavBar,
    hideTopRow,
    hasActionBar,
    sidebarNavigationIsOpen,
    sidebarContentIsOpen,
    sidebarContentWidth,
    sidebarContentAuxiliaryIsOpen,
    sidebarContentAuxiliaryWidth,
    numCameras,
    presentationIsOpen,
    presentationEnabled,
    slidesLength,
    hasScreenShare,
    hasExternalVideo,
    genericContentId: genericContentId || '',
    notesPinned: !!notesPinned,
    dockPosition,
    isPhoneLandscape: phoneLandscape,
    fullscreenElement,
    fullscreenGroup,
    isDragging,
    isResizing,
    dockInputWidth,
    dockInputHeight,
    storedDockWidth: storedDockSize.width ?? 0,
    storedDockHeight: storedDockSize.height ?? 0,
    cameraGridWidth,
    cameraGridHeight,
  }), [
    layoutType, layoutPending, deviceType, isRTL, hasBanner, hasNotification, hasNavBar, hideTopRow,
    hasActionBar, sidebarNavigationIsOpen, sidebarContentIsOpen, sidebarContentWidth,
    sidebarContentAuxiliaryIsOpen, sidebarContentAuxiliaryWidth, numCameras, presentationIsOpen,
    presentationEnabled, slidesLength, hasScreenShare, hasExternalVideo, genericContentId, notesPinned,
    dockPosition, phoneLandscape, fullscreenElement, fullscreenGroup, isDragging, isResizing,
    dockInputWidth, dockInputHeight, storedDockSize.width, storedDockSize.height, cameraGridWidth,
    cameraGridHeight,
  ]);
};

export default useLayoutShell;
