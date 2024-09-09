// Common
exports.actions = 'button[data-test="actionsButton"]';
exports.actionsItem = 'div[id="actions-dropdown-menu"] ul li';
exports.pollMenuButton = 'div[data-test="pollMenuButton"]';
exports.optionsButton = 'button[data-test="optionsButton"]';
exports.settings = 'li[data-test="settings"]';
exports.modalConfirmButton = 'button[data-test="modalConfirmButton"]';
exports.screenshareConnecting = 'div[data-test="screenshareConnecting"]';
exports.screenShareVideo = 'video[id="screenshareVideo"]';
exports.modalDismissButton = 'button[data-test="modalDismissButton"]';
exports.closeModal = 'button[data-test="closeModal"]';
exports.isSharingScreen = 'div[data-test="isSharingScreen"]';
exports.pdfFileName = '100PagesFile.pdf';
exports.reactionsButton = 'button[data-test="reactionsButton"]';
exports.raiseHandBtn = 'div[data-test="raiseHandBtn"]';
exports.lowerHandBtn = 'div[data-test="lowerHandBtn"]';
exports.raiseHandRejection = 'button[data-test="raiseHandRejection"]';
exports.meetingEndedModal = 'div[data-test="meetingEndedModal"]';
exports.leaveMeetingDropdown = 'button[data-test="leaveMeetingDropdown"]';
exports.directLogoutButton = 'li[data-test="directLogoutButton"]';
exports.optionsLogoutButton = 'li[data-test="optionsLogoutButton"]';
exports.rating = 'div[data-test="rating"]';
exports.sendFeedbackButton = 'button[data-test="sendFeedbackButton"]';
exports.feedbackCommentInput = 'textarea#feedbackComment';
exports.errorScreenMessage = 'h1[data-test="errorScreenMessage"]';
exports.errorMessageLabel = 'span[id="error-message"]';
exports.shareCameraAsContent = 'li[data-test="shareCameraAsContent"]';
exports.closePopup = 'button[data-test="closePopup"]';
exports.restoreWelcomeMessages = 'li[data-test="restoreWelcomeMessages"]';

// Accesskey
exports.chatButtonKey = 'div[accesskey="P"]';
exports.userListButton = 'button[accesskey="U"]';

// Audio
exports.joinAudio = 'button[data-test="joinAudio"]';
exports.audioModal = 'div[data-test="audioModal"]';
exports.audioSettingsModal = 'div[data-test="audioSettingsModal"]';
exports.listenOnlyButton = 'button[data-test="listenOnlyBtn"]';
exports.testSpeakerButton = 'button[data-test="testSpeakerButton"]';
exports.stopHearingButton = 'button[data-test="stopHearingButton"]';
exports.joinEchoTestButton = 'button[data-test="joinEchoTestButton"]';
exports.establishingAudioLabel = 'span[data-test="establishingAudioLabel"]';
exports.leaveListenOnly = 'button[data-test="leaveListenOnly"]';
exports.leaveAudio = 'li[data-test="leaveAudio"]';
exports.audioDropdownMenu = 'button[data-test="audioDropdownMenu"]';
exports.defaultInputAudioDevice = 'li[data-test="audioinput-1"]';
exports.secondInputAudioDevice = 'li[data-test="audioinput-2"]';
exports.microphoneButton = 'button[data-test="microphoneBtn"]';
exports.echoYesButton = 'button[data-test="echoYesBtn"]';
exports.connectingToEchoTest = 'span[data-test="connectingToEchoTest"]';
exports.hasVolumeEchoTest = 'span[data-test="hasVolume"]';
exports.hasNoVolumeEchoTest = 'span[data-test="hasNoVolume"]';
exports.isTalking = 'button[data-test="isTalking"]';
exports.wasTalking = 'button[data-test="wasTalking"]';
exports.talkingIndicator = 'div[data-test="talkingIndicator"]';
exports.unmuteMicButton = 'button[data-test="unmuteMicButton"]';
exports.muteMicButton = 'button[data-test="muteMicButton"]';
exports.speechRecognition = 'select[id="speechSelect"]';
exports.speechRecognitionUnsupported = 'div[data-test="speechRecognitionUnsupported"]';

