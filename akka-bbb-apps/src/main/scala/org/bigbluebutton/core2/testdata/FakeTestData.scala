package org.bigbluebutton.core2.testdata

import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting

/**
 * Create fake test data so we can populate meeting.
 */
trait FakeTestData {

  def createFakeUsers(liveMeeting: LiveMeeting): Unit = {
    createUserVoiceAndCam(liveMeeting, Roles.MODERATOR_ROLE, false, false, CallingWith.WEBRTC, muted = false,
      talking = true, listenOnly = false)
    createUserVoiceAndCam(liveMeeting, Roles.MODERATOR_ROLE, guest = true, authed = true, CallingWith.WEBRTC, muted = false,
      talking = false, listenOnly = false)
    createUserVoiceAndCam(liveMeeting, Roles.VIEWER_ROLE, guest = true, authed = true, CallingWith.WEBRTC, muted = false,
      talking = false, listenOnly = false)
    createUserVoiceAndCam(liveMeeting, Roles.VIEWER_ROLE, guest = true, authed = true, CallingWith.FLASH, muted = false,
      talking = false, listenOnly = false)

    val vu1 = FakeUserGenerator.createFakeVoiceOnlyUser(CallingWith.PHONE, muted = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu1)

    val vu2 = FakeUserGenerator.createFakeVoiceOnlyUser(CallingWith.PHONE, muted = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu2)
    val vu3 = FakeUserGenerator.createFakeVoiceOnlyUser(CallingWith.PHONE, muted = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu3)
    val vu4 = FakeUserGenerator.createFakeVoiceOnlyUser(CallingWith.PHONE, muted = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu4)
    val vu5 = FakeUserGenerator.createFakeVoiceOnlyUser(CallingWith.PHONE, muted = false, talking = false, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vu5)

  }

  def createUserVoiceAndCam(liveMeeting: LiveMeeting, role: String, guest: Boolean, authed: Boolean, callingWith: String,
                            muted: Boolean, talking: Boolean, listenOnly: Boolean): Unit = {

    val ruser1 = FakeUserGenerator.createFakeRegisteredUser(liveMeeting.registeredUsers, Roles.MODERATOR_ROLE, true, false)

    val vuser1 = FakeUserGenerator.createFakeVoiceUser(ruser1, "webrtc", muted = false, talking = true, listenOnly = false)
    VoiceUsers.add(liveMeeting.voiceUsers, vuser1)

    val rusers = Users2x.findAll(liveMeeting.users2x)
    val others = rusers.filterNot(u => u.intId == ruser1.id)
    val viewers = others.map { o => o.intId }
    val wstream1 = FakeUserGenerator.createFakeWebcamStreamFor(ruser1.id, viewers.toSet)
    Webcams.addWebcamBroadcastStream(liveMeeting.webcams, wstream1)

    createFakeUser(liveMeeting, ruser1)
  }

  def createFakeUser(liveMeeting: LiveMeeting, regUser: RegisteredUser): Unit = {
    val u = UserState(intId = regUser.id, extId = regUser.externId, name = regUser.name, role = regUser.role,
      guest = regUser.guest, authed = regUser.authed, waitingForAcceptance = regUser.waitingForAcceptance,
      emoji = "none", locked = false, presenter = false, avatar = regUser.avatarURL)
    Users2x.add(liveMeeting.users2x, u)
  }
}
