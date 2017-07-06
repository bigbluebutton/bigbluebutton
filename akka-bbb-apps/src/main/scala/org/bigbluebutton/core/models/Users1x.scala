package org.bigbluebutton.core.models

import scala.collection.immutable.ListSet
import org.bigbluebutton.core.util.RandomStringGenerator
import com.softwaremill.quicklens.ModifyPimp
import com.softwaremill.quicklens.modify
import org.bigbluebutton.common2.domain.{ UserVO, VoiceUserVO }

object Users1x {

  def newUser(userId: String, lockStatus: Boolean, ru: RegisteredUser, waitingForAcceptance: Boolean,
    vu: VoiceUserVO, users: Users1x): Option[UserVO] = {
    val uvo = new UserVO(userId, ru.externId, ru.name,
      ru.role, ru.guest, ru.authed, waitingForAcceptance = waitingForAcceptance, emojiStatus = "none", presenter = false,
      hasStream = false, locked = lockStatus,
      webcamStreams = new ListSet[String](), phoneUser = false, vu,
      listenOnly = vu.listenOnly, avatarURL = vu.avatarURL, joinedWeb = true)
    users.save(uvo)
    Some(uvo)
  }

  def findWithId(id: String, users: Users1x): Option[UserVO] = users.toVector.find(u => u.id == id)
  def findWithExtId(id: String, users: Users1x): Option[UserVO] = users.toVector.find(u => u.externalId == id)
  def findModerators(users: Users1x): Vector[UserVO] = users.toVector.filter(u => u.role == Roles.MODERATOR_ROLE)
  def findPresenters(users: Users1x): Vector[UserVO] = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE)
  def findViewers(users: Users1x): Vector[UserVO] = users.toVector.filter(u => u.role == Roles.VIEWER_ROLE)
  def hasModerator(users: Users1x): Boolean = users.toVector.filter(u => u.role == Roles.MODERATOR_ROLE).length > 0
  def hasPresenter(users: Users1x): Boolean = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE).length > 0
  def hasNoPresenter(users: Users1x): Boolean = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE).length == 0
  //def hasSessionId(sessionId: String, users: Users): Boolean = {
  //  users.toVector.find(u => usessionId)
  // }
  def hasUserWithId(id: String, users: Users1x): Boolean = {
    findWithId(id, users) match {
      case Some(u) => true
      case None => false
    }
  }
  def numUsers(users: Users1x): Int = users.toVector.size
  def numWebUsers(users: Users1x): Int = users.toVector filter (u => u.phoneUser == false) size
  def numUsersInVoiceConference(users: Users1x): Int = users.toVector filter (u => u.voiceUser.joined) size
  def getUserWithExternalId(id: String, users: Users1x): Option[UserVO] = users.toVector find (u => u.externalId == id)
  def getUserWithVoiceUserId(voiceUserId: String, users: Users1x): Option[UserVO] = users.toVector find (u => u.voiceUser.userId == voiceUserId)
  def getUser(userID: String, users: Users1x): Option[UserVO] = users.toVector find (u => u.id == userID)
  def numModerators(users: Users1x): Int = findModerators(users).length
  def findAModerator(users: Users1x): Option[UserVO] = users.toVector find (u => u.role == Roles.MODERATOR_ROLE)
  def getCurrentPresenter(users: Users1x): Option[UserVO] = users.toVector find (u => u.presenter == true)

  def getUsers(users: Users1x): Vector[UserVO] = users.toVector

  def userLeft(userId: String, users: Users1x): Option[UserVO] = {
    users.remove(userId)
  }

  def unbecomePresenter(userID: String, users: Users1x) = {
    for {
      u <- Users1x.findWithId(userID, users)
      user = modify(u)(_.presenter).setTo(false)
    } yield users.save(user)
  }

  def becomePresenter(userID: String, users: Users1x) = {
    for {
      u <- Users1x.findWithId(userID, users)
      user = modify(u)(_.presenter).setTo(true)
    } yield users.save(user)
  }

  def isModerator(id: String, users: Users1x): Boolean = {
    Users1x.findWithId(id, users) match {
      case Some(user) => return user.role == Roles.MODERATOR_ROLE && !user.waitingForAcceptance
      case None => return false
    }
  }
  def generateWebUserId(users: Users1x): String = {
    val webUserId = RandomStringGenerator.randomAlphanumericString(6)
    if (!hasUserWithId(webUserId, users)) webUserId else generateWebUserId(users)
  }

  def usersWhoAreNotPresenter(users: Users1x): Vector[UserVO] = users.toVector filter (u => u.presenter == false)

  def joinedVoiceListenOnly(userId: String, users: Users1x): Option[UserVO] = {
    for {
      u <- Users1x.findWithId(userId, users)
      vu = u.modify(_.voiceUser.joined).setTo(false)
        .modify(_.voiceUser.talking).setTo(false)
        .modify(_.listenOnly).setTo(true)
    } yield {
      users.save(vu)
      vu
    }
  }

  def leftVoiceListenOnly(userId: String, users: Users1x): Option[UserVO] = {
    for {
      u <- Users1x.findWithId(userId, users)
      vu = u.modify(_.voiceUser.joined).setTo(false)
        .modify(_.voiceUser.talking).setTo(false)
        .modify(_.listenOnly).setTo(false)
    } yield {
      users.save(vu)
      vu
    }
  }

  def lockUser(userId: String, lock: Boolean, users: Users1x): Option[UserVO] = {
    for {
      u <- findWithId(userId, users)
      uvo = u.modify(_.locked).setTo(lock) // u.copy(locked = msg.lock)
    } yield {
      users.save(uvo)
      uvo
    }
  }

  def changeRole(userId: String, users: Users1x, role: String): Option[UserVO] = {
    for {
      u <- findWithId(userId, users)
      uvo = u.modify(_.role).setTo(role)
    } yield {
      users.save(uvo)
      uvo
    }
  }

  def userSharedWebcam(userId: String, users: Users1x, streamId: String): Option[UserVO] = {
    for {
      u <- findWithId(userId, users)
      streams = u.webcamStreams + streamId
      uvo = u.modify(_.hasStream).setTo(true).modify(_.webcamStreams).setTo(streams)
    } yield {
      users.save(uvo)
      uvo
    }
  }

  def userUnsharedWebcam(userId: String, users: Users1x, streamId: String): Option[UserVO] = {

    def findWebcamStream(streams: Set[String], stream: String): Option[String] = {
      streams find (w => w == stream)
    }

    for {
      u <- findWithId(userId, users)
      streamName <- findWebcamStream(u.webcamStreams, streamId)
      streams = u.webcamStreams - streamName
      uvo = u.modify(_.hasStream).setTo(!streams.isEmpty).modify(_.webcamStreams).setTo(streams)
    } yield {
      users.save(uvo)
      uvo
    }
  }

  def setEmojiStatus(userId: String, users: Users1x, emoji: String): Option[UserVO] = {
    for {
      u <- findWithId(userId, users)
      uvo = u.modify(_.emojiStatus).setTo(emoji)
    } yield {
      users.save(uvo)
      uvo
    }
  }

  def setWaitingForAcceptance(user: UserVO, users: Users1x, waitingForAcceptance: Boolean): UserVO = {
    val nu = user.modify(_.waitingForAcceptance).setTo(waitingForAcceptance)
    users.save(nu)
    nu
  }

  def setUserTalking(user: UserVO, users: Users1x, talking: Boolean): UserVO = {
    val nv = user.modify(_.voiceUser.talking).setTo(talking)
    users.save(nv)
    nv
  }

  def setUserMuted(user: UserVO, users: Users1x, muted: Boolean): UserVO = {
    val talking: Boolean = if (muted) false else user.voiceUser.talking
    val nv = user.modify(_.voiceUser.muted).setTo(muted).modify(_.voiceUser.talking).setTo(talking)
    users.save(nv)
    nv
  }

  def resetVoiceUser(user: UserVO, users: Users1x): UserVO = {
    val vu = new VoiceUserVO(user.id, user.id, user.name, user.name,
      joined = false, locked = false, muted = false, talking = false, user.avatarURL, listenOnly = false)

    val nu = user.modify(_.voiceUser).setTo(vu)
      .modify(_.phoneUser).setTo(false)
      .modify(_.listenOnly).setTo(false)
    users.save(nu)
    nu
  }

  def switchUserToPhoneUser(user: UserVO, users: Users1x, voiceUserId: String, userId: String,
    callerIdName: String, callerIdNum: String, muted: Boolean, talking: Boolean,
    avatarURL: String, listenOnly: Boolean): UserVO = {
    val vu = new VoiceUserVO(voiceUserId, userId, callerIdName,
      callerIdNum, joined = true, locked = false,
      muted, talking, avatarURL, listenOnly)
    val nu = user.modify(_.voiceUser).setTo(vu)
      .modify(_.listenOnly).setTo(listenOnly)
    users.save(nu)
    nu
  }

  def restoreMuteState(user: UserVO, users: Users1x, voiceUserId: String, userId: String,
    callerIdName: String, callerIdNum: String, muted: Boolean, talking: Boolean,
    avatarURL: String, listenOnly: Boolean): UserVO = {
    val vu = new VoiceUserVO(voiceUserId, userId, callerIdName,
      callerIdNum, joined = true, locked = false,
      muted, talking, avatarURL, listenOnly)
    val nu = user.modify(_.voiceUser).setTo(vu)
      .modify(_.listenOnly).setTo(listenOnly)
    users.save(nu)
    nu
  }

  def makeUserPhoneUser(vu: VoiceUserVO, users: Users1x, webUserId: String, externUserId: String,
    callerIdName: String, lockStatus: Boolean, listenOnly: Boolean, avatarURL: String): UserVO = {
    val uvo = new UserVO(webUserId, externUserId, callerIdName,
      Roles.VIEWER_ROLE, guest = false, authed = false, waitingForAcceptance = false, emojiStatus = "none", presenter = false,
      hasStream = false, locked = lockStatus,
      webcamStreams = new ListSet[String](),
      phoneUser = !listenOnly, vu, listenOnly = listenOnly, avatarURL = avatarURL, joinedWeb = false)

    users.save(uvo)
    uvo
  }

}

class Users1x {
  private var users: collection.immutable.HashMap[String, UserVO] = new collection.immutable.HashMap[String, UserVO]

  private def toVector: Vector[UserVO] = users.values.toVector

  private def save(user: UserVO): UserVO = {
    users += user.id -> user
    user
  }

  private def remove(id: String): Option[UserVO] = {
    val user = users.get(id)
    user foreach (u => users -= id)
    user
  }
}

case class UserIdAndName(id: String, name: String)

/*
case class UserVO(id: String, externalId: String, name: String, role: String,
  guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emojiStatus: String,
  presenter: Boolean, hasStream: Boolean, locked: Boolean, webcamStreams: Set[String],
  phoneUser: Boolean, voiceUser: VoiceUser, listenOnly: Boolean, avatarURL: String,
  joinedWeb: Boolean)

case class VoiceUser(userId: String, webUserId: String, callerName: String,
  callerNum: String, joined: Boolean, locked: Boolean, muted: Boolean,
  talking: Boolean, avatarURL: String, listenOnly: Boolean)
*/
