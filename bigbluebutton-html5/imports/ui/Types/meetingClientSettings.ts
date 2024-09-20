export interface MeetingClientSettings {
  public: Public
  private: Private
}

export interface Public {
  app: App
  externalVideoPlayer: ExternalVideoPlayer
  kurento: Kurento
  syncUsersWithConnectionManager: SyncUsersWithConnectionManager
  poll: Poll
  captions: Captions
  timer: Timer
  chat: Chat
  userReaction: UserReaction
  notes: Notes
  layout: Layout
  pads: Pads
  media: Media
  stats: Stats
  presentation: Presentation
  user: User
  whiteboard: Whiteboard
  clientLog: ClientLog
  virtualBackgrounds: VirtualBackgrounds
}
export interface Locales {
  locale: string
  name: string
}
export interface App {
  mobileFontSize: string
  desktopFontSize: string
  audioChatNotification: boolean
  autoJoin: boolean
  listenOnlyMode: boolean
  forceListenOnly: boolean
  skipCheck: boolean
  skipCheckOnJoin: boolean
  enableDynamicAudioDeviceSelection: boolean
  clientTitle: string
  appName: string
  bbbServerVersion: string
  displayBbbServerVersion: boolean
  copyright: string
  html5ClientBuild: string
  helpLink: string
  delayForUnmountOfSharedNote: number
  bbbTabletApp: BbbTabletApp
  lockOnJoin: boolean
  cdn: string
  basename: string
  bbbWebBase: string
  learningDashboardBase: string
  customStyleUrl: string | null
  darkTheme: DarkTheme
  askForFeedbackOnLogout: boolean
  askForConfirmationOnLeave: boolean
  wakeLock: WakeLock
  allowDefaultLogoutUrl: boolean
  dynamicGuestPolicy: boolean
  enableGuestLobbyMessage: boolean
  guestPolicyExtraAllowOptions: boolean
  alwaysShowWaitingRoomUI: boolean
  enableLimitOfViewersInWebcam: boolean
  enableMultipleCameras: boolean
  enableCameraAsContent: boolean
  enableWebcamSelectorButton: boolean
  enableTalkingIndicator: boolean
  enableCameraBrightness: boolean
  mirrorOwnWebcam: boolean
  viewersInWebcam: number
  ipv4FallbackDomain: string
  allowLogout: boolean
  allowFullscreen: boolean
  preloadNextSlides: number
  warnAboutUnsavedContentOnMeetingEnd: boolean
  audioCaptions: AudioCaptions
  mutedAlert: MutedAlert
  remainingTimeThreshold: number
  remainingTimeAlertThresholdArray: number[]
  enableDebugWindow: boolean
  breakouts: Breakouts
  customHeartbeat: boolean
  showAllAvailableLocales: boolean
  showAudioFilters: boolean
  reactionsButton: ReactionsButton
  emojiRain: EmojiRain
  enableNetworkStats: boolean
  enableCopyNetworkStatsButton: boolean
  userSettingsStorage: 'local' | 'session'
  defaultSettings: DefaultSettings
  shortcuts: Shortcuts
  branding: Branding
  connectionTimeout: number
  showHelpButton: boolean
  effectiveConnection: string[]
  fallbackOnEmptyLocaleString: boolean
  disableWebsocketFallback: boolean
  maxMutationPayloadSize: number
  enableApolloDevTools: boolean
}

export interface BbbTabletApp {
  enabled: boolean
  iosAppStoreUrl: string
  iosAppUrlScheme: string
}

export interface DarkTheme {
  enabled: boolean
}

export interface WakeLock {
  enabled: boolean
}

export interface AudioCaptions {
  alwaysVisible: boolean
  enabled: boolean
  mobile: boolean
  provider: string
  language: Language
}

export interface Language {
  available: string[]
  forceLocale: boolean
  defaultSelectLocale: boolean
  locale: string
}

export interface MutedAlert {
  enabled: boolean
  interval: number
  threshold: number
  duration: number
}

export interface Breakouts {
  allowUserChooseRoomByDefault: boolean
  captureWhiteboardByDefault: boolean
  captureSharedNotesByDefault: boolean
  sendInvitationToAssignedModeratorsByDefault: boolean
  breakoutRoomLimit: number
  allowPresentationManagementInBreakouts: boolean
}

export interface RaiseHandActionButton {
  enabled: boolean
  centered: boolean
}

export interface ReactionsButton {
  enabled: boolean
}

