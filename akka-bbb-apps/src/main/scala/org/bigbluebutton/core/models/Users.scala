package org.bigbluebutton.core.models

import org.bigbluebutton.core.util.RandomStringGenerator
import com.softwaremill.quicklens._

object Roles {
  val MODERATOR_ROLE = "MODERATOR"
  val PRESENTER_ROLE = "PRESENTER"
  val VIEWER_ROLE = "VIEWER"
  val GUEST_ROLE = "GUEST"
}

object PermissionLevels {
  val MODERATOR_LEVEL = "MODERATOR_LEVEL"
  val GUEST_LEVEL = "GUEST_LEVEL"
  val AUTHED_LEVEL = "AUTHENTICATED_LEVEL"

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
  def unbecomePresenter(user: UserVO): UserVO = user.copy(presenter = false)
  def becomePresenter(user: UserVO) = user.copy(presenter = true)

  def generateWebUserId(users: Vector[UserVO]): String = {
    val webUserId = RandomStringGenerator.randomAlphanumericString(6)
    if (!hasUserWithId(webUserId, users)) webUserId else generateWebUserId(users)
  }

  def usersWhoAreNotPresenter(users: Vector[UserVO]): Vector[UserVO] = users filter (u => u.presenter == false)
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

case class User(id: String, externalId: String, name: String, emojiStatus: String,
  avatar: String, roles: Set[String],
  clients: Set[String], permissions: String,
  config: Set[String], externalData: Set[String])

case class UserVO(id: String, externalId: String, name: String, role: String, emojiStatus: String, presenter: Boolean,
  hasStream: Boolean, locked: Boolean, webcamStreams: Set[String], phoneUser: Boolean, voiceUser: VoiceUser, listenOnly: Boolean,
  avatarURL: String, joinedWeb: Boolean)

object VoiceUser {
  def talking(user: VoiceUser): VoiceUser = modify(user)(_.talking).setTo(true)
  def notTalking(user: VoiceUser): VoiceUser = modify(user)(_.talking).setTo(false)
  def mute(user: VoiceUser): VoiceUser = modify(user)(_.muted).setTo(true)
  def unmute(user: VoiceUser): VoiceUser = modify(user)(_.muted).setTo(false)
}

case class VoiceUser(userId: String, webUserId: String, callerName: String, callerNum: String, joined: Boolean, locked: Boolean,
  muted: Boolean, talking: Boolean, avatarURL: String, listenOnly: Boolean)