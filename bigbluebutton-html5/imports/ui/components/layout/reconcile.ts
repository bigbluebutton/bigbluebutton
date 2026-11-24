import { defaultsDeep } from '/imports/utils/array-utils';
import DEFAULT_VALUES from './defaultValues';
import { INITIAL_INPUT_STATE } from './initState';
import { CAMERADOCK_POSITION, LAYOUT_TYPE, PANELS } from './enums';
import type { Input } from './layoutTypes';

export interface ReconcileContext {
  /** the layout now rendered (unknown types render as unified) */
  layoutType: string;
  /** the layout rendered before a switch; undefined on a device type change or the first load */
  previousLayoutType?: string;
  isMobile: boolean;
  /** the layout state has been set up before (Session hasLayoutEngineLoadedOnce) */
  hasLoadedOnce: boolean;
  /** userdata bbb_hide_sidebar_navigation */
  hideSidebarNavigation: boolean;
}

type AnyRecord = Record<string, unknown>;

const LAYOUTS_THAT_CLOSE_THE_SIDEBARS = [
  LAYOUT_TYPE.CAMERAS_ONLY,
  LAYOUT_TYPE.PRESENTATION_ONLY,
  LAYOUT_TYPE.MEDIA_ONLY,
];

/** what every unified and mediaOnly merge keeps of the media in the area */
const keptMedia = (prev: Input) => ({
  presentation: {
    isOpen: prev.presentation.isOpen,
    slidesLength: prev.presentation.slidesLength,
    currentSlide: { ...prev.presentation.currentSlide },
  },
  externalVideo: { hasExternalVideo: prev.externalVideo.hasExternalVideo },
  genericMainContent: { genericContentId: prev.genericMainContent.genericContentId },
  screenShare: {
    hasScreenShare: prev.screenShare.hasScreenShare,
    width: prev.screenShare.width,
    height: prev.screenShare.height,
  },
  sharedNotes: { isPinned: prev.sharedNotes.isPinned },
});

const unifiedOverrides = (prev: Input, ctx: ReconcileContext): AnyRecord => {
  const { sidebarNavigation, sidebarContent, cameraDock } = prev;
  const { sidebarContentPanel } = sidebarContent;
  let navigationOpen: boolean;
  let panelOpen: boolean;
  let panel = sidebarContentPanel;
  const extra: AnyRecord = {};
  if (ctx.isMobile) {
    // a phone opens the panels only without bbb_hide_sidebar_navigation, and keeps the apps
    panelOpen = !ctx.hideSidebarNavigation && sidebarContentPanel !== PANELS.NONE;
    navigationOpen = !ctx.hideSidebarNavigation
      && (sidebarNavigation.isOpen || sidebarContentPanel !== PANELS.NONE || false);
    extra.registeredApps = sidebarNavigation.registeredApps;
    extra.pinnedApps = sidebarNavigation.pinnedApps;
  } else {
    panelOpen = sidebarContentPanel !== PANELS.NONE;
    navigationOpen = sidebarNavigation.isOpen || sidebarContentPanel !== PANELS.NONE || false;
    // back from a layout that closed the sidebars: the navigation and the chat open again
    if (ctx.previousLayoutType && LAYOUTS_THAT_CLOSE_THE_SIDEBARS.includes(ctx.previousLayoutType)) {
      navigationOpen = true;
      panelOpen = true;
      panel = PANELS.CHAT;
    }
  }
  return {
    sidebarNavigation: { isOpen: navigationOpen, ...extra },
    sidebarContent: { isOpen: panelOpen, sidebarContentPanel: panel },
    sidebarContentAuxiliary: { isOpen: false, sidebarContentPanel: PANELS.NONE },
    cameraDock: {
      position: cameraDock.position || DEFAULT_VALUES.cameraPosition,
      numCameras: cameraDock.numCameras,
    },
    ...keptMedia(prev),
  };
};

const camerasOnlyOverrides = (prev: Input): AnyRecord => ({
  sidebarNavigation: { isOpen: false, width: 0, height: 0 },
  sidebarContent: { isOpen: false, width: 0, height: 0 },
  presentation: { isOpen: false },
  cameraDock: { numCameras: prev.cameraDock.numCameras },
  externalVideo: { hasExternalVideo: false },
  genericMainContent: { genericContentId: undefined },
  screenShare: { hasScreenShare: false },
});

const presentationOnlyOverrides = (prev: Input): AnyRecord => ({
  sidebarNavigation: { isOpen: false, width: 0, height: 0 },
  sidebarContent: { isOpen: false, width: 0, height: 0 },
  presentation: {
    isOpen: true,
    slidesLength: prev.presentation.slidesLength,
    currentSlide: { ...prev.presentation.currentSlide },
  },
  cameraDock: { numCameras: prev.cameraDock.numCameras },
  externalVideo: { hasExternalVideo: prev.externalVideo.hasExternalVideo },
  genericMainContent: { genericContentId: prev.genericMainContent.genericContentId },
  screenShare: {
    hasScreenShare: prev.screenShare.hasScreenShare,
    width: prev.screenShare.width,
    height: prev.screenShare.height,
  },
});

const participantsAndChatOnlyOverrides = (prev: Input): AnyRecord => {
  const { sidebarContentPanel } = prev.sidebarContent;
  return {
    sidebarNavigation: { isOpen: true },
    sidebarContent: {
      isOpen: true,
      sidebarContentPanel: sidebarContentPanel === PANELS.NONE ? PANELS.CHAT : sidebarContentPanel,
    },
    presentation: {
      isOpen: false,
      slidesLength: prev.presentation.slidesLength,
      currentSlide: { ...prev.presentation.currentSlide },
      width: 0,
      height: 0,
    },
    cameraDock: {
      position: CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM,
      numCameras: prev.cameraDock.numCameras,
    },
    externalVideo: { hasExternalVideo: false, width: 0, height: 0 },
    genericMainContent: { genericContentId: undefined, width: 0, height: 0 },
    screenShare: { hasScreenShare: false, width: 0, height: 0 },
  };
};

const mediaOnlyOverrides = (prev: Input): AnyRecord => ({
  sidebarNavigation: { isOpen: false },
  sidebarContent: { isOpen: false, sidebarContentPanel: PANELS.NONE },
  cameraDock: {
    position: prev.cameraDock.position || CAMERADOCK_POSITION.CONTENT_LEFT,
    numCameras: prev.cameraDock.numCameras,
  },
  ...keptMedia(prev),
});

const overridesFor = (prev: Input, ctx: ReconcileContext): AnyRecord => {
  switch (ctx.layoutType) {
    case LAYOUT_TYPE.CAMERAS_ONLY: return camerasOnlyOverrides(prev);
    case LAYOUT_TYPE.PRESENTATION_ONLY: return presentationOnlyOverrides(prev);
    case LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY: return participantsAndChatOnlyOverrides(prev);
    case LAYOUT_TYPE.MEDIA_ONLY: return mediaOnlyOverrides(prev);
    default: return unifiedOverrides(prev, ctx);
  }
};

/**
 * The layout input once a layout is set up: when it is first rendered (a switch included) and when the
 * device type changes. Each layout keeps or resets parts of the previous input (the managers' init()
 * in the former layout managers, characterized in __fixtures__/reconcile); on the first load the rest comes from
 * the initial input.
 */
export const reconcileLayoutInput = (prev: Input, ctx: ReconcileContext): Input => defaultsDeep(
  overridesFor(prev, ctx),
  (ctx.hasLoadedOnce ? prev : INITIAL_INPUT_STATE) as unknown as AnyRecord,
) as unknown as Input;

export default reconcileLayoutInput;