export interface EmojiRain {
  enabled: boolean
  intervalEmojis: number
  numberOfEmojis: number
  emojiSize: number
}

export interface Transcription {
  partialUtterances: boolean
  minUtteranceLength: number
}

export interface DefaultSettings {
  application: Application
  audio: Audio
  dataSaving: DataSaving
  transcription: Transcription
}

export interface Application {
  selectedLayout: string
  animations: boolean
  chatAudioAlerts: boolean
  chatPushAlerts: boolean
  userJoinAudioAlerts: boolean
  userJoinPushAlerts: boolean
  userLeaveAudioAlerts: boolean
  userLeavePushAlerts: boolean
  raiseHandAudioAlerts: boolean
  raiseHandPushAlerts: boolean
  guestWaitingAudioAlerts: boolean
  guestWaitingPushAlerts: boolean
  wakeLock: boolean
  paginationEnabled: boolean
  whiteboardToolbarAutoHide: boolean
  pushToTalkEnabled: boolean
  autoCloseReactionsBar: boolean
  darkTheme: boolean
  fallbackLocale: string
  overrideLocale: string | null
}

export interface Audio {
  inputDeviceId: string
  outputDeviceId: string
}

export interface DataSaving {
  viewParticipantsWebcams: boolean
  viewScreenshare: boolean
}

export interface Shortcuts {
  openOptions: OpenOptions
  toggleUserList: ToggleUserList
  toggleMute: ToggleMute
  joinAudio: JoinAudio
  leaveAudio: LeaveAudio
  togglePublicChat: TogglePublicChat
  hidePrivateChat: HidePrivateChat
  closePrivateChat: ClosePrivateChat
  raiseHand: RaiseHand
  openActions: OpenActions
  openDebugWindow: OpenDebugWindow
}

export interface OpenOptions {
  accesskey: string
  descId: string
}

export interface ToggleUserList {
  accesskey: string
  descId: string
}

export interface ToggleMute {
  accesskey: string
  descId: string
}

export interface JoinAudio {
  accesskey: string
  descId: string
}

export interface LeaveAudio {
  accesskey: string
  descId: string
}

export interface TogglePublicChat {
  accesskey: string
  descId: string
}

export interface HidePrivateChat {
  accesskey: string
  descId: string
}

export interface ClosePrivateChat {
  accesskey: string
  descId: string
}

export interface RaiseHand {
  accesskey: string
  descId: string
}

export interface OpenActions {
  accesskey: string
  descId: string
}

export interface OpenDebugWindow {
  accesskey: string
  descId: string
}

export interface Branding {
  displayBrandingArea: boolean
}

export interface ExternalVideoPlayer {
  enabled: boolean
}

export interface Kurento {
  wsUrl: string
  cameraWsOptions: CameraWsOptions
  gUMTimeout: number
  signalCandidates: boolean
  traceLogs: boolean
  cameraTimeouts: CameraTimeouts
  screenshare: Screenshare
  cameraProfiles: CameraProfile[]
  enableScreensharing: boolean
  enableVideo: boolean
  enableVideoMenu: boolean
  enableVideoPin: boolean
  autoShareWebcam: boolean
  skipVideoPreview: boolean
  skipVideoPreviewOnFirstJoin: boolean
  cameraSortingModes: CameraSortingModes
  cameraQualityThresholds: CameraQualityThresholds
  pagination: Pagination
  paginationThresholds: PaginationThresholds
  videoMediaServer?: string
}

export interface CameraWsOptions {
  wsConnectionTimeout: number
  maxRetries: number
  debug: boolean
  heartbeat: Heartbeat
}

export interface Heartbeat {
  interval: number
  delay: number
  reconnectOnFailure: boolean
}

export interface CameraTimeouts {
  baseTimeout: number
  maxTimeout: number
}

export interface Screenshare {
  enableVolumeControl: boolean
  subscriberOffering: boolean
  bitrate: number
  mediaTimeouts: MediaTimeouts
  constraints: Constraints
}

export interface MediaTimeouts {
  maxConnectionAttempts: number
  baseTimeout: number
  baseReconnectionTimeout: number
  maxTimeout: number
  timeoutIncreaseFactor: number
}

export interface Constraints {
  video: Video
  audio: boolean
}

export interface Video {
  frameRate: FrameRate
  width: Width
  height: Height
}

export interface FrameRate {
  ideal: number
  max: number
}

export interface Width {
  max: number
}

export interface Height {
  max: number
}

