import { useMemo } from 'react';
import { layoutSelect, layoutSelectInput } from '../context';
import { Input, Layout } from '../layoutTypes';
import { getWaitLayout, isPhoneLandscape } from '../utils';
import { useIsPresentationEnabled } from '/imports/ui/services/features';
import { useStorageKey, STORAGES } from '/imports/ui/services/storage/hooks';
import { DOCK_SIZE_STORAGE_KEY, readStoredDockSize } from '../dockSize';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { shellState, ShellOutput } from './shellState';
import { useMediaOnlyFit } from './mediaOnlyFit';
import { DEVICE_TYPE, LAYOUT_TYPE } from '../enums';

/**
 * The data attributes and custom properties for #layout, from the layout state. Each field is selected on
 * its own, so #layout re-renders only on a semantic change, never on a window resize.
 */
const useLayoutShell = (): ShellOutput & { mediaOnlyAreaRef: (element: HTMLDivElement | null) => void } => {
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
  const { data: currentUser } = useCurrentUser((u) => ({ presenter: u.presenter }));
  const isPresenter = !!currentUser?.presenter;
  // the size the user stored on release, as fractions of the dock's area (layout/dockSize.ts)
  const storedDockSize = readStoredDockSize(useStorageKey(DOCK_SIZE_STORAGE_KEY, STORAGES.SESSION));
  // bbb_hide_controls hides the nav bar's top row (observer.tsx)
  const hideTopRow = layoutSelectInput((i: Input) => !!i.navBar.hideTopRow);
  const layoutPending = !!getWaitLayout() && layoutLoading;
  // mediaOnly fits the content's own size: the screen share's while one is on, else the slide's
  const slideWidth = layoutSelectInput((i: Input) => i.presentation.currentSlide?.size?.width ?? 0);
  const slideHeight = layoutSelectInput((i: Input) => i.presentation.currentSlide?.size?.height ?? 0);
  const screenShareWidth = layoutSelectInput((i: Input) => i.screenShare.width ?? 0);
  const screenShareHeight = layoutSelectInput((i: Input) => i.screenShare.height ?? 0);
  const contentWidth = hasScreenShare ? screenShareWidth : slideWidth;
  const contentHeight = hasScreenShare ? screenShareHeight : slideHeight;
  const { fit: mediaOnlyFit, areaRef: mediaOnlyAreaRef } = useMediaOnlyFit({
    contentWidth,
    contentHeight,
    isMobile: deviceType === DEVICE_TYPE.MOBILE,
    hasExternalVideoOrPluginContent: hasExternalVideo || !!genericContentId,
  });
  const isMediaOnly = layoutType === LAYOUT_TYPE.MEDIA_ONLY;

  const output = useMemo(() => shellState({
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
    storedDockWidth: storedDockSize.width,
    storedDockHeight: storedDockSize.height,
    cameraGridWidth,
    cameraGridHeight,
    isPresenter,
    mediaOnlyFit: isMediaOnly ? mediaOnlyFit : 'none',
    mediaOnlyContentRatio: isMediaOnly && contentWidth > 0 && contentHeight > 0
      ? contentWidth / contentHeight : 0,
  }), [
    layoutType, layoutPending, deviceType, isRTL, hasBanner, hasNotification, hasNavBar, hideTopRow,
    hasActionBar, sidebarNavigationIsOpen, sidebarContentIsOpen, sidebarContentWidth,
    sidebarContentAuxiliaryIsOpen, sidebarContentAuxiliaryWidth, numCameras, presentationIsOpen,
    presentationEnabled, slidesLength, hasScreenShare, hasExternalVideo, genericContentId, notesPinned,
    dockPosition, phoneLandscape, fullscreenElement, fullscreenGroup, isDragging, isResizing,
    dockInputWidth, dockInputHeight, storedDockSize.width, storedDockSize.height, cameraGridWidth,
    cameraGridHeight, isPresenter, isMediaOnly, mediaOnlyFit, contentWidth, contentHeight,
  ]);

  return useMemo(() => ({ ...output, mediaOnlyAreaRef }), [output, mediaOnlyAreaRef]);
};

export default useLayoutShell;