// Breakout
exports.createBreakoutRooms = 'li[data-test="createBreakoutRooms"]';
exports.randomlyAssign = 'button[data-test="randomlyAssign"]';
exports.resetAssignments = 'button[data-test="resetAssignments"]'
exports.breakoutRoomsItem = 'div[data-test="breakoutRoomsItem"]';
exports.alreadyConnected = 'span[data-test="alreadyConnected"]';
exports.askJoinRoom1 = 'button[data-test="askToJoinRoom1"]';
exports.joinRoom1 = 'button[data-test="joinRoom1"]';
exports.allowChoiceRoom = 'input[id="freeJoinCheckbox"]';
exports.labelGeneratingURL = 'span[data-test="labelGeneratingURL"]';
exports.endBreakoutRoomsButton = 'button[data-test="endBreakoutRoomsButton"]';
exports.durationTime = 'input[data-test="durationTime"]';
exports.minimumDurationWarnBreakout = 'span[data-test="minimumDurationWarnBreakout"]';
exports.selectNumberOfRooms = 'select[id="numberOfRooms"]';
exports.roomGrid = 'div[data-test="roomGrid"] >> input';
exports.breakoutBox0 = 'div[id="breakoutBox-0"]';
exports.breakoutBox1 = 'div[id="breakoutBox-1"]';
exports.breakoutBox2 = 'div[id="breakoutBox-2"]';
exports.breakoutOptionsMenu = 'button[data-test="breakoutOptionsMenu"]';
exports.openUpdateBreakoutUsersModal = 'li[data-test="openUpdateBreakoutUsersModal"]';
exports.attendeeNotAssigned = 'div[id="breakoutBox-0"] >> p:nth-child(2)';
exports.moveUser = 'div[id="breakoutBox-1"] >> p:nth-child(1)';
exports.openBreakoutTimeManager = 'li[data-test="openBreakoutTimeManager"]';
exports.inputSetTimeSelector = 'input[id="inputSetTimeSelector"]';
exports.sendButtonDurationTime = 'button[data-test="sendButtonDurationTime"]';
exports.breakoutRemainingTime = 'span[data-test="breakoutRemainingTime"]';
exports.roomNameInput = 'input[data-test="roomName-1"]';
exports.roomName1Test = 'span[data-test="TestRoom 1"]';
exports.userNameBreakoutRoom = 'div[data-test="userNameBreakoutRoom-Room 1"]';
exports.userNameBreakoutRoom2 = 'div[data-test="userNameBreakoutRoom-Room 2"]';
exports.userNameBreakoutRoom7 = 'div[data-test="userNameBreakoutRoom-Room 7"]';
exports.endAllBreakouts = 'li[data-test="endAllBreakouts"]';
exports.breakoutRoomList = 'div[data-test="breakoutRoomList"]';
exports.warningNoUserAssigned = 'span[data-test="warningNoUserAssigned"]';
exports.timeRemaining = 'span[data-test="timeRemaining"]';
exports.captureBreakoutSharedNotes = 'input[id="captureNotesBreakoutCheckbox"]';
exports.captureBreakoutWhiteboard = 'input[id="captureSlidesBreakoutCheckbox"]';
exports.selectBreakoutRoomBtn = 'select[data-test="selectBreakoutRoomBtn"]';
exports.roomOption = 'option[data-test="roomOption"]';

// Chat
exports.chatBox = 'textarea[id="message-input"]';
exports.partnerDisconnectedMessage = 'span[data-test="partnerDisconnected"]';
exports.chatButton = 'button[data-test="chatButton"]';
exports.sendButton = 'button[data-test="sendMessageButton"]';
exports.chatPollMessageText = 'div[data-test="chatPollMessageText"]';
exports.chatMessages = 'div[data-test="chatMessages"]';
exports.chatOptions = 'button[data-test="chatOptionsMenu"]';
exports.chatClear = 'li[data-test="chatClear"]';
exports.chatSave = 'li[data-test="chatSave"]';
exports.chatCopy = 'li[data-test="chatCopy"]';
exports.chatTitle = 'header[data-test="chatTitle"]';
exports.startPrivateChat = 'li[data-test="startPrivateChat"]';
exports.publicChat = 'div[data-test="publicChat"]';
exports.privateChat = 'div[data-test="messageContent"] p>>nth=1';
exports.hidePublicChat = 'button[data-test="hidePublicChat"]';
exports.hidePrivateChat = 'button[data-test="hidePrivateChat"]';
exports.closePrivateChat = 'button[data-test="closePrivateChat"]';
exports.typingIndicator = 'span[data-test="typingIndicator"]';
exports.errorTypingIndicator = 'div[data-test="errorTypingIndicator"]';
exports.chatUserMessageText = 'div[data-test="messageContent"] p';
exports.secondChatUserMessageText = 'p[data-test="chatUserMessageText"]>>nth=1';
exports.chatWelcomeMessageText = 'div[data-test="welcomeMessage"]';
exports.waitingUsersLobbyMessage = 'div[data-test="lobbyMessage"] >> textarea';
exports.sendLobbyMessage = 'div[data-test="lobbyMessage"] >> button';
exports.lobbyMessage = 'div[data-test="lobbyMessage"] >> p';
exports.positionInWaitingQueue = 'div[id="positionInWaitingQueue"]';
exports.allowEveryone = 'button[data-test="allowEveryone"]';
exports.denyEveryone = 'button[data-test="denyEveryone"]';
exports.guestMessage = 'p[data-test="guestMessage"]';
exports.privateMessageGuest = 'button[data-test="privateMessageGuest"]';
exports.acceptGuest = 'button[data-test="acceptGuest"]';
exports.denyGuest = 'button[data-test="denyGuest"]';
exports.inputPrivateLobbyMesssage = 'div[data-test="privateLobbyMessage"] >> textarea';
exports.sendPrivateLobbyMessage = 'div[data-test="privateLobbyMessage"] >> button';
exports.rememberCheckboxId = 'input[id="rememberCheckboxId"]';
exports.welcomeMessage = 'h1[id="welcome-message"]';
// Emoji picker
exports.emojiPickerButton = 'button[data-test="emojiPickerButton"]';
exports.frequentlyUsedEmoji = '👍';
exports.emojiSent = 'section[aria-label="Frequently Used"] button[title="+1"] span';
// Auto Convert Emoji
exports.autoConvertEmojiMessage = ':)';
exports.convertedEmojiMessage = '😊';
// Messages
exports.message = 'Hello World!';
exports.testMessage = 'Just a test';
exports.message1 = 'Hello User2';
exports.message2 = 'Hello User1';
exports.publicMessage1 = 'This is a Public Message from User1';
exports.publicMessage2 = 'This is a Public Message from User2';
exports.uniqueCharacterMessage = 'A';

