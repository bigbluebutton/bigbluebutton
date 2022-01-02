// Common
exports.actions = 'button[aria-label="Actions"]';
exports.options = 'button[aria-label="Options"]';
exports.screenshareConnecting = 'div[data-test="screenshareConnecting"]';
exports.screenShareVideo = 'video[id="screenshareVideo"]';
exports.isSharingScreen = 'div[data-test="isSharingScreen"]';
exports.raiseHandLabel = 'button[data-test="raiseHandLabel"]';
exports.lowerHandLabel = 'button[data-test="lowerHandLabel"]';
exports.logout = 'li[data-test="logout"]';
exports.meetingEndedModal = 'div[data-test="meetingEndedModal"]';
exports.rating = 'div[data-test="rating"]';
exports.pollMenuButton = 'div[data-test="pollMenuButton"]';
exports.unauthorized = 'h1[data-test="unauthorized"]';
exports.videoMenu = 'button[aria-label="Open video menu dropdown"]';
exports.settings = 'li[data-test="settings"]';
exports.settingsModal = 'div[aria-label="Settings"]';
exports.title = '._imports_ui_components_nav_bar__styles__presentationTitle';
exports.alerts = '.toastify-content';
exports.pdfFileName = '100PagesFile.pdf';
// Accesskey
exports.chatButtonKey = '[accesskey="P"]';
exports.userListButton = '[accesskey="U"]';

// Audio
exports.audioModal = 'div[aria-label="Join audio modal"]';
exports.audioModalHeader = '[data-test="audioModalHeader"]';
exports.closeAudioButton = 'button[aria-label="Close Join audio modal"]';
exports.microphoneButton = 'button[aria-label="Microphone"]';
exports.listenOnlyButton = 'button[aria-label="Listen only"]';
exports.echoYesButton = 'button[aria-label="Echo is audible"]';
exports.echoNoButton = 'button[aria-label="Echo is inaudible"]';
exports.isTalking = '[data-test="isTalking"]';
exports.wasTalking = '[data-test="wasTalking"]';
exports.joinAudio = 'button[data-test="joinAudio"]';
exports.leaveAudio = 'button[data-test="leaveAudio"]';
exports.connectingStatus = 'div[class^="connecting--"]';
exports.connecting = 'span[data-test="connecting"]';
exports.connectingToEchoTest = 'span[data-test="connectingToEchoTest"]';
exports.muteMicrophoneBtn = 'button[aria-label="Mute"]';
exports.talkingIndicator = 'div[class^="isTalkingWrapper--"] > div[class^="speaking--"]';

// Breakout
exports.createBreakoutRooms = 'li[data-test="createBreakoutRooms"]';
exports.inviteBreakoutRooms = 'li[data-test="inviteBreakoutRooms"]';
exports.randomlyAssign = '[data-test="randomlyAssign"]';
exports.breakoutRemainingTime = '[data-test="breakoutRemainingTime"]';
exports.breakoutRoomsItem = '[data-test="breakoutRoomsItem"]';
exports.alreadyConnected = 'span[class^="alreadyConnected--"]';
exports.breakoutJoin = '[data-test="breakoutJoin"]';
exports.userJoined = 'div[aria-label^="Moderator3"]';
exports.breakoutRoomsButton = 'div[aria-label="Breakout Rooms"]';
exports.askJoinRoom1 = 'button[aria-label="Ask to join Room 1"]';
exports.joinRoom1 = 'button[aria-label="Join room Room 1"]';
exports.allowChoiceRoom = 'input[id="freeJoinCheckbox"]';
exports.labelGeneratingURL = 'span[data-test="labelGeneratingURL"]';
exports.endBreakoutRoomsButton = 'button[data-test="endBreakoutRoomsButton"]';

