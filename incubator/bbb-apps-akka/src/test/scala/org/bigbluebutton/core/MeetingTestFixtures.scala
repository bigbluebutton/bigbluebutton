package org.bigbluebutton.core

import org.bigbluebutton.core.api.{ NewUserPresence2x, RegisterUser2xCommand, TimestampGenerator, ValidateAuthToken }
import org.bigbluebutton.core.domain.{ VoiceConf, Welcome, _ }
import org.bigbluebutton.core.models.{ MeetingStatus => _, _ }

trait MeetingTestFixtures {
  val piliIntMeetingId = IntMeetingId("pili-pinas-2016")
  val piliExtMeetingId = ExtMeetingId("Pili-Pinas-2016")
  val piliMeetingName = Name("Pili Pinas 2016")
  val piliRecorded = Recorded(true)
  val voiceConf = VoiceConf("85115")
  val duration = 120
  val autoStartRecording = false
  val allowStartStopRecording = true
  val maxUsers = 5
  val allowVoiceOnly = false
  val isBreakout = false

  val du30IntUserId = IntUserId("du30")
  val du30ExtUserId = ExtUserId("DU30")
  val du30UserName = Name("Rody Duterte")
  val du30Roles: Set[Role2x] = Set(ModeratorRole, PresenterRole)
  val du30AuthToken = AuthToken("Du30LetMeWin!")
  val du30Avatar = Avatar("http://www.gravatar.com/sdsdas")
  val du30LogoutUrl = LogoutUrl("http://www.amoutofhere.com")
  val du30Welcome = Welcome("Hello World!")
  val du30DialNums: Set[DialNumber] = Set(DialNumber("6135551234"))

  val du30RegisteredUser = RegisteredUsers2x.create(
    du30IntUserId,
    du30ExtUserId,
    du30UserName,
    du30Roles,
    du30AuthToken,
    du30Avatar,
    du30LogoutUrl,
    du30Welcome,
    du30DialNums,
    PinNumber(85115001),
    Set("config1", "config2"),
    Set("data12", "data2"))

  val du30User = User3x.create(du30IntUserId, du30ExtUserId, du30UserName, du30Roles)

  val mdsIntUserId = IntUserId("mds")
  val mdsExtUserId = ExtUserId("MDS")
  val mdsUserName = Name("Miriam Santiago")
  val mdsRoles: Set[Role2x] = Set(ViewerRole)
  val mdsAuthToken = AuthToken("MdsLetMeWin!")
  val mdsAvatar = Avatar("http://www.gravatar.com/sdsdas")
  val mdsLogoutUrl = LogoutUrl("http://www.amoutofhere.com")
  val mdsWelcome = Welcome("Hello World!")
  val mdsDialNums = Set(DialNumber("6135551234"))

  val mdsRegisteredUser = RegisteredUsers2x.create(
    mdsIntUserId,
    mdsExtUserId,
    mdsUserName,
    mdsRoles,
    mdsAuthToken,
    mdsAvatar,
    mdsLogoutUrl,
    mdsWelcome,
    mdsDialNums,
    PinNumber(85115002),
    Set("config1", "config2"),
    Set("data12", "data2"))

  val mdsUser = User3x.create(mdsIntUserId, mdsExtUserId, mdsUserName, mdsRoles)

  val graceIntUserId = IntUserId("grace")
  val graceExtUserId = ExtUserId("GRACE")
  val graceUserName = Name("Grace Poe")
  val graceRoles: Set[Role2x] = Set(ViewerRole)
  val graceAuthToken = AuthToken("GraceLetMeWin!")
  val graceAvatar = Avatar("http://www.gravatar.com/sdsdas")
  val graceLogoutUrl = LogoutUrl("http://www.amoutofhere.com")
  val graceWelcome = Welcome("Hello World!")
  val graceDialNums = Set(DialNumber("6135551234"))

  val graceRegisteredUser = RegisteredUsers2x.create(
    graceIntUserId,
    graceExtUserId,
    graceUserName,
    graceRoles,
    graceAuthToken,
    graceAvatar,
    graceLogoutUrl,
    graceWelcome,
    graceDialNums,
    PinNumber(85115003),
    Set("config1", "config2"),
    Set("data12", "data2"))