// CustomParameters
exports.audioOptionsButtons = 'span[data-test="audioModalOptions"] > button';
exports.userListContent = 'div[data-test="userListContent"]';
exports.brandingAreaLogo = 'div[data-test="brandingArea"]';
exports.toolbarToolsList = 'div[data-test="toolbarToolsList"]';
exports.notificationBannerBar = 'div[data-test="notificationBannerBar"]';
exports.reconnectingBar = '//div[@data-test="notificationBannerBar" and contains(text(), "Connecting ...")]';
exports.zoomInBtn = 'button[data-test="zoomInBtn"]';
exports.recordingIndicator = 'div[data-test="recordingIndicator"]';
exports.webcamMirroredVideoContainer = 'video[data-test="mirroredVideoContainer"]';
exports.usersList = 'div[data-test="userList"]';
exports.selectCameraQualityId = 'select[id="setQuality"]';
exports.virtualBackgrounds = 'div[data-test="virtualBackground"]';
exports.learningDashboard = 'li[data-test="learningDashboard"]';

// Timer
exports.timerContainer = 'div[data-test="timerContainer"]';
exports.stopwatchContainer = 'div[data-test="stopwatchContainer"]';
exports.timerStopwatchFeature = 'li[data-test="timerStopWatchFeature"]';
exports.timerCurrent = 'span[data-test="timerCurrent"]';
exports.startStopTimer = 'button[data-test="startStopTimer"]';
exports.resetTimerStopwatch = 'button[data-test="resetTimerStopWatch"]';
exports.timerButton = 'button[data-test="timerButton"]';
exports.timerIndicator = 'div[data-test="timeIndicator"]';
exports.stopwatch = 'button[data-test="stopwatchButton"]';
exports.hoursInput = 'input[data-test="hoursInput"]';
exports.minutesInput = 'input[data-test="minutesInput"]';
exports.secondsInput = 'input[data-test="secondsInput"]';

// Notes
exports.sharedNotes = 'div[data-test="sharedNotes"]';
exports.hideNotesLabel = 'button[data-test="hideNotesLabel"]';
exports.etherpadFrame = 'iframe[title="pad"]';
exports.etherpadOuter = 'iframe[title="Ether"]';
exports.etherpadInner = 'iframe[title="pad"]';
exports.etherpadEditable = 'body[id="innerdocbody"]';
exports.sendNotesToWhiteboard = 'li[data-test="moveNotesToWhiteboard"]';
exports.presentationUploadProgressToast = 'div[data-test="presentationUploadProgressToast"]';
exports.sharedNotesViewingMode = 'iframe[title="shared notes viewing mode"]';
exports.currentSlideText = 'span[id="currentSlideText"]';
exports.notesOptions = 'button[data-test="notesOptionsMenu"]';
exports.showMoreSharedNotesButton = 'span[class="show-more-icon-btn"]'
exports.exportSharedNotesButton = 'li[data-key="import_export"] button';
exports.exportPlainButton = 'a[id="exportplaina"] span';
exports.pinNotes = 'li[data-test="pinNotes"]';
exports.unpinNotes = 'button[data-test="unpinNotes"]';
exports.exportetherpad = 'span[id="exportetherpad"]';
exports.exporthtml = 'span[id="exporthtml"]';

