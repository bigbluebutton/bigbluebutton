import * as ReactDOM from 'react-dom/client';

interface ActionBar {
    hasActionBar?: boolean;
    height: number;
}

interface PresentationAreaContentActions {
    type: string,
    value: {
        content: string,
        open: boolean,
        genericContentId?: string;
    },
}

interface BannerBar {
    hasBanner: boolean;
}

interface Browser {
    width: number;
    height: number;
}

interface CameraOptimalGridSize {
    width: number;
    height: number;
}

interface CameraDock {
    cameraOptimalGridSize?: CameraOptimalGridSize;
    focusedId: string;
    isDragging?: boolean;
    isResizing?: boolean;
    isLocalChange?: boolean;
    numCameras?: number;
    position: string;
    /** the dock size the user is dragging to (input), used while resizing */
    width: number;
    height: number;
}

interface ExternalVideo {
    hasExternalVideo?: boolean;
    height: number;
    width: number;
}

interface GenericContentMainArea {
    genericContentId?: string;
    height: number;
    width: number;
}

interface NavBar {
    hasNavBar?: boolean;
    hideTopRow?: boolean;
    height: number;
}

interface NotificationsBar {
    hasNotification: boolean;
    hideNotificationToasts: boolean;
}

interface Size {
    height: number;
    width: number;
}

interface CurrentSlide {
    size: Size;
}

interface Presentation {
    contentUpdatedAt?: number;
    currentSlide?: CurrentSlide;
    isOpen?: boolean;
    slidesLength?: number;
    width: number;
    height: number;
}

interface ScreenShare {
    hasScreenShare?: boolean;
    height: number;
    width: number;
}

interface SharedNotes {
    isPinned?: boolean;
    height: number;
    width: number;
}

interface SidebarContent {
    isOpen?: boolean;
    sidebarContentPanel?: string
    /** the width the user dragged the panel to */
    width: number;
    height: number;
}

interface Widget {
    name: string;
    icon: string;
    dataTest?: string;
    uuid?: string;
    pluginName?: string;
    hasNotification: boolean;
}

export interface NativeWidget extends Widget {}

export interface InjectedWidget extends Widget {
    contentFunction: (element: HTMLElement) => ReactDOM.Root;
}

export interface InjectedAppGalleryItem extends Widget {
    onClick: () => void;
}

export interface registeredApps {
    [key: string]: NativeWidget | InjectedWidget | InjectedAppGalleryItem;
}

export interface SidebarNavigation {
    isOpen?: boolean;
    width: number;
    height: number;
    registeredApps?: registeredApps;
    pinnedApps?: string[];
}

interface Fullscreen {
    element: string;
    group: string;
}

interface Input {
    actionBar: ActionBar;
    bannerBar: BannerBar;
    browser: Browser;
    cameraDock: CameraDock
    externalVideo: ExternalVideo;
    genericMainContent: GenericContentMainArea;
    navBar: NavBar;
    notificationsBar: NotificationsBar;
    presentation: Presentation;
    screenShare: ScreenShare;
    sharedNotes: SharedNotes;
    sidebarContent: SidebarContent;
    sidebarContentAuxiliary: SidebarContent;
    sidebarNavigation: SidebarNavigation;
}

interface Layout {
    presentationAreaContentActions: PresentationAreaContentActions[];
    deviceType: string;
    fontSize: number;
    fullscreen: Fullscreen;
    idChatOpen: string;
    input: Input;
    isRTL: boolean;
    layoutType: string;
}

interface MeetingCameraDock {
    position?: string;
    /** a fraction (0-1) of the dock's area along its axis; 0 = not set */
    size: number;
}

interface CameraDockPropagationState {
    isCameraDockPropagationSuppressed: boolean;
    cameraPosition: string;
    cameraDockSize: number;
}

interface ActionForDispatcher {
  type: string;
  value: object | boolean | string;
}

type DispatcherFunction = (action: ActionForDispatcher) => void;

export {
  CameraDockPropagationState,
  Input,
  Layout,
  MeetingCameraDock,
  DispatcherFunction,
};
