package org.bigbluebutton.common2

import org.bigbluebutton.common2.domain._

trait TestFixtures {
  val meetingId = "testMeetingId"
  val externalMeetingId = "testExternalMeetingId"
  val parentMeetingId = "testParentMeetingId"
  val sequence = 4
  val meetingName = "test meeting"
  val record = false
  val voiceConfId = "85115"
  val durationInSeconds = 10

  val meetingExpireIfNoUserJoinedInMinutes = 5
  val meetingExpireWhenLastUserLeftInMinutes = 10
  val userInactivityInspectTimerInMinutes = 60
  val userInactivityThresholdInMinutes = 10
  val userActivitySignResponseDelayInMinutes = 5
  val endWhenNoModerator = false
  val endWhenNoModeratorDelayInMinutes = 1

  val autoStartRecording = false
  val allowStartStopRecording = false
  val recordFullDurationMedia = false
  val webcamsOnlyForModerator = false
  val meetingCameraCap = 0
  val userCameraCap = 0
  val maxPinnedCameras = 3
  val cameraBridge = "testCameraBridge"
  val screenShareBridge = "testScreenShareBridge"
  val audioBridge = "testAudioBridge"
  val moderatorPassword = "modpass"
  val viewerPassword = "viewpass"
  val learningDashboardAccessToken = "ldToken"
  val createTime = System.currentTimeMillis
  val createDate = "Oct 26, 2015"
  val isBreakout = false
  val welcomeMsg = "Welcome message"
  val welcomeMsgForModerators = "Moderator only message"
  val dialNumber = "613-555-1234"
  val maxUsers = 25
  val muteOnStart = false
  val allowModsToUnmuteUsers = false
  val requireUserConsentBeforeUnmuting = false
  val allowModsToEjectCameras = false
  val allowModsToRequestCameraShare = false
  val hideUsersWithoutCamera = false
  val keepEvents = false
  val guestPolicy = "ALWAYS_ASK"
  val authenticatedGuest = false
  val allowPromoteGuestToModerator = false
  val metadata: collection.immutable.Map[String, String] = Map("foo" -> "bar", "bar" -> "baz", "baz" -> "foo")
  val captureNotesFilename = s"Room 0${sequence} (Notes)"
  val captureSlidesFilename = s"Room 0${sequence} (Whiteboard)"
  val maxUserConcurrentAccesses = 3
  val multiUserWhiteboardEnabled = false
  val meetingLayout = "SMART_LAYOUT"
  val waitingGuestUsersTimeout = 30000L
  val breakoutRecord = false
  val privateChatEnabled = true
  val disabledFeatures = Vector("chat")
  val notifyRecordingIsOn = false
  val notifyRecordingAppend = ""
  val presentationUploadExternalDescription = ""
  val presentationUploadExternalUrl = ""
  val loginUrl = ""
  val logoutUrl = "https://bigbluebutton.org"
  val overrideClientSettings = ""

  val meetingProp = MeetingProp(name = meetingName, extId = externalMeetingId, intId = meetingId,
    meetingCameraCap = meetingCameraCap,
    sharedNotesInitialContentJson = Vector(),
    maxPinnedCameras = maxPinnedCameras,
    cameraBridge = cameraBridge,
    screenShareBridge = screenShareBridge,
    audioBridge = audioBridge,
    isBreakout = isBreakout.booleanValue(),
    disabledFeatures = disabledFeatures,
    notifyRecordingIsOn = notifyRecordingIsOn,
    notifyRecordingAppend = notifyRecordingAppend,
    presentationUploadExternalDescription = presentationUploadExternalDescription,
    presentationUploadExternalUrl = presentationUploadExternalUrl)
  val breakoutProps = BreakoutProps(parentId = parentMeetingId, sequence = sequence, freeJoin = false, breakoutRooms = Vector(),
    record = breakoutRecord, privateChatEnabled = privateChatEnabled, captureNotes = false, captureSlides = false,
    captureNotesFilename = captureNotesFilename, captureSlidesFilename = captureSlidesFilename)

  val durationProps = DurationProps(duration = durationInSeconds, createdTime = createTime, createdDate = createDate,
    meetingExpireIfNoUserJoinedInMinutes = meetingExpireIfNoUserJoinedInMinutes, meetingExpireWhenLastUserLeftInMinutes = meetingExpireWhenLastUserLeftInMinutes,
    userInactivityInspectTimerInMinutes = userInactivityInspectTimerInMinutes, userInactivityThresholdInMinutes = userInactivityThresholdInMinutes, userActivitySignResponseDelayInMinutes = userActivitySignResponseDelayInMinutes,
    endWhenNoModerator = endWhenNoModerator, endWhenNoModeratorDelayInMinutes = endWhenNoModeratorDelayInMinutes)
  val password = PasswordProp(moderatorPass = moderatorPassword, viewerPass = viewerPassword,  learningDashboardAccessToken = learningDashboardAccessToken)
  val recordProp = RecordProp(record = record, autoStartRecording = autoStartRecording,
    allowStartStopRecording = allowStartStopRecording,
    recordFullDurationMedia = recordFullDurationMedia,
    keepEvents = keepEvents
  )
  val welcomeProp = WelcomeProp(welcomeMsg = welcomeMsg, welcomeMsgForModerators = welcomeMsgForModerators)
  val voiceProp = VoiceProp(telVoice = voiceConfId, voiceConf = voiceConfId, dialNumber = dialNumber, muteOnStart = muteOnStart)
  val usersProp = UsersProp(maxUsers = maxUsers, maxUserConcurrentAccesses = maxUserConcurrentAccesses,
    webcamsOnlyForModerator = webcamsOnlyForModerator, multiUserWhiteboardEnabled = multiUserWhiteboardEnabled,
    userCameraCap = userCameraCap, guestPolicy = guestPolicy, meetingLayout = meetingLayout,
    hideUsersWithoutCamera = hideUsersWithoutCamera, allowModsToUnmuteUsers = allowModsToUnmuteUsers,
    requireUserConsentBeforeUnmuting = requireUserConsentBeforeUnmuting, allowModsToEjectCameras = allowModsToEjectCameras,
    allowModsToRequestCameraShare = allowModsToRequestCameraShare, authenticatedGuest = authenticatedGuest,
    allowPromoteGuestToModerator = allowPromoteGuestToModerator, waitingGuestUsersTimeout = waitingGuestUsersTimeout)
  val metadataProp = new MetadataProp(metadata)
  val lockSettingsProps = LockSettingsProps(disableCam = false, disableMic = false, disablePrivateChat = false,
    disablePublicChat = false, disableNotes = false, hideUserList = false, lockOnJoin = true,
    lockOnJoinConfigurable = false, hideViewersCursor = false, hideViewersAnnotation = false, presenterPolicy = "")
  val systemProps = SystemProps(loginUrl = loginUrl, logoutUrl = logoutUrl, customLogoURL = "", customDarkLogoURL = "",
    bannerText = "", bannerColor = "", html5PluginSdkVersion = "")
  val defaultProps = DefaultProps(pluginProp = new java.util.HashMap[String, AnyRef](), meetingProp = meetingProp,
    breakoutProps = breakoutProps, durationProps = durationProps, password = password, recordProp = recordProp,
    welcomeProp = welcomeProp, voiceProp = voiceProp, usersProp = usersProp, metadataProp = metadataProp,
    lockSettingsProps = lockSettingsProps, systemProps = systemProps, groups = Vector(),
    overrideClientSettings = overrideClientSettings)
}