// Notifications
exports.smallToastMsg = 'div[data-test="toastSmallMsg"]';
exports.closeToastBtn = 'i[data-test="closeToastBtn"]';
const currentPresentationToast = 'div[data-test="currentPresentationToast"]';
exports.currentPresentationToast = currentPresentationToast
exports.notificationsTab = 'span[id="notificationTab"]';
exports.chatPopupAlertsBtn = 'input[data-test="chatPopupAlertsBtn"]';
exports.hasUnreadMessages = 'div[data-test="unreadMessages"]';
exports.userJoinPushAlerts = 'input[data-test="userJoinPopupAlerts"]';
exports.toastContainer = 'div[data-test="toastContainer"]';
exports.presentationStatusInfo = 'span[data-test="presentationStatusInfo"]';
exports.noButton = 'button[aria-label="No"]';
exports.yesButton = 'button[aria-label="Yes"]';
// Toasts
exports.savedSettingsToast = 'Settings have been saved';
exports.publicChatToast = 'New Public Chat message';
exports.privateChatToast = 'New Private Chat message';
exports.joinAudioToast = 'You have joined the audio conference';
exports.pollPublishedToast = 'Poll results were published';
exports.startScreenshareToast = 'Screenshare has started';
exports.endScreenshareToast = 'Screenshare has ended';
exports.joiningMessageToast = 'You have joined the audio conference';
exports.attendeeJoinedToast = 'Attendee joined the session';
exports.raisingHandToast = 'You have raised your hand';
exports.loweringHandToast = 'Your hand has been lowered';
exports.noActiveMicrophoneToast = 'No active microphone. Share your microphone to add audio to this recording.';
// Icons
const baseBbbIcon = 'i.icon-bbb-';
exports.unmuteIcon = `${baseBbbIcon}unmute`;
exports.listenOnlyIcon = `${baseBbbIcon}listen`;
exports.checkedIcon = `${baseBbbIcon}check`;

// Polling
exports.pollQuestion = 'Are we good ?';
exports.answerMessage = 'All good!';
exports.questionSlideFileName = 'mockPollSlide.pdf';
exports.polling = 'li[data-test="polling"]';
exports.startPoll = 'button[data-test="startPoll"]';
exports.restartPoll = 'button[data-test="restartPoll"]';
exports.hidePollDesc = 'button[data-test="hidePollDesc"]';
exports.pollingContainer = 'aside[data-test="pollingContainer"]';
exports.pollLetterAlternatives = 'button[data-test="pollLetterAlternatives"]';
const pollOptionItem = 'input[data-test="pollOptionItem"]';
exports.pollOptionItem1 = `${pollOptionItem}>>nth=0`;
exports.pollOptionItem2 = `${pollOptionItem}>>nth=1`;
exports.pollOptionItem = pollOptionItem;
exports.anonymousPoll = 'input[data-test="anonymousPollBtn"]';
const pollAnswerOptionBtn = 'button[data-test="publishPollingLabel"]';
exports.publishPollingLabel = pollAnswerOptionBtn;
exports.pollAnswerOptionBtn = 'button[data-test="pollAnswerOption"]';
exports.receivedAnswer = 'td[data-test="receivedAnswer"]';
exports.quickPoll = 'button[data-test="quickPollBtn"]';
exports.pollQuestionArea = 'textarea[data-test="pollQuestionArea"]';
exports.userResponseBtn = 'button[data-test="userResponseBtn"]';
exports.pollAnswerOptionInput = 'input[data-test="pollAnswerOption"]';
exports.pollSubmitAnswer = 'button[data-test="submitAnswer"]';
exports.addPollItem = 'button[data-test="addPollItem"]';
exports.deletePollOption = 'button[data-test="deletePollOption"]';
exports.cancelPollBtn = 'button[data-test="cancelPollLabel"]';
exports.pollYesNoAbstentionBtn = 'button[data-test="pollYesNoAbstentionBtn"]';
exports.noPresentation = 'h4[data-test="noPresentation"]';
exports.autoOptioningPollBtn = 'input[data-test="autoOptioningPollBtn"]';
exports.currentPollQuestion = 'span[data-test="currentPollQuestion"]';
exports.allowMultiple = 'div[data-test="allowMultiple"] input[type="checkbox"]';
const pollAnswerOptionDesc = 'div[data-test="optionsAnswers"]';
exports.firstPollAnswerDescOption = `${pollAnswerOptionDesc} input:nth-child(1)`;
exports.secondPollAnswerDescOption = `${pollAnswerOptionDesc}>>nth=1`;
exports.submitAnswersMultiple = 'button[data-test="submitAnswersMultiple"]';
exports.userVoteLiveResult = 'td[data-test="userVoteLiveResult"]';
exports.errorNoValueInput = 'div[data-test="errorNoValueInput"]';
exports.smartSlides1 = 'smartSlidesPresentation.pdf';
exports.responsePollQuestion = 'div[data-test="pollQuestion"]';
const pollAnswersOption = 'div[data-test="optionsAnswers"]';
exports.firstPollAnswerOptionBtn = `${pollAnswersOption}>>nth=0`;
exports.secondPollAnswerOptionBtn = `${pollAnswersOption}>>nth=1`;
exports.firstCheckboxInput = `${pollAnswersOption}`;
exports.closePollingBtn = 'button[data-test="closePolling"]';
exports.yesNoOption = 'button[data-test="yesNoQuickPoll"]';
exports.yesNoAbstentionOption = 'li[role="menuitem"]>>nth=1';
exports.pollAnswerOptionE = 'button[data-test="pollAnswerOption"]>>nth=4';