// Chat
exports.chatButton = 'div[data-test="chatButton"]';
exports.chatTitle = 'div[data-test="chatTitle"]';
exports.chatBox = '#message-input';
exports.sendButton = 'button[data-test="sendMessageButton"]';
exports.chatMessages = 'div[data-test="chatMessages"]';
exports.chatOptions = 'button[data-test="chatOptionsMenu"]';
exports.chatClear = 'li[data-test="chatClear"]';
exports.chatCopy = 'li[data-test="chatCopy"]';
exports.chatSave = 'li[data-test="chatSave"]';
exports.chatUserMessage = 'span[data-test="chatUserMessage"]';
exports.chatUserMessageText = 'p[data-test="chatUserMessageText"]';
exports.chatClearMessageText = 'p[data-test="chatClearMessageText"]';
exports.chatPollMessageText = 'p[data-test="chatPollMessageText"]';
exports.chatWelcomeMessageText = 'p[data-test="chatWelcomeMessageText"]';
exports.activeChat = 'li[data-test="activeChat"]';
exports.publicChat = 'div[data-test="publicChat"]';
exports.privateChat = 'div[data-test="privateChat"]';
exports.hidePrivateChat = 'button[aria-label^="Hide Private Chat with"]';
// Messages
exports.message = 'Hello World!';
exports.message1 = 'Hello User2';
exports.message2 = 'Hello User1';
exports.publicMessage1 = 'This is a Public Message from User1';
exports.publicMessage2 = 'This is a Public Message from User2';

// CustomParameters
exports.audioOverlay = 'div[class^="ReactModal__Overlay"]';
exports.brandingAreaLogo = 'div[class^="branding--"]';
exports.verticalListOptions = 'div[aria-expanded="true"] > div[class^="scrollable--"] > ul[class^="verticalList"]';
exports.multiUsersWhiteboard = 'button[aria-label="Turn multi-user whiteboard on"]';
exports.defaultContent = 'div[class^="defaultContent--"]';
exports.notificationBar = 'div[class^="notificationsBar--"]';
exports.chat = 'section[aria-label="Chat"]';
exports.recordingIndicator = 'div[class^="recordingIndicator--"]';
exports.webcamMirroredVideoContainer = 'video[data-test="mirroredVideoContainer"]';
exports.userslistContainer = 'div[aria-label="User list"]';
exports.userListContent = 'div[data-test="userListContent"]';
exports.confirmBtn = 'button[aria-label="Confirm "]';
exports.zoomIn = 'button[aria-label="Zoom in"]';
exports.audioOptionsButtons = '[class^="audioOptions"] > button';
exports.startWebcamSharingConfirm = 'button[aria-label="Start sharing"]';
exports.toolbarListClass = '[class^="toolbarList--"]';

// Notes
exports.sharedNotes = 'div[data-test="sharedNotes"]';
exports.hideNoteLabel = 'button[data-test="hideNoteLabel"]';
exports.etherpad = 'iframe[title="etherpad"]';

// Notifications
exports.chatPushAlerts = 'input[aria-label="Chat Message Popup Alerts"]';
exports.smallToastMsg = 'div[data-test="toastSmallMsg"]';
exports.toastContainer = 'div[class^="toastContainer--"]';
exports.savedSettingsToast = 'Settings have been saved';
exports.publicChatToast = 'New Public Chat message';
exports.privateChatToast = 'New Private Chat message';
exports.userListNotifiedIcon = '[class^=btnWithNotificationDot]';
exports.hasUnreadMessages = 'button[data-test="hasUnreadMessages"]';
exports.modalConfirmButton = 'button[data-test="modalConfirmButton"]';
exports.userJoinPushAlerts = '[aria-label="User Join Popup Alerts"]';
exports.dropdownContent = '[data-test="dropdownContent"]';
exports.fileUploadDropZone = '[data-test="fileUploadDropZone"]';
exports.polling = 'li[data-test="polling"]';
exports.yesBtn = 'button[aria-label="Yes"]';
exports.hidePollDesc = 'button[data-test="hidePollDesc"]';
exports.joinAudioToast = 'You have joined the audio conference';
exports.notificationsTab = 'span[id="notificationTab"]';