  val graceUser = User3x.create(graceIntUserId, graceExtUserId, graceUserName, graceRoles)

  val marIntUserId = IntUserId("mar")
  val marExtUserId = ExtUserId("MAR")
  val marUserName = Name("Mar Roxas")
  val marRoles: Set[Role2x] = Set(ViewerRole)
  val marAuthToken = AuthToken("MarLetMeWin!")
  val marAvatar = Avatar("http://www.gravatar.com/sdsdas")
  val marLogoutUrl = LogoutUrl("http://www.amoutofhere.com")
  val marWelcome = Welcome("Hello World!")
  val marDialNums = Set(DialNumber("6135551234"))

  val marRegisteredUser = RegisteredUsers2x.create(
    marIntUserId,
    marExtUserId,
    marUserName,
    marRoles,
    marAuthToken,
    marAvatar,
    marLogoutUrl,
    marWelcome,
    marDialNums,
    PinNumber(85115004),
    Set("config1", "config2"),
    Set("data12", "data2"))

  val marUser = User3x.create(marIntUserId, marExtUserId, marUserName, marRoles)

  val jbIntUserId = IntUserId("jb")
  val jbExtUserId = ExtUserId("jb")
  val jbUserName = Name("Jojemar Binay")
  val jbRoles: Set[Role2x] = Set(ViewerRole)
  val jbAuthToken = AuthToken("jbLetMeIn!")
  val jbAvatar = Avatar("http://www.gravatar.com/sdsdas")
  val jbLogoutUrl = LogoutUrl("http://www.amoutofhere.com")
  val jbWelcome = Welcome("Hello World!")
  val jbDialNums = Set(DialNumber("6135551234"))

  val jbRegisteredUser = RegisteredUsers2x.create(
    jbIntUserId,
    jbExtUserId,
    jbUserName,
    jbRoles,
    jbAuthToken,
    jbAvatar,
    jbLogoutUrl,
    jbWelcome,
    jbDialNums,
    PinNumber(85115005),
    Set("config1", "config2"),
    Set("data12", "data2"))

  val jbUser = User3x.create(marIntUserId, marExtUserId, marUserName, marRoles)

  val extensionProp = new MeetingExtensionProp
  val recordingProp = new MeetingRecordingProp

  val piliProps: MeetingProperties2x = MeetingProperties2x(
    piliIntMeetingId,
    piliExtMeetingId,
    piliMeetingName,
    voiceConf,
    duration,
    maxUsers,
    allowVoiceOnly,
    isBreakout,
    extensionProp,
    recordingProp)

  val abilities: MeetingPermissions = new MeetingPermissions
  val registeredUsers = new RegisteredUsers2x
  val users = new Users3x
  val chats = new ChatModel
  val layouts = new LayoutModel
  val polls = new PollModel
  val whiteboards = new WhiteboardModel
  val presentations = new PresentationModel
  val breakoutRooms = new BreakoutRoomModel
  val captions = new CaptionModel
  val extension: MeetingExtensionStatus = new MeetingExtensionStatus

  val du30RegisterUserCommand = RegisterUser2xCommand(
    piliIntMeetingId,
    du30IntUserId,
    du30UserName,
    Set(ModeratorRole),
    du30ExtUserId,
    du30AuthToken,
    du30Avatar,
    du30LogoutUrl,
    du30Welcome,
    du30DialNums,
    Set("config1", "config2"),
    Set("data12", "data2"))

  val du30ValidateAuthTokenCommand = new ValidateAuthToken(
    piliIntMeetingId,
    du30IntUserId,
    du30AuthToken,
    "none",
    "none")

  val du30UserJoinCommand: NewUserPresence2x = new NewUserPresence2x(
    piliIntMeetingId,
    du30IntUserId,
    du30AuthToken,
    SessionId("session-1"),
    PresenceId("presence-1"),
    FlashWebUserAgent)
}
