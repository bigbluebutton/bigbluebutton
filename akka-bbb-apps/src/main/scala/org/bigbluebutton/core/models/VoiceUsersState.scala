package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

object VoiceUsersState {
  def findWithId(users: VoiceUsersState, userId: String): Option[VoiceUserState] = users.toVector.find(u => u.intId == userId)
  def add(users: VoiceUsersState, state: VoiceUserState): Option[VoiceUserState] = {
    users.save(state)
    Some(state)
  }

  def remove(users: VoiceUsersState, intId: String): Option[VoiceUserState] = {
    users.remove(intId)
  }

  def joinedVoiceListenOnly(users: VoiceUsersState, userId: String): Option[VoiceUserState] = {
    for {
      u <- findWithId(users, userId)
      vu = u.modify(_.talking).setTo(false)
        .modify(_.listenOnly).setTo(true)
    } yield {
      users.save(vu)
      vu
    }
  }

  def leftVoiceListenOnly(users: VoiceUsersState, userId: String): Option[VoiceUserState] = {
    for {
      u <- findWithId(users, userId)
      vu = u.modify(_.talking).setTo(false)
        .modify(_.listenOnly).setTo(false)
    } yield {
      users.save(vu)
      vu
    }
  }

  def setUserTalking(users: VoiceUsersState, user: VoiceUserState, talking: Boolean): VoiceUserState = {
    val nv = user.modify(_.talking).setTo(talking)
    users.save(nv)
    nv
  }

  def setUserMuted(users: VoiceUsersState, user: VoiceUserState, muted: Boolean): VoiceUserState = {
    val talking: Boolean = if (muted) false else user.talking
    val nv = user.modify(_.muted).setTo(muted).modify(_.talking).setTo(talking)
    users.save(nv)
    nv
  }
}

class VoiceUsersState {
  private var users: collection.immutable.HashMap[String, VoiceUserState] = new collection.immutable.HashMap[String, VoiceUserState]

  private def toVector: Vector[VoiceUserState] = users.values.toVector

  private def save(user: VoiceUserState): VoiceUserState = {
    users += user.intId -> user
    user
  }

  private def remove(intId: String): Option[VoiceUserState] = {
    val user = users.get(intId)
    user foreach (u => users -= intId)
    user
  }
}

object VoiceUserState {

  def setTalking(user: VoiceUserState, talking: Boolean): VoiceUserState = {
    user.modify(_.talking).setTo(talking)
  }
}

case class VoiceUserState(intId: String, voiceUserId: String, callingWith: String, callerName: String,
  callerNum: String, muted: Boolean, talking: Boolean, listenOnly: Boolean)
