package org.bigbluebutton.core2.testdata

import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.util.RandomStringGenerator

object TestDataGen {
  def createRegisteredUser(users: RegisteredUsers, name: String, role: String,
                           guest: Boolean, authed: Boolean, waitForApproval: Boolean): RegisteredUser = {
    val id = "w_" + RandomStringGenerator.randomAlphanumericString(16)
    val extId = RandomStringGenerator.randomAlphanumericString(16)
    val authToken = RandomStringGenerator.randomAlphanumericString(16)
    val avatarURL = "https://www." + RandomStringGenerator.randomAlphanumericString(32) + ".com/" +
      RandomStringGenerator.randomAlphanumericString(10) + ".png"

    val ru = RegisteredUsers.create(userId = id, extId, name, role,
      authToken, avatarURL, guest, authed, GuestStatus.ALLOW)

    RegisteredUsers.add(users, ru)
    ru
  }

  def createVoiceUserForUser(user: RegisteredUser, callingWith: String, muted: Boolean, talking: Boolean,
                             listenOnly: Boolean): VoiceUserState = {
    val voiceUserId = RandomStringGenerator.randomAlphanumericString(8)
    VoiceUserState(intId = user.id, voiceUserId = voiceUserId, callingWith, callerName = user.name,
      callerNum = user.name, muted, talking, listenOnly)
  }

  def createFakeVoiceOnlyUser(callingWith: String, muted: Boolean, talking: Boolean,
                              listenOnly: Boolean, name: String): VoiceUserState = {
    val voiceUserId = RandomStringGenerator.randomAlphanumericString(8)
    val intId = "v_" + RandomStringGenerator.randomAlphanumericString(16)
    VoiceUserState(intId, voiceUserId = voiceUserId, callingWith, callerName = name,
      callerNum = name, muted, talking, listenOnly)
  }

  def createFakeWebcamStreamFor(userId: String, viewers: Set[String]): WebcamStream = {
    val streamId = RandomStringGenerator.randomAlphanumericString(10)
    val url = "https://www." + RandomStringGenerator.randomAlphanumericString(32) + ".com/" + streamId
    val attributes = collection.immutable.HashMap("height" -> "600", "width" -> "800", "codec" -> "h264")
    val media = MediaStream(streamId, url: String, userId: String, attributes, viewers)
    WebcamStream(streamId, stream = media)
  }

  def createUserFor(liveMeeting: LiveMeeting, regUser: RegisteredUser, presenter: Boolean): UserState = {
    val u = UserState(intId = regUser.id, extId = regUser.externId, name = regUser.name, role = regUser.role,
      guest = regUser.guest, authed = regUser.authed, guestStatus = regUser.guestStatus,
      emoji = "none", locked = false, presenter = false, avatar = regUser.avatarURL, clientType = "unknown",
      userLeftFlag = UserLeftFlag(false, 0))
    Users2x.add(liveMeeting.users2x, u)
    u
  }
}