// Polling
exports.pollingContainer = 'div[data-test="pollingContainer"]';
exports.pollQuestionArea = 'textarea[data-test="pollQuestionArea"]';
exports.pollQuestion = 'Are we good ?';
exports.responseTypes = 'div[data-test="responseTypes"]';
exports.responseChoices = 'div[data-test="responseChoices"]';
exports.addPollItem = 'button[data-test="addPollItem"]';
exports.pollYesNoAbstentionBtn = 'button[aria-label="Yes / No / Abstention"]';
exports.pollLetterAlteratives = 'button[aria-label="A / B / C / D"]';
exports.userResponseBtn = 'button[aria-label="User Response"]';
exports.pollOptionItem = 'input[data-test="pollOptionItem"]';
exports.uncertain = 'Uncertain';
exports.deletePollOption = 'button[data-test="deletePollOption"]';
exports.pollAnswerOptionBtn = 'button[data-test="pollAnswerOption"]';
exports.pollAnswerOptionInput = 'input[data-test="pollAnswerOption"]';
exports.answerMessage = 'All good!';
exports.pollSubmitAnswer = 'button[data-test="submitAnswer"]';
exports.startPoll = 'button[data-test="startPoll"]';
exports.restartPoll = 'button[data-test="restartPoll"]';
exports.receivedAnswer = 'td[data-test="receivedAnswer"]';
exports.publishPollingLabel = 'button[data-test="publishPollingLabel"]';
exports.pollResults = 'g[data-test="pollResultAria"]';
exports.anonymousPoll = 'input[aria-label="Anonymous Poll"]';
exports.quickPoll = 'button[aria-label="Quick Poll"]';
exports.closePollingMenu = 'button[aria-label="Close Polling"]'
exports.questionSlideFileName = 'mockPollSlide.pdf';

// Presentation
exports.startScreenSharing = 'button[data-test="startScreenShare"]';
exports.stopScreenSharing = 'button[data-test="stopScreenShare"]';
exports.presentationToolbarWrapper = '#presentationToolbarWrapper';
exports.presentationTitle = '[class^="presentationTitle--"]';
exports.hidePresentation = 'button[data-test="hidePresentationButton"]';
exports.minimizePresentation = 'button[aria-label="Minimize presentation"]';
exports.restorePresentation = 'button[data-test="restorePresentationButton"]';
exports.nextSlide = '[data-test="nextSlide"]';
exports.prevSlide = '[data-test="prevSlide"]';
exports.fileUpload = 'input[type="file"]';
exports.upload = 'button[aria-label="Upload"]';
exports.cancel = 'button[aria-label="Cancel]';
exports.uploadPresentation = '[data-test="uploadPresentation"]';
exports.skipSlide = '[data-test="skipSlide"]';
exports.removePresentation = 'button[data-test="removePresentation"]';
exports.presentationPlaceholder = 'div[data-test="presentationPlaceholder"]';
exports.presentationPlaceholderLabel = 'Waiting for a presentation to be uploaded';
exports.presentationDownloadBtn = 'button[data-test="presentationDownload"]';
exports.toastDownload = 'a[data-test="toastDownload"]';
exports.confirmManagePresentation = 'button[data-test="confirmManagePresentation"]';
exports.allowPresentationDownload = 'button[data-test="allowPresentationDownload"]';
exports.disallowPresentationDownload = 'button[data-test="disallowPresentationDownload"]';
exports.uploadPresentationFileName = 'uploadTest.png';
exports.presentationContainer = 'div[class^="presentationContainer--"]';
exports.externalVideoBtn = 'li[data-test="external-video"]';
exports.externalVideoModalHeader = 'header[data-test="videoModalHeader"]';
exports.videoModalInput = 'input[id="video-modal-input"]';
exports.startShareVideoBtn = 'button[aria-label="Share a new video"]';
exports.videoPlayer = 'div[data-test="videoPlayer"]';
// YouTube frame
exports.youtubeLink = 'https://www.youtube.com/watch?v=Hso8yLzkqj8&ab_channel=BigBlueButton';
exports.youtubeFrame = 'iframe[title^="YouTube"]';
exports.ytFrameTitle = 'a[class^="ytp-title-link"]';

