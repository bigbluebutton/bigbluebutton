// Common
exports.actions = 'button[aria-label="Actions"]';
exports.pollMenuButton = 'div[data-test="pollMenuButton"]';
exports.options = 'button[aria-label="Options"]';
exports.settings = 'li[data-test="settings"]';
exports.modalConfirmButton = 'button[data-test="modalConfirmButton"]';
exports.screenshareConnecting = 'div[data-test="screenshareConnecting"]';
exports.screenShareVideo = 'video[id="screenshareVideo"]';
exports.closeModal = 'button[data-test="modalDismissButton"]';
exports.isSharingScreen = 'div[data-test="isSharingScreen"]';
exports.pdfFileName = '100PagesFile.pdf';

// Audio
exports.joinAudio = 'button[data-test="joinAudio"]';
exports.audioModal = 'div[aria-label="Join audio modal"]';
exports.closeAudioButton = 'button[aria-label="Close Join audio modal"]';
exports.listenOnlyButton = 'button[aria-label="Listen only"]';
exports.connectingStatus = 'div[class^="connecting--"]';
exports.leaveAudio = 'button[data-test="leaveAudio"]';
exports.microphoneButton = 'button[aria-label="Microphone"]';
exports.echoYesButton = 'button[aria-label="Echo is audible"]';
exports.isTalking = '[data-test="isTalking"]';
exports.talkingIndicator = 'div[class^="isTalkingWrapper--"] > div[class^="speaking--"]';

// Breakout
exports.createBreakoutRooms = 'li[data-test="createBreakoutRooms"]';
exports.randomlyAssign = '[data-test="randomlyAssign"]';
exports.breakoutRoomsItem = '[data-test="breakoutRoomsItem"]';
exports.alreadyConnected = 'span[class^="alreadyConnected--"]';
exports.askJoinRoom1 = 'button[aria-label="Ask to join Room 1"]';
exports.joinRoom1 = 'button[aria-label="Join room Room 1"]';
exports.breakoutRoomsButton = 'div[aria-label="Breakout Rooms"]';
exports.allowChoiceRoom = 'input[id="freeJoinCheckbox"]';
exports.labelGeneratingURL = 'span[data-test="labelGeneratingURL"]';
exports.endBreakoutRoomsButton = 'button[data-test="endBreakoutRoomsButton"]';

// Chat
exports.chatBox = '#message-input';
exports.chatButton = 'div[data-test="chatButton"]';
exports.sendButton = 'button[data-test="sendMessageButton"]';
exports.chatPollMessageText = 'p[data-test="chatPollMessageText"]';
exports.chatMessages = 'div[data-test="chatMessages"]';
exports.chatOptions = 'button[data-test="chatOptionsMenu"]';
exports.chatClear = 'li[data-test="chatClear"]';
exports.chatSave = 'li[data-test="chatSave"]';
exports.chatCopy = 'li[data-test="chatCopy"]';
exports.chatTitle = 'div[data-test="chatTitle"]';
exports.activeChat = 'li[data-test="activeChat"]';
// Messages
exports.message = 'Hello World!';
exports.message1 = 'Hello User2';
exports.message2 = 'Hello User1';
exports.publicMessage1 = 'This is a Public Message from User1';
exports.publicMessage2 = 'This is a Public Message from User2';

exports.chatUserMessageText = 'p[data-test="chatUserMessageText"]';
exports.chatClearMessageText = 'p[data-test="chatClearMessageText"]';

// Messages
exports.message = 'Hello World!';

// Notes
exports.sharedNotes = 'div[data-test="sharedNotes"]';
exports.hideNoteLabel = 'button[data-test="hideNoteLabel"]';
exports.etherpad = 'iframe[title="etherpad"]';

// Notifications
exports.smallToastMsg = 'div[data-test="toastSmallMsg"]';
exports.savedSettingsToast = 'Settings have been saved';
exports.notificationsTab = 'span[id="notificationTab"]';
exports.chatPushAlerts = 'input[aria-label="Chat Message Popup Alerts"]';
exports.hasUnreadMessages = 'button[data-test="hasUnreadMessages"]';
exports.publicChatToast = 'New Public Chat message';
exports.privateChatToast = 'New Private Chat message';
exports.userJoinPushAlerts = '[aria-label="User Join Popup Alerts"]';
exports.joinAudioToast = 'You have joined the audio conference';
exports.pollPublishedToast = 'Poll results were published';
exports.startScreenshareToast = 'Screenshare has started';
exports.endScreenshareToast = 'Screenshare has ended';

