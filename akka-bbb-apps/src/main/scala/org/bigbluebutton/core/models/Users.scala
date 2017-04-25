package org.bigbluebutton.core.models

import org.bigbluebutton.core.util.RandomStringGenerator
import com.softwaremill.quicklens._

object Roles {
  val MODERATOR_ROLE = "MODERATOR"
  val PRESENTER_ROLE = "PRESENTER"
  val VIEWER_ROLE = "VIEWER"
  val GUEST_ROLE = "GUEST"
}

object Users {
  def findWithId(id: String, users: Vector[UserVO]): Option[UserVO] = users.find(u => u.id == id)
  def findWithExtId(id: String, users: Vector[UserVO]): Option[UserVO] = users.find(u => u.externalId == id)
  def findModerators(users: Vector[UserVO]): Vector[UserVO] = users.filter(u => u.role == Roles.MODERATOR_ROLE)
  def findPresenters(users: Vector[UserVO]): Vector[UserVO] = users.filter(u => u.role == Roles.PRESENTER_ROLE)
  def findViewers(users: Vector[UserVO]): Vector[UserVO] = users.filter(u => u.role == Roles.VIEWER_ROLE)
  def hasModerator(users: Vector[UserVO]): Boolean = users.filter(u => u.role == Roles.MODERATOR_ROLE).length > 0
  def hasPresenter(users: Vector[UserVO]): Boolean = users.filter(u => u.role == Roles.PRESENTER_ROLE).length > 0
  def hasNoPresenter(users: Vector[UserVO]): Boolean = users.filter(u => u.role == Roles.PRESENTER_ROLE).length == 0
  def hasSessionId(sessionId: String, users: Vector[UserVO]): Boolean = users.contains(sessionId)
  def hasUserWithId(id: String, users: Vector[UserVO]): Boolean = users.contains(id)
  def numUsers(users: Vector[UserVO]): Int = users.size
  def numWebUsers(users: Vector[UserVO]): Int = users filter (u => u.phoneUser == false) size
  def numUsersInVoiceConference(users: Vector[UserVO]): Int = users filter (u => u.voiceUser.joined) size
  def getUserWithExternalId(id: String, users: Vector[UserVO]): Option[UserVO] = users find (u => u.externalId == id)
  def getUserWithVoiceUserId(voiceUserId: String, users: Vector[UserVO]): Option[UserVO] = users find (u => u.voiceUser.userId == voiceUserId)
  def getUser(userID: String, users: Vector[UserVO]): Option[UserVO] = users find (u => u.id == userID)
  def numModerators(users: Vector[UserVO]): Int = findModerators(users).length
  def findAModerator(users: Vector[UserVO]): Option[UserVO] = users find (u => u.role == Roles.MODERATOR_ROLE)
  def getCurrentPresenter(users: Vector[UserVO]): Option[UserVO] = users find (u => u.presenter == true)

  def unbecomePresenter(userID: String, users: Users) = {
    for {
      u <- Users.findWithId(userID, users.toVector)
      user = modify(u)(_.presenter).setTo(false)
    } yield users.save(user)
  }

  def becomePresenter(userID: String, users: Users) = {
    for {
      u <- Users.findWithId(userID, users.toVector)
      user = modify(u)(_.presenter).setTo(true)
    } yield users.save(user)
  }

  def isModerator(id: String, users: Vector[UserVO]): Boolean = {
    Users.findWithId(id, users) match {
      case Some(user) => return user.role == Roles.MODERATOR_ROLE && !user.waitingForAcceptance
      case None => return false
    }
  }
  def generateWebUserId(users: Vector[UserVO]): String = {
    val webUserId = RandomStringGenerator.randomAlphanumericString(6)
    if (!hasUserWithId(webUserId, users)) webUserId else generateWebUserId(users)
  }

  def usersWhoAreNotPresenter(users: Vector[UserVO]): Vector[UserVO] = users filter (u => u.presenter == false)

  def setListenOnly(userId: String, users: Users): Option[UserVO] = {
    for {
      u <- Users.findWithId(userId, users.toVector)
      vu = u.modify(_.voiceUser.joined).setTo(false)
        .modify(_.voiceUser.talking).setTo(false)
        .modify(_.listenOnly).setTo(true)
    } yield {
      users.save(vu)
      vu
    }
  }
}

class Users {
  private var users: collection.immutable.HashMap[String, UserVO] = new collection.immutable.HashMap[String, UserVO]

  def toVector: Vector[UserVO] = users.values.toVector

  def save(user: UserVO): UserVO = {
    users += user.id -> user
    user
  }

  def remove(id: String): Option[UserVO] = {
    val user = users.get(id)
    user foreach (u => users -= id)
    user
  }
}

case class UserVO(
  id: String,
  externalId: String,
  name: String,
  role: String,
  guest: Boolean,
  authed: Boolean,
  waitingForAcceptance: Boolean,
  emojiStatus: String,
  presenter: Boolean,
  hasStream: Boolean,
  locked: Boolean,
  webcamStreams: Set[String],
  phoneUser: Boolean,
  voiceUser: VoiceUser,
  listenOnly: Boolean,
  avatarURL: String,
  joinedWeb: Boolean)

case class VoiceUser(
  userId: String,
  webUserId: String,
  callerName: String,
  callerNum: String,
  joined: Boolean,
  locked: Boolean,
  muted: Boolean,
  talking: Boolean,
  avatarURL: String,
  listenOnly: Boolean)