// Presentation
exports.currentSlideImg = '[id="whiteboard-element"] [class="tl-image"]';
exports.uploadPresentationFileName = 'uploadTest.png';
exports.presentationPPTX = 'BBB.pptx';
exports.presentationTXT = 'helloWorld.txt';
exports.presentationPlaceholderLabel = 'There is no currently active presentation';
exports.noPresentationLabel = 'There is no currently active presentation';
exports.startScreenSharing = 'button[data-test="startScreenShare"]';
exports.stopScreenSharing = 'button[data-test="stopScreenShare"]';
exports.managePresentations = 'li[data-test="managePresentations"]';
exports.presentationFileUpload = 'div#upload-modal input[type="file"]';
exports.presentationToolbarWrapper = 'div[id="presentationToolbarWrapper"]';
exports.nextSlide = 'button[data-test="nextSlide"]';
exports.prevSlide = 'button[data-test="prevSlide"]';
exports.skipSlide = 'select[data-test="skipSlide"]';
exports.presentationOptionsDownloadBtn = 'button[data-test="presentationOptionsDownload"]';
exports.confirmManagePresentation = 'button[data-test="confirmManagePresentation"]';
exports.toastDownload = 'a[data-test="toastDownload"]';
exports.presentationDownloadBtn = 'button[data-test="presentationDownload"]';
exports.removePresentation = 'button[data-test="removePresentation"]';
exports.presentationPlaceholder = 'div[data-test="presentationPlaceholder"]';
exports.presentationContainer = 'div[data-test="presentationContainer"]';
exports.minimizePresentation = 'button[data-test="minimizePresentation"]';
exports.restorePresentation = 'button[data-test="restorePresentation"]';
exports.shareExternalVideoBtn = 'li[data-test="shareExternalVideo"]';
exports.videoModalInput = 'input[id="video-modal-input"]';
exports.startShareVideoBtn = 'button[data-test="startNewVideo"]';
exports.videoPlayer = 'div[data-test="videoPlayer"]';
exports.presentationTitle = 'h1[data-test="presentationTitle"]';
exports.fitToWidthButton = 'button[data-test="fitToWidthButton"]';
exports.presentationsList = 'div[id="upload-modal"] tbody';
exports.enableOriginalPresentationDownloadBtn = 'li[data-test="enableOriginalPresentationDownload"]';
exports.disableOriginalPresentationDownloadBtn = 'li[data-test="disableOriginalPresentationDownload"]';
exports.sendPresentationInCurrentStateBtn = 'li[data-test="sendCurrentStateDocument"]';
exports.downloadPresentation = 'div[data-test="downloadPresentationContainer"] > a';
exports.downloadPresentationToast = 'div[data-test="downloadPresentationToast"]';
exports.whiteboardOptionsButton = 'button[data-test="whiteboardOptionsButton"]';
exports.presentationFullscreen = 'li[data-test="presentationFullscreen"]';
exports.presentationSnapshot = 'li[data-test="presentationSnapshot"]';
exports.toolVisibility = 'li[data-test="toolVisibility"]';
// YouTube frame
exports.youtubeLink = 'https://www.youtube.com/watch?v=Hso8yLzkqj8&ab_channel=BigBlueButton';
// The title we match for here is the title of the test video specified by youtubeLink
exports.youtubeFrame = 'div[data-test="videoPlayer"]';
exports.ytFrameTitle = 'a[class^="ytp-title-link"]';
// Toasts
exports.statingUploadPresentationToast = 'To be uploaded ...';
exports.convertingPresentationFileToast = 'Converting file';
exports.presentationUploadedToast = 'Current presentation';

// Settings
exports.languageSelector = 'select[id="langSelector"]';
exports.messageTitle = 'h2[data-test="messageTitle"]';
exports.notesTitle = 'h2[data-test="notesTitle"]';
exports.dataSavingsTab = 'span[id="dataSaving"]';

