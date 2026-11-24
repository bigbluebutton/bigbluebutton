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

interface ResizableEdge {
    bottom: boolean;
    left: boolean;
    right: boolean;
    top: boolean;
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
    browserHeight?: number;
    browserWidth?: number;
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

export interface ExternalVideo {
    browserHeight?: number;
    browserWidth?: number;
    hasExternalVideo?: boolean;
    height: number;
    width: number;
}

export interface GenericContentMainArea {
    genericContentId?: string;
    browserHeight?: number;
    browserWidth?: number;
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
    browserHeight?: number;
    browserWidth?: number;
    contentUpdatedAt?: number;
    currentSlide?: CurrentSlide;
    isOpen?: boolean;
    slidesLength?: number;
    width: number;
    height: number;
}

interface ScreenShare {
    browserHeight?: number;
    browserWidth?: number;
    hasScreenShare?: boolean;
    height: number;
    width: number;
}

export interface SharedNotes {
    browserHeight?: number;
    browserWidth?: number;
    isPinned?: boolean;
    height: number;
    width: number;
}

interface SidebarContent {
    browserWidth?: number;
    currentPanelType?: string;
    isOpen?: boolean;
    resizableEdge: ResizableEdge;
    sidebarContentPanel?: string
    /** the width the user dragged the panel to */
    width: number;
    height: number;
}

interface SidebarContentHorizontalResizer {
    browserWidth: number;
    currentPanelType: string;
    height: number;
    isOpen: boolean;
    width: number;
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
    browserWidth?: number;
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
    autoarrAngeLayout: boolean;
    bannerBar: BannerBar;
    browser: Browser;
    cameraDock: CameraDock
    userMetadata: NonNullable<unknown>;
    externalVideo: ExternalVideo;
    genericMainContent: GenericContentMainArea;
    navBar: NavBar;
    notificationsBar: NotificationsBar;
    presentation: Presentation;
    screenShare: ScreenShare;
    sharedNotes: SharedNotes;
    sidebarContent: SidebarContent;
    sidebarContentHorizontalResizer: SidebarContentHorizontalResizer;
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
    videoRate: number;
}

interface CameraDockPropagationState {
    isCameraDockPropagationSuppressed: boolean;
    cameraIsResizing?: boolean;
    cameraPosition: string;
    presentationVideoRate: number;
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
