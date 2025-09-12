package org.bigbluebutton.core2.testdata

import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting

/**
 * Create fake test data so we can populate meeting.
 */
trait FakeTestData {

  def createFakeUsers(liveMeeting: LiveMeeting): Unit = {
    val mod1 = createUserVoiceAndCam(liveMeeting, Roles.MODERATOR_ROLE, bot = false, false, false, CallingWith.WEBRTC, muted = false,
      talking = true, listenOnly = false)
    Users2x.add(liveMeeting.users2x, mod1)

    val mod2 = createUserVoiceAndCam(liveMeeting, Roles.MODERATOR_ROLE, bot = false, guest = false, authed = true, CallingWith.WEBRTC, muted = false,
      talking = false, listenOnly = false)
    Users2x.add(liveMeeting.users2x, mod2)

    val guest1 = createUserVoiceAndCam(liveMeeting, Roles.VIEWER_ROLE, bot = false, guest = true, authed = true, CallingWith.WEBRTC, muted = false,
      talking = false, listenOnly = false)
    Users2x.add(liveMeeting.users2x, guest1)
    val guestWait1 = GuestWaiting(guest1.intId, guest1.name, guest1.role, guest1.guest, "", "", "#ff6242", guest1.authed, System.currentTimeMillis())
    GuestsWaiting.add(liveMeeting.guestsWaiting, guestWait1)

    val guest2 = createUserVoiceAndCam(liveMeeting, Roles.VIEWER_ROLE, bot = false, guest = true, authed = true, CallingWith.FLASH, muted = false,
      talking = false, listenOnly = false)
    Users2x.add(liveMeeting.users2x, guest2)
    val guestWait2 = GuestWaiting(guest2.intId, guest2.name, guest2.role, guest2.guest, "", "", "#ff6242", guest2.authed, System.currentTimeMillis())
    GuestsWaiting.add(liveMeeting.guestsWaiting, guestWait2)

    val meetingId = liveMeeting.props.meetingProp.intId

    val vu1 = FakeUserGenerator.createFakeVoiceOnlyUser(meetingId, CallingWith.PHONE, muted = false, listenOnlyInputDevice = false, deafened = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu1)

    val vu2 = FakeUserGenerator.createFakeVoiceOnlyUser(meetingId, CallingWith.PHONE, muted = false, listenOnlyInputDevice = false, deafened = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu2)
    val vu3 = FakeUserGenerator.createFakeVoiceOnlyUser(meetingId, CallingWith.PHONE, muted = false, listenOnlyInputDevice = false, deafened = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu3)
    val vu4 = FakeUserGenerator.createFakeVoiceOnlyUser(meetingId, CallingWith.PHONE, muted = false, listenOnlyInputDevice = false, deafened = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu4)
    val vu5 = FakeUserGenerator.createFakeVoiceOnlyUser(meetingId, CallingWith.PHONE, muted = false, listenOnlyInputDevice = false, deafened = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu5)

    for (i <- 1 to 50) {
      val guser = createUserVoiceAndCam(liveMeeting, Roles.MODERATOR_ROLE, bot = false, guest = false, authed = true, CallingWith.WEBRTC, muted = false,
        talking = false, listenOnly = false)
      Users2x.add(liveMeeting.users2x, guser)
    }
  }

  def createUserVoiceAndCam(liveMeeting: LiveMeeting, role: String, bot: Boolean, guest: Boolean, authed: Boolean, callingWith: String,
                            muted: Boolean, talking: Boolean, listenOnly: Boolean): UserState = {

    val ruser1 = FakeUserGenerator.createFakeRegisteredUser(liveMeeting.registeredUsers, Roles.MODERATOR_ROLE, bot = false, true, false, liveMeeting.props.meetingProp.intId)

    val vuser1 = FakeUserGenerator.createFakeVoiceUser(ruser1, "webrtc", muted = false, listenOnlyInputDevice = false, deafened = false, talking = true, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vuser1)

    val rusers = Users2x.findAll(liveMeeting.users2x)
    val others = rusers.filterNot(u => u.intId == ruser1.id)
    val subscribers = others.map { o => o.intId }
    val wstream1 = FakeUserGenerator.createFakeWebcamStreamFor(ruser1.id, subscribers.toSet)
    Webcams.addWebcamStream(liveMeeting.props.meetingProp.intId, liveMeeting.webcams, wstream1)

    createFakeUser(liveMeeting, ruser1)
  }

  def createFakeUser(liveMeeting: LiveMeeting, regUser: RegisteredUser): UserState = {
    UserState(intId = regUser.id, extId = regUser.externId, meetingId = regUser.meetingId,
      name = regUser.name, role = regUser.role, pin = false,
      mobile = false, bot = regUser.bot, guest = regUser.guest, authed = regUser.authed, guestStatus = regUser.guestStatus,
      reactionEmoji = "none", raiseHand = false, away = false, locked = false, presenter = false,
      avatar = regUser.avatarURL, webcamBackground = regUser.webcamBackgroundURL, color = "#ff6242", clientType = "unknown", userLeftFlag = UserLeftFlag(false, 0))
  }

}
