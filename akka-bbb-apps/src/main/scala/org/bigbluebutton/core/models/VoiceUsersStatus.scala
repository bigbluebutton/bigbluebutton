package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

object VoiceUsersStatus {
  def findWithId(users: VoiceUsersStatus, userId: String): Option[VoiceStatus] = users.toVector.find(u => u.id == userId)

  def joinedVoiceListenOnly(users: VoiceUsersStatus, userId: String): Option[VoiceStatus] = {
    for {
      u <- findWithId(users, userId)
      vu = u.modify(_.talking).setTo(false)
        .modify(_.listenOnly).setTo(true)
    } yield {
      users.save(vu)
      vu
    }
  }

  def leftVoiceListenOnly(users: VoiceUsersStatus, userId: String): Option[VoiceStatus] = {
    for {
      u <- findWithId(users, userId)
      vu = u.modify(_.talking).setTo(false)
        .modify(_.listenOnly).setTo(false)
    } yield {
      users.save(vu)
      vu
    }
  }

  def setUserTalking(users: VoiceUsersStatus, user: VoiceStatus, talking: Boolean): VoiceStatus = {
    val nv = user.modify(_.talking).setTo(talking)
    users.save(nv)
    nv
  }

  def setUserMuted(users: VoiceUsersStatus, user: VoiceStatus, muted: Boolean): VoiceStatus = {
    val talking: Boolean = if (muted) false else user.talking
    val nv = user.modify(_.muted).setTo(muted).modify(_.talking).setTo(talking)
    users.save(nv)
    nv
  }
}

class VoiceUsersStatus {
  private var users: collection.immutable.HashMap[String, VoiceStatus] = new collection.immutable.HashMap[String, VoiceStatus]

  private def toVector: Vector[VoiceStatus] = users.values.toVector

  private def save(user: VoiceStatus): VoiceStatus = {
    users += user.id -> user
    user
  }

  private def remove(id: String): Option[VoiceStatus] = {
    val user = users.get(id)
    user foreach (u => users -= id)
    user
  }
}

case class VoiceStatus(id: String, voiceUserId: String, callUsing: String, callerName: String,
  callerNum: String, muted: Boolean,
  talking: Boolean, listenOnly: Boolean)
