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
  val durationInMinutes = 10

  val meetingExpireIfNoUserJoinedInMinutes = 5
  val meetingExpireWhenLastUserLeftInMinutes = 10
  val userInactivityInspectTimerInMinutes = 60
  val userInactivityThresholdInMinutes = 10
  val userActivitySignResponseDelayInMinutes = 5
  val endWhenNoModerator = false
  val endWhenNoModeratorDelayInMinutes = 1

  val autoStartRecording = false
  val allowStartStopRecording = false
  val webcamsOnlyForModerator = false
  val meetingCameraCap = 0
  val userCameraCap = 0
  val maxPinnedCameras = 3
  val moderatorPassword = "modpass"
  val viewerPassword = "viewpass"
  val learningDashboardAccessToken = "ldToken"
  val createTime = System.currentTimeMillis
  val createDate = "Oct 26, 2015"
  val isBreakout = false
  val welcomeMsgTemplate = "Welcome message template"
  val welcomeMsg = "Welcome message"
  val modOnlyMessage = "Moderator only message"
  val dialNumber = "613-555-1234"
  val maxUsers = 25
  val muteOnStart = false
  val allowModsToUnmuteUsers = false
  val allowModsToEjectCameras = false
  val keepEvents = false
  val guestPolicy = "ALWAYS_ASK"
  val authenticatedGuest = false
  val metadata: collection.immutable.Map[String, String] = Map("foo" -> "bar", "bar" -> "baz", "baz" -> "foo")
  val captureNotesFilename = s"Room 0${sequence} (Notes)"
  val captureSlidesFilename = s"Room 0${sequence} (Whiteboard)"

  val meetingProp = MeetingProp(name = meetingName, extId = externalMeetingId, intId = meetingId,
    meetingCameraCap = meetingCameraCap,
    maxPinnedCameras = maxPinnedCameras,
    isBreakout = isBreakout.booleanValue())
  val breakoutProps = BreakoutProps(parentId = parentMeetingId, sequence = sequence, freeJoin = false, captureNotes = false,
                                    captureSlides = false, breakoutRooms = Vector(),
                                    endWhenNoModerator = endWhenNoModerator, endWhenNoModeratorDelayInMinutes = endWhenNoModeratorDelayInMinutes,
                                    captureNotesFilename = captureNotesFilename, captureSlidesFilename = captureSlidesFilename)

  val durationProps = DurationProps(duration = durationInMinutes, createdTime = createTime, createdDate = createDate,
    meetingExpireIfNoUserJoinedInMinutes = meetingExpireIfNoUserJoinedInMinutes, meetingExpireWhenLastUserLeftInMinutes = meetingExpireWhenLastUserLeftInMinutes,
    userInactivityInspectTimerInMinutes = userInactivityInspectTimerInMinutes, userInactivityThresholdInMinutes = userInactivityInspectTimerInMinutes, userActivitySignResponseDelayInMinutes = userActivitySignResponseDelayInMinutes)
  val password = PasswordProp(moderatorPass = moderatorPassword, viewerPass = viewerPassword,  learningDashboardAccessToken = learningDashboardAccessToken)
  val recordProp = RecordProp(record = record, autoStartRecording = autoStartRecording,
    allowStartStopRecording = allowStartStopRecording, keepEvents = keepEvents)
  val welcomeProp = WelcomeProp(welcomeMsgTemplate = welcomeMsgTemplate, welcomeMsg = welcomeMsg,
    modOnlyMessage = modOnlyMessage)
  val voiceProp = VoiceProp(telVoice = voiceConfId, voiceConf = voiceConfId, dialNumber = dialNumber, muteOnStart = muteOnStart)
  val usersProp = UsersProp(maxUsers = maxUsers, webcamsOnlyForModerator = webcamsOnlyForModerator,
    userCameraCap = userCameraCap,
    guestPolicy = guestPolicy, allowModsToUnmuteUsers = allowModsToUnmuteUsers, allowModsToEjectCameras = allowModsToEjectCameras, authenticatedGuest = authenticatedGuest)
  val metadataProp = new MetadataProp(metadata)
  val defaultProps = DefaultProps(meetingProp, breakoutProps, durationProps, password, recordProp, welcomeProp, voiceProp,
    usersProp, metadataProp)
}
