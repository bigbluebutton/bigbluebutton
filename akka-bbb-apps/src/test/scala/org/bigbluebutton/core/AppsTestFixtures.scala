package org.bigbluebutton.core

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
  val deskshareConfId = "85115-DESKSHARE"
  val durationInMinutes = 10
  val maxInactivityTimeoutMinutes = 120
  val warnMinutesBeforeMax = 30
  val meetingExpireIfNoUserJoinedInMinutes = 5
  val meetingExpireWhenLastUserLeftInMinutes = 10
  val userInactivityInspectTimerInMinutes = 60
  val userInactivityThresholdInMinutes = 10
  val userActivitySignResponseDelayInMinutes = 5
  val autoStartRecording = false
  val keepEvents = false
  val allowStartStopRecording = false
  val webcamsOnlyForModerator = false;
  val moderatorPassword = "modpass"
  val viewerPassword = "viewpass"
  val createTime = System.currentTimeMillis
  val createDate = "Oct 26, 2015"
  val isBreakout = false
  val welcomeMsgTemplate = "Welcome message template"
  val welcomeMsg = "Welcome message"
  val modOnlyMessage = "Moderator only message"
  val dialNumber = "613-555-1234"
  val maxUsers = 25
  val guestPolicy = "ALWAYS_ASK"
  val allowModsToUnmuteUsers = false

  val red5DeskShareIPTestFixture = "127.0.0.1"
  val red5DeskShareAppTestFixtures = "red5App"
  val metadata: collection.immutable.Map[String, String] = Map("foo" -> "bar", "bar" -> "baz", "baz" -> "foo")
  val screenshareProps = ScreenshareProps("TODO", "TODO", "TODO")
  val breakoutProps = BreakoutProps(parentId = parentMeetingId, sequence = sequence, freeJoin = false, breakoutRooms = Vector())

  val meetingProp = MeetingProp(name = meetingName, extId = externalMeetingId, intId = meetingId,
    isBreakout = isBreakout.booleanValue())
  val durationProps = DurationProps(duration = durationInMinutes, createdTime = createTime, createdDate = createDate, maxInactivityTimeoutMinutes = maxInactivityTimeoutMinutes, warnMinutesBeforeMax = warnMinutesBeforeMax,
    meetingExpireIfNoUserJoinedInMinutes = meetingExpireIfNoUserJoinedInMinutes, meetingExpireWhenLastUserLeftInMinutes = meetingExpireWhenLastUserLeftInMinutes,
    userInactivityInspectTimerInMinutes = userInactivityInspectTimerInMinutes, userInactivityThresholdInMinutes = userInactivityInspectTimerInMinutes, userActivitySignResponseDelayInMinutes = userActivitySignResponseDelayInMinutes)
  val password = PasswordProp(moderatorPass = moderatorPassword, viewerPass = viewerPassword)
  val recordProp = RecordProp(record = record, autoStartRecording = autoStartRecording,
    allowStartStopRecording = allowStartStopRecording, keepEvents = keepEvents )
  val welcomeProp = WelcomeProp(welcomeMsgTemplate = welcomeMsgTemplate, welcomeMsg = welcomeMsg,
    modOnlyMessage = modOnlyMessage)
  val voiceProp = VoiceProp(telVoice = voiceConfId, voiceConf = voiceConfId, dialNumber = dialNumber, muteOnStart = muteOnStart)
  val usersProp = UsersProp(maxUsers = maxUsers, webcamsOnlyForModerator = webcamsOnlyForModerator,
    guestPolicy = guestPolicy, allowModsToUnmuteUsers = allowModsToUnmuteUsers)
  val metadataProp = new MetadataProp(metadata)

  val defaultProps = DefaultProps(meetingProp, breakoutProps, durationProps, password, recordProp, welcomeProp, voiceProp,
    usersProp, metadataProp, screenshareProps)

  val chatModel = new ChatModel()
  val layouts = new Layouts()
  val wbModel = new WhiteboardModel()
  val presModel = new PresentationModel()
  val breakoutRooms = new BreakoutRooms()
  val captionModel = new CaptionModel()
  val notesModel = new SharedNotesModel()
  val registeredUsers = new RegisteredUsers
  val meetingStatux2x = new MeetingStatus2x
  val webcams = new Webcams
  val voiceUsers = new VoiceUsers
  val users2x = new Users2x
  val polls2x = new Polls
  val guestsWaiting = new GuestsWaiting
  val deskshareModel = new ScreenshareModel

  def newLiveMeeting(): LiveMeeting = {
    val chatModel = new ChatModel()
    val layouts = new Layouts()
    val wbModel = new WhiteboardModel()
    val presModel = new PresentationModel()
    val captionModel = new CaptionModel()
    val notesModel = new SharedNotesModel()
    val registeredUsers = new RegisteredUsers
    val meetingStatux2x = new MeetingStatus2x
    val webcams = new Webcams
    val voiceUsers = new VoiceUsers
    val users2x = new Users2x
    val polls2x = new Polls
    val guestsWaiting = new GuestsWaiting
    val deskshareModel = new ScreenshareModel

    // We extract the meeting handlers into this class so it is
    // easy to test.
    new LiveMeeting(defaultProps, meetingStatux2x, deskshareModel, chatModel, layouts,
      registeredUsers, polls2x, wbModel, presModel, captionModel,
      notesModel, webcams, voiceUsers, users2x, guestsWaiting)
  }
}
