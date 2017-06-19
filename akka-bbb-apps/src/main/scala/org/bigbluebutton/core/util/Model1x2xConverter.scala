package org.bigbluebutton.core.util

import org.bigbluebutton.core.models.{ UserState, UserVO, VoiceUser, VoiceUserState }

import scala.collection.immutable.ListSet

object Model1x2xConverter {

  def defaultVoiceUser(intId: String, voiceUserId: String, callerIdName: String, callerIdNum: String, avatar: String): VoiceUser = {
    new VoiceUser(voiceUserId, intId, callerIdName, callerIdNum, joined = false, locked = false,
      muted = false, talking = false, avatar, listenOnly = false)
  }

  def defaultUserVO(intId: String, extId: String, name: String, role: String, guest: Boolean, authed: Boolean,
    waitingForAcceptance: Boolean, lockStatus: Boolean, vu: VoiceUser): UserVO = {
    new UserVO(intId, extId, name, role, guest, authed, waitingForAcceptance = waitingForAcceptance,
      emojiStatus = "none", presenter = false,
      hasStream = false, locked = lockStatus,
      webcamStreams = new ListSet[String](), phoneUser = false, vu,
      listenOnly = vu.listenOnly, avatarURL = vu.avatarURL, joinedWeb = true)
  }

  def toVoiceUser(vu: VoiceUserState): VoiceUser = {
    new VoiceUser(vu.voiceUserId, vu.intId, vu.callerName, vu.callerNum, joined = false, locked = false,
      muted = vu.muted, talking = vu.talking, "none", listenOnly = vu.listenOnly)
  }

  def toUserVO(u: UserState, vu: VoiceUser, webcams: Vector[String]): UserVO = {

    new UserVO(id = u.intId, externalId = u.extId, name = u.name, role = u.role,
      guest = u.guest, authed = u.authed, waitingForAcceptance = u.waitingForAcceptance, emojiStatus = u.emoji,
      presenter = u.presenter, hasStream = webcams.length > 0, locked = u.locked, webcamStreams = webcams.toSet,
      phoneUser = false, voiceUser = vu, listenOnly = vu.listenOnly, avatarURL = u.avatar,
      joinedWeb = true)
  }
}
