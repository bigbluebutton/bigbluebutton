package org.bigbluebutton.core.models

object VoiceUsers {
  def findUserWithVoiceUserId(users: VoiceUsers, voiceUserId: String): Option[VoiceUser2x] = {
    users.toVector find (u => u.intId == voiceUserId)
  }

  def add(users: VoiceUsers, user: VoiceUser2x): Option[VoiceUser2x] = {
    users.save(user)
    Some(user)
  }

  def remove(users: VoiceUsers, intId: String): Option[VoiceUser2x] = {
    users.remove(intId)
  }

  def removeUserWithId(users: VoiceUsers, voiceUserId: String): Option[VoiceUser2x] = {
    users.remove(voiceUserId)
  }
}

class VoiceUsers {
  private var users: Set[VoiceUser2x] = Set.empty
  private var voiceUsersState = new VoiceUsersState

  private def toVector: Vector[VoiceUser2x] = users.toVector

  private def save(user: VoiceUser2x): VoiceUser2x = {
    users = users + user
    user
  }

  private def remove(id: String): Option[VoiceUser2x] = {
    val user = for {
      user <- users.find(u => u.intId == id)

    } yield {
      users = users.filterNot(u => u.intId == id)
      user
    }

    user
  }
}

case class VoiceUser2x(intId: String, voiceUserId: String)
case class VoiceUserVO2x(intId: String, voiceUserId: String, callerName: String,
  callerNum: String, joined: Boolean, locked: Boolean, muted: Boolean,
  talking: Boolean, callingWith: String, listenOnly: Boolean)