// Polling
exports.polling = 'li[data-test="polling"]';
exports.startPoll = 'button[data-test="startPoll"]';
exports.restartPoll = 'button[data-test="restartPoll"]';
exports.hidePollDesc = 'button[data-test="hidePollDesc"]';
exports.pollingContainer = 'div[data-test="pollingContainer"]';
exports.pollLetterAlteratives = 'button[aria-label="A / B / C / D"]';
exports.pollOptionItem = 'input[data-test="pollOptionItem"]';
exports.anonymousPoll = 'input[aria-label="Anonymous Poll"]';
exports.publishPollingLabel = 'button[data-test="publishPollingLabel"]';
exports.pollAnswerOptionBtn = 'button[data-test="pollAnswerOption"]';
exports.receivedAnswer = 'td[data-test="receivedAnswer"]';
exports.quickPoll = 'button[aria-label="Quick Poll"]';
exports.pollQuestionArea = 'textarea[data-test="pollQuestionArea"]';
exports.pollQuestion = 'Are we good ?';
exports.userResponseBtn = 'button[aria-label="User Response"]';
exports.pollAnswerOptionInput = 'input[data-test="pollAnswerOption"]';
exports.answerMessage = 'All good!';
exports.pollSubmitAnswer = 'button[data-test="submitAnswer"]';
exports.pollResults = 'g[data-test="pollResultAria"]';
exports.closePollingMenu = 'button[aria-label="Close Polling"]';
exports.addPollItem = 'button[data-test="addPollItem"]';
exports.deletePollOption = 'button[data-test="deletePollOption"]';
exports.cancelPollBtn = 'button[data-test="cancelPollLabel"]';
exports.questionSlideFileName = 'mockPollSlide.pdf';

// Presentation
exports.startScreenSharing = 'button[data-test="startScreenShare"]';
exports.stopScreenSharing = 'button[data-test="stopScreenShare"]';
exports.uploadPresentation = '[data-test="uploadPresentation"]';
exports.fileUpload = 'input[type="file"]';
exports.upload = 'button[aria-label="Upload"]';
exports.presentationToolbarWrapper = '#presentationToolbarWrapper';
exports.nextSlide = '[data-test="nextSlide"]';
exports.prevSlide = '[data-test="prevSlide"]';
exports.skipSlide = '[data-test="skipSlide"]';
exports.uploadPresentationFileName = 'uploadTest.png';
exports.allowPresentationDownload = 'button[data-test="allowPresentationDownload"]';
exports.disallowPresentationDownload = 'button[data-test="disallowPresentationDownload"]';
exports.confirmManagePresentation = 'button[data-test="confirmManagePresentation"]';
exports.toastDownload = 'a[data-test="toastDownload"]';
exports.presentationDownloadBtn = 'button[data-test="presentationDownload"]';
exports.removePresentation = 'button[data-test="removePresentation"]';
exports.presentationPlaceholder = 'div[data-test="presentationPlaceholder"]';
exports.presentationPlaceholderLabel = 'Waiting for a presentation to be uploaded';
exports.minimizePresentation = 'button[aria-label="Minimize presentation"]';
exports.presentationContainer = 'div[class^="presentationContainer--"]';
exports.restorePresentation = 'button[data-test="restorePresentationButton"]';
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
exports.userAvatar = 'div[data-test="userAvatar"]';
exports.applauseIcon = `${this.userAvatar} > div > i[class="icon-bbb-applause"]`;
exports.awayIcon = `${this.userAvatar} > div > i[class="icon-bbb-time"]`;
exports.setStatus = '[data-test="setstatus"]';
exports.away = '[data-test="away"]';
exports.applaud = '[data-test="applause"]';
exports.userListItem = 'div[data-test="userListItem"]';
exports.firstUser = '[data-test="userListItemCurrent"]';
exports.multiWhiteboardTool = 'span[data-test="multiWhiteboardTool"]';
exports.manageUsers = 'button[data-test="manageUsers"]';
exports.presenterClassName = 'presenter--';
exports.anyUser = '[data-test^="userListItem"]';

// Locales
exports.locales = ['af', 'ar', 'az', 'bg-BG', 'bn', 'ca', 'cs-CZ', 'da', 'de',
  'dv', 'el-GR', 'en', 'eo', 'es', 'es-419', 'es-ES', 'es-MX', 'et', 'eu',
  'fa-IR', 'fi', 'fr', 'gl', 'he', 'hi-IN', 'hr', 'hu-HU', 'hy', 'id', 'it-IT',
  'ja', 'ka', 'km', 'kn', 'ko-KR', 'lo-LA', 'lt-LT', 'lv', 'ml', 'mn-MN',
  'nb-NO', 'nl', 'oc', 'pl-PL', 'pt', 'pt-BR', 'ro-RO', 'ru', 'sk-SK', 'sl',
  'sr', 'sv-SE', 'ta', 'te', 'th', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'
];

// Webcam
exports.joinVideo = 'button[data-test="joinVideo"]';
exports.leaveVideo = 'button[data-test="leaveVideo"]';
exports.videoPreview = 'video[data-test="videoPreview"]';
exports.startSharingWebcam = 'button[data-test="startSharingWebcam"]';
exports.webcamConnecting = 'div[data-test="webcamConnecting"]';
exports.webcamVideo = 'video[data-test="videoContainer"]';
exports.videoContainer = 'div[class^="videoListItem"]';
exports.webcamItemTalkingUser = 'div[data-test="webcamItemTalkingUser"]';

// Whiteboard
exports.whiteboard = 'svg[data-test="whiteboard"]';
exports.tools = 'button[aria-label="Tools"]';
exports.rectangle = 'button[aria-label="Rectangle"]';
exports.drawnRectangle = 'svg g[clip-path] > g:nth-child(2) rect[data-test="drawnRectangle"]';
exports.whiteboardViewBox = 'svg g[clip-path="url(#viewBox)"]';
exports.changeWhiteboardAccess = 'li[data-test="changeWhiteboardAccess"]';