// User
const userAvatar = 'div[data-test-avatar="userAvatar"]';
const networkDataContainer = 'div[data-test="networkDataContainer"]';
exports.userAvatar = userAvatar;
exports.moderatorAvatar = 'div[data-test="moderatorAvatar"]';
exports.viewerAvatar = 'div[data-test="viewerAvatar"]';
exports.userListItem = 'div[data-test="userListItem"]';
exports.currentUser = 'div[data-test="userListItemCurrent"]';
exports.multiWhiteboardTool = 'span[data-test="multiWhiteboardTool"]';
exports.manageUsers = 'button[data-test="manageUsers"]';
exports.presenterClassName = 'presenter--';
exports.userListToggleBtn = 'button[data-test="toggleUserList"]';
exports.mobileUser = 'span[data-test="mobileUser"]';
exports.connectionStatusBtn = 'button[data-test="connectionStatusButton"]';
exports.connectionStatusModal = 'div[data-test="connectionStatusModal"]';
exports.copyStats = 'span[data-test="copyStats"]';
exports.dataSavingScreenshare = 'input[data-test="dataSavingScreenshare"]';
exports.screenshareLocked = 'button[data-test="screenshareLocked"]';
exports.connectionStatusItemEmpty = 'li[data-test="connectionStatusItemEmpty"]';
exports.connectionStatusTab2 = 'li[id="react-tabs-2"]';
exports.connectionStatusItemUser = 'li[data-test="connectionStatusItemUser"]';
exports.connectionStatusLinkToSettings = `${networkDataContainer} span[role="button"]`;
exports.dataSavingWebcams = 'input[data-test="dataSavingWebcams"]';
exports.connectionStatusOfflineUser = 'div[data-test="offlineUser"]';
exports.videoUploadRateData = 'div[data-test="videoUploadRateData"]';
exports.connectionDataContainer = networkDataContainer;
exports.avatarsWrapperAvatar = 'div[data-test="avatarsWrapperAvatar"]';
exports.guestPolicyLabel = 'li[data-test="guestPolicyLabel"]';
exports.downloadUserNamesList = 'li[data-test="downloadUserNamesList"]';
exports.waitingUsersBtn = 'div[data-test="waitingUsersBtn"]';
exports.joinMeetingDemoPage = 'div[class^="join-meeting"]';
exports.askModerator = 'button[data-test="askModerator"]';
exports.alwaysAccept = 'button[data-test="alwaysAccept"]';
exports.alwaysDeny = 'button[data-test="alwaysDeny"]';
exports.deniedMessageElement = 'p[class="error-message"]';
exports.promoteToModerator = 'li[data-test="promoteToModerator"]';
exports.demoteToViewer = 'li[data-test="demoteToViewer"]';
exports.makePresenter = 'li[data-test="makePresenter"]';
exports.takePresenter = 'li[data-test="takePresenter"]';
exports.muteAll = 'li[data-test="muteAll"]';
exports.muteAllExceptPresenter = 'li[data-test="muteAllExceptPresenter"]';
exports.error403removedLabel = 'You have been removed from the meeting';
exports.removeUser = 'li[data-test="removeUser"]';
exports.removeUserConfirmationBtn = 'button[data-test="removeUserConfirmation"]';
exports.confirmationCheckbox = 'input[id="confirmationCheckbox"]';
exports.userBannedMessage1 = 'div[id="app"] >> div >> div:nth-child(1)';
exports.userBannedMessage2 = 'div[id="app"] >> div >> div:nth-child(2)';
exports.meetingEndedModalTitle = 'div[data-test="meetingEndedModal"]';
exports.unmuteUser = 'li[data-test="unmuteUser"]';
exports.ejectCamera = 'li[data-test="ejectCamera"]';

