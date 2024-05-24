package org.bigbluebutton.core

import org.bigbluebutton.ClientSettings
import org.bigbluebutton.common2.domain._
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.MeetingStatus2x

trait AppsTestFixtures {

  val meetingId = "testMeetingId"
  val externalMeetingId = "testExternalMeetingId"
  val parentMeetingId = "testParentMeetingId"
  val sequence = 4
  val meetingName = "test meeting"
  val record = false
  val voiceConfId = "85115"
  val muteOnStart = true
  val durationInMinutes = 10
  val meetingExpireIfNoUserJoinedInMinutes = 5
  val meetingExpireWhenLastUserLeftInMinutes = 10
  val userInactivityInspectTimerInMinutes = 60
  val userInactivityThresholdInMinutes = 10
  val userActivitySignResponseDelayInMinutes = 5
  val autoStartRecording = false
  val keepEvents = false
  val allowStartStopRecording = false
  val webcamsOnlyForModerator = false;
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
  val welcomeMsgForModerators = "Moderator only message"
  val dialNumber = "613-555-1234"
  val maxUsers = 25
  val guestPolicy = "ALWAYS_ASK"
  val allowModsToUnmuteUsers = false
  val allowModsToEjectCameras = false
  val authenticatedGuest = false
  val meetingLayout = ""
  val captureNotesFilename = s"Room 0${sequence} (Notes)"
  val captureSlidesFilename = s"Room 0${sequence} (Whiteboard)"

  val metadata: collection.immutable.Map[String, String] = Map("foo" -> "bar", "bar" -> "baz", "baz" -> "foo")
  val breakoutProps = BreakoutProps(parentId = parentMeetingId, sequence = sequence, 
                                    freeJoin = false, captureNotes = false, captureSlides = false,
                                    breakoutRooms = Vector(), captureNotesFilename = captureNotesFilename,
                                    captureSlidesFilename = captureSlidesFilename)

  val meetingProp = MeetingProp(name = meetingName, extId = externalMeetingId, intId = meetingId,
    meetingCameraCap = meetingCameraCap,
    maxPinnedCameras = maxPinnedCameras,
    isBreakout = isBreakout.booleanValue())
  val durationProps = DurationProps(duration = durationInMinutes, createdTime = createTime, createdDate = createDate,
    meetingExpireIfNoUserJoinedInMinutes = meetingExpireIfNoUserJoinedInMinutes, meetingExpireWhenLastUserLeftInMinutes = meetingExpireWhenLastUserLeftInMinutes,
    userInactivityInspectTimerInMinutes = userInactivityInspectTimerInMinutes, userInactivityThresholdInMinutes = userInactivityInspectTimerInMinutes, userActivitySignResponseDelayInMinutes = userActivitySignResponseDelayInMinutes)
  val password = PasswordProp(moderatorPass = moderatorPassword, viewerPass = viewerPassword, learningDashboardAccessToken = learningDashboardAccessToken)
  val recordProp = RecordProp(record = record, autoStartRecording = autoStartRecording,
    allowStartStopRecording = allowStartStopRecording, keepEvents = keepEvents )
  val welcomeProp = WelcomeProp(welcomeMsg = welcomeMsg, welcomeMsgForModerators = welcomeMsgForModerators)
  val voiceProp = VoiceProp(telVoice = voiceConfId, voiceConf = voiceConfId, dialNumber = dialNumber, muteOnStart = muteOnStart)
  val usersProp = UsersProp(maxUsers = maxUsers, webcamsOnlyForModerator = webcamsOnlyForModerator,
    userCameraCap = userCameraCap,
    guestPolicy = guestPolicy, allowModsToUnmuteUsers = allowModsToUnmuteUsers, allowModsToEjectCameras = allowModsToEjectCameras,
    authenticatedGuest = authenticatedGuest, meetingLayout = meetingLayout)
  val metadataProp = new MetadataProp(metadata)

  val defaultProps = DefaultProps(meetingProp, breakoutProps, durationProps, password, recordProp, welcomeProp, voiceProp,
    usersProp, metadataProp)

  val chatModel = new ChatModel()
  val layouts = new Layouts()
  val wbModel = new WhiteboardModel()
  val presModel = new PresentationModel()
  val breakoutRooms = new BreakoutRooms()
  val registeredUsers = new RegisteredUsers
  val meetingStatux2x = new MeetingStatus2x
  val webcams = new Webcams
  val voiceUsers = new VoiceUsers
  val users2x = new Users2x
  val polls2x = new Polls
  val guestsWaiting = new GuestsWaiting
  val deskshareModel = new ScreenshareModel
  private val audioCaptions = new AudioCaptions
  private val timerModel = new TimerModel

  def newLiveMeeting(): LiveMeeting = {
    val externalVideoModel = new ExternalVideoModel()
    val chatModel = new ChatModel()
    val layouts = new Layouts()
    val pads = new Pads()
    val wbModel = new WhiteboardModel()
    val presModel = new PresentationModel()
    val registeredUsers = new RegisteredUsers
    val meetingStatux2x = new MeetingStatus2x
    val webcams = new Webcams
    val voiceUsers = new VoiceUsers
    val users2x = new Users2x
    val polls2x = new Polls
    val guestsWaiting = new GuestsWaiting
    val deskshareModel = new ScreenshareModel
    val audioCaptions = new AudioCaptions
    val timerModel = new TimerModel
    val clientSettings: Map[String, Object] = ClientSettings.getClientSettingsWithOverride("")

    // We extract the meeting handlers into this class so it is
    // easy to test.
    new LiveMeeting(defaultProps, meetingStatux2x, deskshareModel, audioCaptions, timerModel,
      chatModel, externalVideoModel, layouts, pads, registeredUsers, polls2x, wbModel, presModel,
      webcams, voiceUsers, users2x, guestsWaiting, clientSettings)

  }
}
