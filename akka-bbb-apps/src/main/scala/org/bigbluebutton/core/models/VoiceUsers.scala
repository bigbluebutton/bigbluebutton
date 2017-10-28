package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

object VoiceUsers {
  def findWithVoiceUserId(users: VoiceUsers, voiceUserId: String): Option[VoiceUserState] = {
    users.toVector find (u => u.voiceUserId == voiceUserId)
  }

  def findWIthIntId(users: VoiceUsers, intId: String): Option[VoiceUserState] = {
    users.toVector.find(u => u.intId == intId)
  }

  def findAll(users: VoiceUsers): Vector[VoiceUserState] = users.toVector

  def findAllNonListenOnlyVoiceUsers(users: VoiceUsers): Vector[VoiceUserState] = users.toVector.filter(u => u.listenOnly == false)

  def add(users: VoiceUsers, user: VoiceUserState): Unit = {
    users.save(user)
  }

  def removeWithIntId(users: VoiceUsers, intId: String): Option[VoiceUserState] = {
    users.remove(intId)
  }

  def findWithIntId(users: VoiceUsers, intId: String): Option[VoiceUserState] = {
    users.toVector.find(u => u.intId == intId)
  }

  def recoverVoiceUser(users: VoiceUsers, intId: String): Option[VoiceUserState] = {
    users.removeFromCache(intId)
  }

  def userMuted(users: VoiceUsers, voiceUserId: String, muted: Boolean): Option[VoiceUserState] = {
    for {
      u <- findWithVoiceUserId(users, voiceUserId)
    } yield {
      val vu = u.modify(_.muted).setTo(muted)
        .modify(_.talking).setTo(false)
      users.save(vu)
      vu
    }
  }

  def userTalking(users: VoiceUsers, voiceUserId: String, talkng: Boolean): Option[VoiceUserState] = {
    for {
      u <- findWithVoiceUserId(users, voiceUserId)
    } yield {
      val vu = u.modify(_.muted).setTo(false)
        .modify(_.talking).setTo(talkng)
      users.save(vu)
      vu
    }
  }

  def joinedVoiceListenOnly(users: VoiceUsers, userId: String): Option[VoiceUserState] = {
    for {
      u <- findWIthIntId(users, userId)
    } yield {
      val vu = u.modify(_.muted).setTo(true)
        .modify(_.talking).setTo(false)
      users.save(vu)
      vu
    }
  }

  def leftVoiceListenOnly(users: VoiceUsers, userId: String): Option[VoiceUserState] = {
    for {
      u <- findWIthIntId(users, userId)
    } yield {
      val vu = u.modify(_.muted).setTo(false)
        .modify(_.talking).setTo(false)
      users.save(vu)
      vu
    }
  }
}

class VoiceUsers {
  private var users: collection.immutable.HashMap[String, VoiceUserState] = new collection.immutable.HashMap[String, VoiceUserState]

  // Collection of users that left the meeting. We keep a cache of the old users state to recover in case
  // the user reconnected by refreshing the client. (ralam june 13, 2017)
  private var usersCache: collection.immutable.HashMap[String, VoiceUserState] = new collection.immutable.HashMap[String, VoiceUserState]

  private def toVector: Vector[VoiceUserState] = users.values.toVector

  private def save(user: VoiceUserState): VoiceUserState = {
    users += user.intId -> user
    user
  }

  private def remove(intId: String): Option[VoiceUserState] = {
    for {
      user <- users.get(intId)
    } yield {
      users -= intId
      saveToCache(user)
      user
    }
  }

  private def saveToCache(user: VoiceUserState): Unit = {
    usersCache += user.intId -> user
  }

  private def removeFromCache(intId: String): Option[VoiceUserState] = {
    for {
      user <- usersCache.get(intId)
    } yield {
      usersCache -= intId
      user
    }
  }
}

case class VoiceUser2x(intId: String, voiceUserId: String)
case class VoiceUserVO2x(intId: String, voiceUserId: String, callerName: String,
                         callerNum: String, joined: Boolean, locked: Boolean, muted: Boolean,
                         talking: Boolean, callingWith: String, listenOnly: Boolean)

case class VoiceUserState(intId: String, voiceUserId: String, callingWith: String, callerName: String,
                          callerNum: String, muted: Boolean, talking: Boolean, listenOnly: Boolean)