export interface CameraProfile {
  id: string
  name: string
  bitrate: number
  hidden?: boolean
  default?: boolean
  constraints?: Constraints2
}

export interface Constraints2 {
  width: number
  height: number
  frameRate?: number
}

export interface CameraSortingModes {
  defaultSorting: string
  paginationSorting: string
}

export interface CameraQualityThresholds {
  enabled: boolean
  applyConstraints: boolean
  privilegedStreams: boolean
  debounceTime: number
  thresholds: Threshold[]
}

export interface Threshold {
  threshold: number
  profile: string
}

export interface Pagination {
  paginationToggleEnabled: boolean
  pageChangeDebounceTime: number
  desktopPageSizes: DesktopPageSizes
  mobilePageSizes: MobilePageSizes
  desktopGridSizes: DesktopGridSizes
  mobileGridSizes: MobileGridSizes
}

export interface DesktopPageSizes {
  moderator: number
  viewer: number
}

export interface MobilePageSizes {
  moderator: number
  viewer: number
}

export interface DesktopGridSizes {
  moderator: number
  viewer: number
}

export interface MobileGridSizes {
  moderator: number
  viewer: number
}

export interface PaginationThresholds {
  enabled: boolean
  thresholds: Threshold2[]
}

export interface Threshold2 {
  users: number
  desktopPageSizes: DesktopPageSizes2
}

export interface DesktopPageSizes2 {
  moderator: number
  viewer: number
}

export interface SyncUsersWithConnectionManager {
  enabled: boolean
  syncInterval: number
}

export interface Poll {
  enabled: boolean
  allowCustomResponseInput: boolean
  maxCustom: number
  maxTypedAnswerLength: number
  chatMessage: boolean
}

export interface Captions {
  enabled: boolean
  id: string
  dictation: boolean
  background: string
  font: Font
  lines: number
  time: number
  locales: Locales[]
  defaultPad: string
  showButton: boolean
  lineLimit: number
  captionLimit: number
}

export interface Font {
  color: string
  family: string
  size: string
}

export interface Timer {
  enabled: boolean
  alarm: boolean
  music: Music
  interval: Interval
  time: number
  tabIndicator: boolean
}

export interface Music {
  enabled: boolean
  volume: number
  track1: string
  track2: string
  track3: string
}

export interface Interval {
  clock: number
  offset: number
}

export interface Chat {
  enabled: boolean
  itemsPerPage: number
  timeBetweenFetchs: number
  enableSaveAndCopyPublicChat: boolean
  bufferChatInsertsMs: number
  startClosed: boolean
  min_message_length: number
  max_message_length: number
  grouping_messages_window: number
  type_system: string
  type_public: string
  type_private: string
  system_userid: string
  system_username: string
  public_id: string
  public_group_id: string
  public_userid: string
  public_username: string
  storage_key: string
  system_messages_keys: SystemMessagesKeys
  typingIndicator: TypingIndicator
  moderatorChatEmphasized: boolean
  privateMessageReadFeedback: MessageReadFeedback
  autoConvertEmoji: boolean
  emojiPicker: EmojiPicker
  disableEmojis: string[]
  allowedElements: string[]
}

export interface SystemMessagesKeys {
  chat_clear: string
  chat_poll_result: string
  chat_exported_presentation: string
  chat_status_message: string
}

export interface TypingIndicator {
  enabled: boolean
  showNames: boolean
}

export interface MessageReadFeedback {
  enabled: boolean
}

export interface EmojiPicker {
  enable: boolean
}

export interface UserReaction {
  enabled: boolean
  expire: number
  reactions: Reaction[]
}

export interface Reaction {
  id: string
  native: string
}

export interface Notes {
  enabled: boolean
  id: string
  pinnable: boolean
}

export interface Layout {
  hidePresentationOnJoin: boolean
  showParticipantsOnLogin: boolean
  showPushLayoutButton: boolean
  showPushLayoutToggle: boolean
}

export interface Pads {
  url: string
  cookie: Cookie
}

export interface Cookie {
  path: string
  sameSite: string
  secure: boolean
}

