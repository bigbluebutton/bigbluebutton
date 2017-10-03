package org.bigbluebutton.core.util

import org.bigbluebutton.common2.domain.{ UserVO, VoiceUserVO }
import org.bigbluebutton.core.models.{ VoiceUserState, UserState }
import scala.collection.immutable.ListSet

object Model1x2xConverter {

  def defaultVoiceUser(intId: String, voiceUserId: String, callerIdName: String, callerIdNum: String, avatar: String): VoiceUserVO = {
    new VoiceUserVO(voiceUserId, intId, callerIdName, callerIdNum, joined = false, locked = false,
      muted = false, talking = false, avatar, listenOnly = false)
  }

  def defaultUserVO(intId: String, extId: String, name: String, role: String, guest: Boolean, authed: Boolean,
                    guestStatus: String, lockStatus: Boolean, vu: VoiceUserVO): UserVO = {
    new UserVO(intId, extId, name, role, guest, authed, guestStatus = guestStatus,
      emojiStatus = "none", presenter = false,
      hasStream = false, locked = lockStatus,
      webcamStreams = new ListSet[String](), phoneUser = false, vu,
      listenOnly = vu.listenOnly, avatarURL = vu.avatarURL, joinedWeb = true)
  }

  def toVoiceUser(vu: VoiceUserState): VoiceUserVO = {
    new VoiceUserVO(vu.voiceUserId, vu.intId, vu.callerName, vu.callerNum, joined = false, locked = false,
      muted = vu.muted, talking = vu.talking, "none", listenOnly = vu.listenOnly)
  }

  def toUserVO(u: UserState, vu: VoiceUserVO, webcams: Vector[String]): UserVO = {

    new UserVO(id = u.intId, externalId = u.extId, name = u.name, role = u.role,
      guest = u.guest, authed = u.authed, guestStatus = u.guestStatus, emojiStatus = u.emoji,
      presenter = u.presenter, hasStream = webcams.length > 0, locked = u.locked, webcamStreams = webcams.toSet,
      phoneUser = false, voiceUser = vu, listenOnly = vu.listenOnly, avatarURL = u.avatar,
      joinedWeb = true)
  }
}