// Lock Viewers
exports.lockViewersButton = 'li[data-test="lockViewersButton"]';
exports.unlockUserButton = 'li[data-test="unlockUserButton"]';
exports.applyLockSettings = 'button[data-test="applyLockSettings"]';
exports.lockShareWebcam = 'input[data-test="lockShareWebcam"]';
exports.lockSeeOtherViewersWebcam = 'input[data-test="lockSeeOtherViewersWebcam"]';
exports.lockShareMicrophone = 'input[data-test="lockShareMicrophone"]';
exports.lockPublicChat = 'input[data-test="lockPublicChat"]';
exports.lockPrivateChat = 'input[data-test="lockPrivateChat"]';
exports.lockEditSharedNotes = 'input[data-test="lockEditSharedNotes"]';
exports.lockUserList = 'input[data-test="lockUserList"]';
exports.hideViewersAnnotation = 'input[data-test="hideViewersAnnotation"]';
exports.hideViewersCursor = 'input[data-test="hideViewersCursor"]';
exports.whiteboardCursorIndicator = 'div[data-test="whiteboardCursorIndicator"]';

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
exports.webcamContainer = 'video[data-test="videoContainer"]';
exports.webcamVideoItem = 'div[data-test="webcamVideoItem"]';
exports.videoDropdownMenu = 'button[data-test="videoDropdownMenu"]';
exports.advancedVideoSettingsBtn = 'li[data-test="advancedVideoSettingsButton"]';
exports.mirrorWebcamBtn = 'li[data-test="mirrorWebcamBtn"]';
exports.focusWebcamBtn = 'li[data-test="focusWebcamBtn"]';
exports.pinWebcamBtn = 'li[data-test="pinWebcamBtn"]';
exports.webcamsFullscreenButton = 'li[data-test="webcamsFullscreenButton"]';
exports.webcamSettingsTitle = 'span[id="webcam-settings-title"]';
exports.backgroundSettingsTitle = 'span[id="backgrounds-title"]';
exports.selectDefaultBackground = 'button[data-test="selectDefaultBackground"]';
exports.selectCustomBackground = 'button[data-test="selectCustomBackground"]';
exports.removeCustomBackground = 'button[data-test="removeCustomBackground"]';
exports.inputBackgroundButton = 'button[data-test="inputBackgroundButton"]';
exports.noneBackgroundButton = 'button[data-test="noneBackgroundButton"]';
exports.dropAreaBottom = 'div[data-test="dropArea-contentLeft"]';
exports.dropAreaLeft = 'div[data-test="dropArea-contentLeft"]';
exports.dropAreaRight = 'div[data-test="dropArea-contentRight"]';
exports.dropAreaTop = 'div[data-test="dropArea-contentTop"]';
exports.dropAreaSidebarBottom = 'div[data-test="dropArea-sidebarContentBottom"]';
exports.selfViewDisableBtn = 'li[data-test="selfViewDisableBtn"]';

exports.videoQualitySelector = 'select[id="setQuality"]';
exports.webcamItemTalkingUser = 'div[data-test="webcamItemTalkingUser"]';
exports.webcamSettingsModal = 'div[data-test="webcamSettingsModal"]';
exports.dropdownWebcamButton = 'div[data-test="dropdownWebcamButton"]';
exports.webcamMirroredVideoPreview = 'video[data-test="mirroredVideoPreview"]';

// Whiteboard
exports.whiteboard = 'div[data-testid="canvas"]';
exports.wbLayer = 'div[data-testid="layer"]';
exports.wbToolbar = 'div[class^="tlui-toolbar__tools tlui-toolbar__tools__mobile"]';
exports.wbShapesButton = 'button[data-testid="tools.more"]';
exports.wbRectangleShape = 'button[data-testid="tools.rectangle"]';
exports.wbEllipseShape = 'button[data-testid="tools.more.ellipse"]';
exports.wbTriangleShape = 'button[data-testid="tools.more.triangle"]';
exports.wbLineShape = 'button[data-testid="tools.more.line"]';
exports.wbPencilShape = 'button[data-testid="tools.draw"]';
exports.wbStickyNoteShape = 'button[data-testid="tools.note"]';
exports.wbTextShape = 'button[data-testid="tools.text"]';
exports.wbTypedText = 'div[data-shape="text"]';
exports.wbTypedStickyNote = 'div[data-shape-type="note"]';
exports.wbDrawnRectangle = 'div[data-shape-type="geo"]';
exports.wbPollShape = 'div[data-shape-type="poll"]';
exports.wbDrawnLine = 'div[data-shape-type="draw"]';
exports.multiUsersWhiteboardOn = 'button[data-test="turnMultiUsersWhiteboardOn"]';
exports.multiUsersWhiteboardOff = 'button[data-test="turnMultiUsersWhiteboardOff"]';
exports.whiteboardViewBox = 'svg g[clip-path="url(#viewBox)"]';
exports.changeWhiteboardAccess = 'li[data-test="changeWhiteboardAccess"]';
exports.pencil = 'button[data-test="pencilTool"]';
exports.resetZoomButton = 'button[data-test="resetZoomButton"]';
exports.zoomInButton = 'button[data-test="zoomInBtn"]';
exports.zoomOutButton = 'button[data-test="zoomOutBtn"]';
exports.wbPan = 'button[data-test="panButton"]';
exports.wbEraser = 'button[data-testid="tools.eraser"]';
exports.wbArrowShape = 'button[data-testid="tools.arrow"]';
exports.wbDelete = 'span[id="TD-Delete"]';
exports.wbUndo = 'button[data-testid="main.undo"]';
exports.wbRedo = 'button[data-testid="main.redo"]';
exports.wbStyles = 'button[id="TD-Styles"]';
exports.wbColorRed = 'button[data-testid="style.color.red"]';
exports.wbFillDrawing = 'button[data-testid="style.fill.solid"]';
exports.wbDashDotted = 'button[data-testid="style.dash.dotted"]';
exports.wbSizeLarge = 'button[data-testid="style.size.l"]';
exports.wbOptions = 'button[data-testid="main.action-menu"]';
exports.wbDuplicate = 'span[id="TD-Tools-Copy"]';
exports.wbRotate = 'button[data-testid="menu-item.rotate-cw"]';
exports.wbMoveBackward = 'button[data-testid="menu-item.send-backward"]';
exports.wbMoveForward = 'span[id="TD-Tools-ArrowUp"]';
exports.wbMoveToFront = 'span[id="TD-Tools-PinTop"]';
exports.wbPaste = 'button[data-testid="menu-item.paste"]';