export interface Media {
  audio: Audio2
  stunTurnServersFetchAddress: string
  cacheStunTurnServers: boolean
  fallbackStunServer: string
  forceRelay: boolean
  forceRelayOnFirefox: boolean
  mediaTag: string
  callTransferTimeout: number
  callHangupTimeout: number
  callHangupMaximumRetries: number
  echoTestNumber: string
  listenOnlyCallTimeout: number
  transparentListenOnly: boolean
  fullAudioOffering: boolean
  listenOnlyOffering: boolean
  iceGatheringTimeout: number
  audioConnectionTimeout: number
  audioReconnectionDelay: number
  audioReconnectionAttempts: number
  sipjsHackViaWs: boolean
  sipjsAllowMdns: boolean
  sip_ws_host: string
  toggleMuteThrottleTime: number
  websocketKeepAliveInterval: number
  websocketKeepAliveDebounce: number
  traceSip: boolean
  sdpSemantics: string
  localEchoTest: LocalEchoTest
  muteAudioOutputWhenAway: boolean
}

export interface Audio2 {
  defaultFullAudioBridge: string
  defaultListenOnlyBridge: string
  bridges: Bridge[]
  retryThroughRelay: boolean
}

export interface Bridge {
  name: string
  path: string
}

export interface LocalEchoTest {
  enabled: boolean
  initialHearingState: boolean
  useRtcLoopbackInChromium: boolean
  delay: Delay
}

export interface Delay {
  enabled: boolean
  delayTime: number
  maxDelayTime: number
}

export interface Stats {
  enabled: boolean
  interval: number
  timeout: number
  log: boolean
  notification: Notification
  loss: number[]
  rtt: number[]
  level: string[]
  help: string
}

export interface Notification {
  warning: boolean
  error: boolean
}

export interface Presentation {
  allowDownloadOriginal: boolean
  allowDownloadWithAnnotations: boolean
  allowSnapshotOfCurrentSlide: boolean
  panZoomThrottle: number
  restoreOnUpdate: boolean
  uploadEndpoint: string
  fileUploadConstraintsHint: boolean
  mirroredFromBBBCore: MirroredFromBbbcore
  uploadValidMimeTypes: UploadValidMimeType[]
}

export interface MirroredFromBbbcore {
  uploadSizeMax: number
  uploadPagesMax: number
}

export interface UploadValidMimeType {
  extension: string
  mime: string
}

export interface User {
  role_moderator: string
  role_viewer: string
  label: Label
}

export interface Label {
  moderator: boolean
  mobile: boolean
  guest: boolean
  sharingWebcam: boolean
}

export interface Whiteboard {
  annotationsQueueProcessInterval: number
  cursorInterval: number
  pointerDiameter: number
  maxStickyNoteLength: number
  maxNumberOfAnnotations: number
  annotations: Annotations
  allowInfiniteWhiteboard: boolean
  allowInfiniteWhiteboardInBreakouts: boolean
  styles: Styles
  toolbar: Toolbar
}

export interface Annotations {
  status: Status
}

export interface Status {
  start: string
  update: string
  end: string
}

export interface Styles {
  text: Text
}

export interface Text {
  family: string
}

export interface Toolbar {
  multiUserPenOnly: boolean
  colors: Color[]
  thickness: Thickness[]
  font_sizes: FontSize[]
  tools: Tool[]
  presenterTools: string[]
  multiUserTools: string[]
}

export interface Color {
  label: string
  value: string
}

export interface Thickness {
  value: number
}

export interface FontSize {
  value: number
}

export interface Tool {
  icon: string
  value: string
}

export interface ClientLog {
  console: Console
  external: External
}

export interface Console {
  enabled: boolean
  level: string
}

export interface External {
  enabled: boolean
  level: string
  url: string
  method: string
  throttleInterval: number
  flushOnClose: boolean
  logTag: string
}

export interface VirtualBackgrounds {
  enabled: boolean
  enableVirtualBackgroundUpload: boolean
  storedOnBBB: boolean
  showThumbnails: boolean
  imagesPath: string
  thumbnailsPath: string
  fileNames: string[]
}

export interface Private {
  analytics: Analytics
  app: App2
  minBrowserVersions: MinBrowserVersion[]
  prometheus: Prometheus
}

export interface Analytics {
  includeChat: boolean
}

export interface App2 {
  host: string
  localesUrl: string
  pencilChunkLength: number
  loadSlidesFromHttpAlways: boolean
}

export interface Metrics {
  queueMetrics: boolean
  metricsDumpIntervalMs: number
  metricsFolderPath: string
  removeMeetingOnEnd: boolean
}

export interface Channels {
  toAkkaApps: string
  toThirdParty: string
}

export interface MinBrowserVersion {
  browser: string
  version: number | number[] | string
}

export interface Prometheus {
  enabled: boolean
  path: string
  collectDefaultMetrics: boolean
}

export default MeetingClientSettings;
