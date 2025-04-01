interface ActionBar {
    hasActionBar?: boolean;
    height: number;
    width?: number;
    display?: boolean;
    innerHeight?: number;
    left?: number;
    padding?: number;
    tabOrder?: number;
    top?: number;
    zIndex?: number
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
    numCameras?: number;
    position: string;
    width: number;
    height: number;
    display?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    resizableEdge?: ResizableEdge;
    tabOrder?: number;
    presenterMaxWidth: number;
    maxWidth: number;
    maxHeight: number;
    minHeight: number;
    minWidth: number;
    left: number;
    top: number;
    right: number;
    zIndex: number;
}

export interface ExternalVideo {
    browserHeight?: number;
    browserWidth?: number;
    hasExternalVideo?: boolean;
    height: number;
    width: number;
    display?: boolean;
    left?: number;
    tabOrder?: number;
    top?: number;
    zIndex?: number;
    right?: number;
}

export interface GenericContentMainArea {
    genericContentId?: string;
    browserHeight?: number;
    browserWidth?: number;
    height: number;
    width: number;
    display?: boolean;
    left?: number;
    tabOrder?: number;
    top?: number;
    zIndex?: number;
    right?: number;
}
interface NavBar {
    hasNavBar?: boolean;
    hideTopRow: boolean;
    height: number;
    display?: boolean;
    left?: number;
    tabOrder?: number;
    top?: number;
    width?: number;
    zIndex?: number;
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
    num: number;
    size: Size;
}

interface Presentation {
    browserHeight?: number;
    browserWidth?: number;
    currentSlide?: CurrentSlide;
    isOpen?: boolean;
    slidesLength?: number;
    width: number;
    height: number;
    display?: boolean;
    isResizable?: boolean;
    left?: number;
    presentationOrientation?: string;
    resizableEdge?: ResizableEdge;
    tabOrder?: number;
    top?: number;
    zIndex?: number;
}

interface ScreenShare {
    browserHeight?: number;
    browserWidth?: number;
    hasScreenShare?: boolean;
    height: number;
    width: number;
    display?: boolean;
    left?: number;
    top?: number;
    zIndex?: number;
}

interface SharedNotes {
    browserHeight?: number;
    browserWidth?: number;
    isPinned?: boolean;
    height: number;
    width: number;
    display?: boolean;
    left?: number;
    tabOrder?: number;
    top?: number;
    zIndex?: number;
}

interface SidebarContent {
    browserWidth?: number;
    currentPanelType?: string;
    isOpen?: boolean;
    resizableEdge: ResizableEdge; //---
    sidebarContentPanel?: string
    width: number; //---
    height: number; //---
    display?: boolean;
    isResizable?: boolean;
    left?: number;
    maxWidth?: number;
    minWidth?: number;
    tabOrder?: number;
    top?: number;
    zIndex?: number;
}

interface SidebarContentHorizontalResizer {
    browserWidth: number;
    currentPanelType: string;
    height: number;
    isOpen: boolean;
    width: number;
}

interface SidebarNavigation {
    browserWidth?: number;
    isOpen?: boolean;
    sidebarNavPanel?: string;
    width: number;
    height: number;
    display?: boolean;
    isResizable?: boolean;
    left?: number;
    maxHeight?: number;
    maxWidth?: number;
    minHeight?: number;
    minWidth?: number;
    resizableEdge?: ResizableEdge;
    tabOrder?: number;
    top?: number;
    zIndex?: number;
}

interface Fullscreen {
    element: string;
    group: string;
}

interface Captions {
    left: number;
    maxWidth: number;
    right?: boolean;
}

interface ContentPosition {
    height: number;
    left: number;
    top: number;
    width: number;
}

interface DropzoneAreas {
    ContentBottom: {
        height: number;
        left: number;
        top: number;
        width: number;
    }
    contentBottom: ContentPosition;
    contentLeft: ContentPosition;
    contentRight: ContentPosition;
    contentTop: ContentPosition;
    sidebarContentBottom: ContentPosition;
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
    sidebarNavigation: SidebarNavigation;
}

interface Output {
    actionBar: ActionBar;
    cameraDock: CameraDock;
    captions: Captions;
    dropZoneAreas: DropzoneAreas;
    externalVideo: ExternalVideo;
    genericMainContent: GenericContentMainArea;
    mediaArea: Size;
    navBar: NavBar;
    presentation: Presentation;
    screenShare: ScreenShare;
    sharedNotes: SharedNotes;
    sidebarContent: SidebarContent;
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
    output: Output;
}

interface ActionForDispatcher {
  type: string;
  value: object;
}

type DispatcherFunction = (action: ActionForDispatcher) => void;

export {
  Input,
  Layout,
  Output,
  DispatcherFunction,
};