// About modal
exports.showAboutModalButton = 'li[data-test="aboutModal"]';
exports.aboutModal = 'div[data-test="aboutModalTitleLabel"]';

// Help button
exports.helpButton = 'li[data-test="helpButton"]';
exports.helpPageTitle = 'BigBlueButton Tutorials | Built For Teachers | BigBlueButton';

// Dark mode
exports.darkModeToggleBtn = 'input[data-test="darkModeToggleBtn"]';
exports.actionsBarBackground = 'section[id="ActionsBar"]';
exports.navbarBackground = 'header[id="Navbar"]';
exports.fullscreenModal = 'div[id="fsmodal"]';
exports.simpleModal = 'div[id="simpleModal"]';
exports.sharedNotesBackground = 'div[data-test="notes"]';
exports.whiteboardOptionsButton = 'button[data-test="whiteboardOptionsButton"]';

// Layout management
exports.manageLayoutBtn = 'li[data-test="manageLayoutBtn"]';
exports.focusOnPresentation = 'button[data-test="presentationFocusLayout"]';
exports.focusOnVideo = 'button[data-test="videoFocusLayout"]';
exports.smartLayout = 'button[data-test="smartLayout"]';
exports.customLayout = 'button[data-test="customLayout"]';
exports.updateLayoutBtn = 'button[data-test="updateLayoutBtn"]';
exports.updateEveryoneLayoutToggle = 'input[data-test="updateEveryoneLayoutToggle"]';
exports.cameraDock = 'div#cameraDock';

// Font size
exports.increaseFontSize = 'button[data-test="increaseFontSize"]';
exports.decreaseFontSize = 'button[data-test="decreaseFontSize"]';

// Learning dashboard
exports.learningDashboard = 'li[data-test="learningDashboard"]';
exports.panels = 'div[role="tablist"]';
exports.messageLearningDashboard = 'td[data-test="userTotalMessagesDashboard"]';
exports.userOnlineTime = 'td[data-test="userOnlineTimeDashboard"]';
exports.confirmRecording = 'div[id="simpleModal"] button:nth-child(1)';
exports.pollTrueFalse = 'button[data-test="pollTrueFalse"]';
exports.pollPanel = 'button[data-test="pollsPanelDashboard"]';
exports.pollTrueFalseQuestion = 'div[role="rowgroup"] div:nth-child(3) div';
exports.pollTrueFalseAnswer = 'div[role="cell"]:nth-child(3)';
exports.pollABCDQuestion = 'div[role="rowgroup"] div:nth-child(4) div';
exports.pollABCDAnswer = 'div[role="cell"]:nth-child(4)';
exports.pollYesNoQuestion = 'div[role="rowgroup"] div:nth-child(5) div';
exports.pollYesNoAnswer = 'div[role="cell"]:nth-child(5)';
exports.pollUserResponseQuestion = 'div[role="rowgroup"] div:nth-child(6) div';
exports.pollUserResponseAnswer = 'div[role="cell"]:nth-child(6)';
exports.pollTotal = 'div[role="cell"]:nth-child(2)';
exports.meetingStatusActiveDashboard = 'span[data-test="meetingStatusActiveDashboard"]';
exports.meetingDurationTimeDashboard = 'p[data-test="meetingDurationTimeDashboard"]';
exports.userNameDashboard = 'td[data-test="userLabelDashboard"] button';
exports.userWebcamTimeDashboard = 'td[data-test="userWebcamTimeDashboard"]';
exports.userRaiseHandDashboard = 'td[data-test="userRaiseHandDashboard"]';
exports.userStatusDashboard = 'td[data-test="userStatusDashboard"]';
exports.userActivityScoreDashboard = 'td[data-test="userActivityScoreDashboard"]';
exports.activityScorePanelDashboard = 'button[data-test="activityScorePanelDashboard"]';
exports.downloadSessionLearningDashboard = 'button[data-test="downloadSessionDataDashboard"]';
