package org.bigbluebutton.core.models

object VoiceUsers {
  def findUserWithVoiceUserId(users: VoiceUsers, voiceUserId: String): Option[VoiceUser2x] = {
    users.toVector find (u => u.id == voiceUserId)
  }

}

class VoiceUsers {
  private var users: collection.immutable.HashMap[String, VoiceUser2x] =
    new collection.immutable.HashMap[String, VoiceUser2x]

  private def toVector: Vector[VoiceUser2x] = users.values.toVector

  private def save(user: VoiceUser2x): VoiceUser2x = {
    users += user.id -> user
    user
  }

  private def remove(id: String): Option[VoiceUser2x] = {
    val user = users.get(id)
    user foreach (u => users -= id)
    user
  }
}

case class VoiceUser2x(id: String, voiceUserId: String)
