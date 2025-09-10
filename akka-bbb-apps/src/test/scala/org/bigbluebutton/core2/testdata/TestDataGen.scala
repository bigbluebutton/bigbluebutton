package org.bigbluebutton.core2.testdata

import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.util.RandomStringGenerator

object TestDataGen {
  def createRegisteredUser(meetingId: String, users: RegisteredUsers, name: String, role: String,
                          bot: Boolean, guest: Boolean, authed: Boolean, waitForApproval: Boolean, logoutURL: String = ""): RegisteredUser = {
    val id = "w_" + RandomStringGenerator.randomAlphanumericString(16)
    val extId = RandomStringGenerator.randomAlphanumericString(16)
    val authToken = RandomStringGenerator.randomAlphanumericString(16)
    val sessionToken = RandomStringGenerator.randomAlphanumericString(16)
    val avatarURL = "https://www." + RandomStringGenerator.randomAlphanumericString(32) + ".com/" +
      RandomStringGenerator.randomAlphanumericString(10) + ".png"
    val webcamBackgroundURL = "https://www." + RandomStringGenerator.randomAlphanumericString(32) + ".com/" +
      RandomStringGenerator.randomAlphanumericString(10) + ".jpg"
    val color = "#ff6242"

    val ru = RegisteredUsers.create(meetingId, userId = id, extId, name, "", "", role,
      authToken, Vector(sessionToken), avatarURL, webcamBackgroundURL, color, bot,
      guest, authed, GuestStatus.ALLOW, false, "", logoutUrl, Map(), false)

    RegisteredUsers.add(users, ru, meetingId = "test")
    ru
  }

  def createVoiceUserForUser(user: RegisteredUser, callingWith: String, muted: Boolean, listenOnlyInputDevice: Boolean, deafened: Boolean, talking: Boolean,
                             listenOnly: Boolean): VoiceUserState = {
    val voiceUserId = RandomStringGenerator.randomAlphanumericString(8)
    VoiceUserState(
      intId = user.id,
      voiceUserId = voiceUserId,
      meetingId = user.meetingId,
      callingWith,
      callerName = user.name,
      callerNum = user.name,
      color = "#ff6242",
      muted,
      listenOnlyInputDevice,
      deafened,
      talking,
      listenOnly,
      calledInto = "freeswitch",
      lastStatusUpdateOn = System.currentTimeMillis(),
      floor = false,
      lastFloorTime = System.currentTimeMillis().toString(),
      hold = false,
      "9b3f4504-275d-4315-9922-21174262d88c")
  }

  def createFakeVoiceOnlyUser(meetingId: String, callingWith: String, muted: Boolean, listenOnlyInputDevice: Boolean, deafened: Boolean, talking: Boolean,
                              listenOnly: Boolean, name: String): VoiceUserState = {
    val voiceUserId = RandomStringGenerator.randomAlphanumericString(8)
    val intId = "v_" + RandomStringGenerator.randomAlphanumericString(16)
    VoiceUserState(
      intId,
      voiceUserId = voiceUserId,
      meetingId,
      callingWith,
      callerName = name,
      callerNum = name,
      color = "#ff6242",
      muted,
      listenOnlyInputDevice,
      deafened,
      talking,
      listenOnly,
      calledInto = "freeswitch",
      lastStatusUpdateOn = System.currentTimeMillis(),
      floor = false,
      lastFloorTime = System.currentTimeMillis().toString(),
      hold = false,
      "9b3f4504-275d-4315-9922-21174262d88c")
  }

  def createFakeWebcamStreamFor(userId: String, subscribers: Set[String]): WebcamStream = {
    val streamId = RandomStringGenerator.randomAlphanumericString(10)
    WebcamStream(streamId, userId, subscribers)
  }

  def createUserFor(liveMeeting: LiveMeeting, regUser: RegisteredUser, presenter: Boolean): UserState = {
    val u = UserState(intId = regUser.id, extId = regUser.externId, meetingId = regUser.meetingId, name = regUser.name,
      role = regUser.role,bot = regUser.bot, guest = regUser.guest, authed = regUser.authed, guestStatus = regUser.guestStatus,
      reactionEmoji = "none", raiseHand = false, away = false, pin = false, mobile = false,
      locked = false, presenter = false, avatar = regUser.avatarURL, regUser.webcamBackgroundURL, color = "#ff6242",
      clientType = "unknown", userLeftFlag = UserLeftFlag(false, 0))
    Users2x.add(liveMeeting.users2x, u)
    u
  }
}