// User
exports.firstUser = '[data-test="userListItemCurrent"]';
exports.userListItem = 'div[data-test="userListItem"]';
exports.anyUser = '[data-test^="userListItem"]';
exports.userAvatar = 'div[data-test="userAvatar"]'
exports.avatarsWrapperAvatar = 'div[data-test="avatarsWrapperAvatar"]';
exports.firstUserAvatar = `${this.firstUser} > ${this.userAvatar}`;
exports.secondUserAvatar = `${this.userListItem} > ${this.userAvatar}`;
exports.applauseIcon = `${this.userAvatar} > div > i[class="icon-bbb-applause"]`;
exports.awayIcon = `${this.userAvatar} > div > i[class="icon-bbb-time"]`;
exports.presenterClassName = 'presenter--';
exports.setStatus = '[data-test="setstatus"]';
exports.away = '[data-test="away"]';
exports.applaud = '[data-test="applause"]';
exports.clearStatus = '[data-test="clearStatus"]';
exports.setPresenter = 'li[data-test="setPresenter"]';
exports.connectionStatusModal = 'div[aria-label="Connection status modal"]';
exports.dataSavingWebcams = 'input[data-test="dataSavingWebcams"]';
exports.dataSavingScreenshare = 'input[data-test="dataSavingScreenshare"]';
exports.closeConnectionStatusModal = 'button[aria-label="Close Connection status modal"]';
exports.webcamsIsDisabledInDataSaving = 'button[aria-label="Webcam sharing is disabled in Data Saving"]';
exports.screenshareLocked = 'button[aria-label="Screenshare locked"]';
exports.connectionStatusItemEmpty = 'div[data-test="connectionStatusItemEmpty"]';
exports.connectionStatusItemUser = 'div[data-test="connectionStatusItemUser"]';
exports.connectionStatusOfflineUser = 'div[data-test="offlineUser"]';
exports.mobileUser = 'span[data-test="mobileUser"]';
exports.userList = 'button[aria-label="Users and messages toggle"]';
exports.manageUsers = 'button[data-test="manageUsers"]';
exports.guestPolicyLabel = 'li[data-test="guestPolicyLabel"]';
exports.guestPolicySettingsModal = 'div[data-test="guestPolicySettingsModal"]';
exports.askModerator = 'button[data-test="askModerator"]';
exports.alwaysAccept = 'button[data-test="alwaysAccept"]';
exports.alwaysDeny = 'button[data-test="alwaysDeny"]';
exports.waitingUsersBtn = 'div[data-test="waitingUsersBtn"]';
exports.joinMeetingDemoPage = 'div[class^="join-meeting"]';
exports.chatPanel = 'section[data-test="chatPanel"]';
exports.userListPanel = 'div[data-test="userListPanel"]';
exports.multiWhiteboardTool = 'span[data-test="multiWhiteboardTool"]'
exports.connectionStatusBtn = 'button[data-test="connectionStatusButton"]';
exports.connectionDataContainer = '[class^=networkDataContainer--]';
exports.connectionNetwordData = '[class^=networkData--]';

// Webcam
exports.joinVideo = 'button[data-test="joinVideo"]';
exports.leaveVideo = 'button[data-test="leaveVideo"]';
exports.videoPreview = 'video[data-test="videoPreview"]';
exports.startSharingWebcam = 'button[data-test="startSharingWebcam"]';
exports.webcamSettingsModal = 'div[aria-label="Webcam settings"]';
exports.webcamMirroredVideoPreview = 'video[data-test="mirroredVideoPreview"]';
exports.videoContainer = 'div[class^="videoListItem"]';
exports.webcamConnecting = 'div[data-test="webcamConnecting"]';
exports.presentationFullscreenButton = 'button[data-test="presentationFullscreenButton"]';
exports.webcamItemTalkingUser = 'div[data-test="webcamItemTalkingUser"]';
exports.webcamVideo = 'video[data-test="videoContainer"]';

// Whiteboard
exports.whiteboard = 'svg[data-test="whiteboard"]';
exports.tools = 'button[aria-label="Tools"]';
exports.pencil = 'button[aria-label="Pencil"]';
exports.rectangle = 'button[aria-label="Rectangle"]';
exports.drawnRectangle = 'svg g[clip-path] > g:nth-child(2) rect[data-test="drawnRectangle"]';
exports.changeWhiteboardAccess = 'li[data-test="changeWhiteboardAccess"]';
exports.whiteboardViewBox = 'svg g[clip-path="url(#viewBox)"]';