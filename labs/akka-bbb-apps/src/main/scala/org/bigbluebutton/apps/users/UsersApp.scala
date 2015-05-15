package org.bigbluebutton.apps.users

import org.bigbluebutton.apps.utils.RandomStringGenerator
import org.bigbluebutton.apps.Role
import org.bigbluebutton.apps.users.data._
import org.bigbluebutton.apps.MeetingDescriptor

object UsersApp {
  def apply() = new UsersApp()
}

class UsersApp private {
  import UsersApp._

  private var registeredUsers =
    new collection.immutable.HashMap[String, RegisteredUser]

  private var joinedUsers =
    new collection.immutable.HashMap[String, JoinedUser]

  private var presenterAssignedBy = SystemUser

  def registered: Array[RegisteredUser] = registeredUsers.values toArray

  def joined: Array[JoinedUser] = joinedUsers.values toArray

  def isRegistered(token: String) = registeredUsers.get(token) != None

  def getRegisteredUser(token: String) = registeredUsers.get(token)

  private def add(user: RegisteredUser) = registeredUsers += user.token -> user

  private def add(token: String, ruser: RegisterUser): JoinedUser = {
    val userId = generateValidUserId
    val webIdent = WebIdentity()
    val voceIdent = VoiceIdentity(callerId = CallerId(ruser.name, ruser.name),
      muted = true,
      locked = false,
      talking = false,
      metadata = Map("name" -> ruser.name))

    val user = JoinedUser(userId, token, ruser, false, webIdent, voceIdent)

    addJoinedUser(user)
    user
  }

  private def addJoinedUser(user: JoinedUser) = joinedUsers += (user.id -> user)
  private def save(user: JoinedUser) = joinedUsers += (user.id -> user)

  private def remove(id: String): Option[JoinedUser] = {
    joinedUsers get (id) match {
      case Some(user) => {
        joinedUsers -= id
        Some(user)
      }
      case None => None
    }
  }

  def exist(id: String): Boolean = joinedUsers.get(id) != None

  private def generateValidToken: String = {
    val token = RandomStringGenerator.randomAlphanumericString(12)
    if (!isRegistered(token)) token else generateValidToken
  }

  private def generateValidUserId: String = {
    val userId = RandomStringGenerator.randomAlphanumericString(6)
    if (!exist(userId)) userId else generateValidUserId
  }

  def register(user: RegisterUser): RegisteredUser = {
    val token = generateValidToken
    val u = RegisteredUser(token, user)
    add(u)
    u
  }

  def join(token: String): Option[JoinedUser] = {
    for {
      ruser <- getRegisteredUser(token)
      user = add(token, ruser.user)
    } yield user
  }

  def makeAllUsersViewer() = {
    joined foreach { u =>
      makeViewer(u)
    }
  }

  def makePresenter(user: JoinedUser) = {
    val u = user.copy(isPresenter = true)
    joinedUsers += (user.id -> user)
  }

  def makeViewer(user: JoinedUser) = {
    val u = user.copy(isPresenter = false)
    joinedUsers += (user.id -> user)
  }

  def moderators: Array[JoinedUser] =
    joinedUsers.values filter (p => p.user.role == Role.MODERATOR) toArray

  def viewers: Array[JoinedUser] =
    joinedUsers.values filter (p => p.user.role == Role.VIEWER) toArray

  def hasPresenter(): Boolean = {
    currentPresenter match {
      case None => false
      case Some(p) => true
    }
  }

  def currentPresenter: Option[JoinedUser] =
    joinedUsers.values find (p => p.isPresenter)

  def getJoinedUser(id: String): Option[JoinedUser] = joinedUsers.get(id)

  def left(id: String): Option[JoinedUser] = {
    remove(id)
  }

  def findAModerator: Option[JoinedUser] =
    joinedUsers.values find (m => m.user.role == Role.MODERATOR)

  private def raiseHand(user: JoinedUser, raised: Boolean): JoinedUser = {
    val juser = user.copy(webIdentity = user.webIdentity.copy(handRaised = raised))
    addJoinedUser(juser)
    juser
  }

  def raiseHand(id: String, raise: Boolean): Option[JoinedUser] = {
    for {
      u <- getJoinedUser(id)
      juser = raiseHand(u, raise)
    } yield juser
  }

  def joinVoiceUser(userId: String, voiceIdent: VoiceIdentity,
    meeting: MeetingDescriptor): JoinedUser = {

    getJoinedUser(userId) match {
      case Some(u) => {
        val juser = u.copy(voiceIdentity = voiceIdent)
        addJoinedUser(juser)
        juser
      }
      case None => {
        val uid = generateValidUserId
        val token = generateValidToken
        val usr = RegisterUser(uid, voiceIdent.callerId.name, Role.VIEWER,
          meeting.voiceConf.pin, meeting.welcomeMessage,
          meeting.logoutUrl, meeting.avatarUrl)

        val webIdent = WebIdentity()
        val juser = JoinedUser(uid, token, usr, false, webIdent, voiceIdent)
        addJoinedUser(juser)
        juser
      }
    }
  }

  private def muteUser(user: JoinedUser, muted: Boolean): JoinedUser = {
    val juser = user.copy(voiceIdentity = user.voiceIdentity.copy(muted = muted))
    addJoinedUser(juser)
    juser
  }

  def userMuted(userId: String, muted: Boolean): Option[JoinedUser] = {
    for {
      u <- getJoinedUser(userId)
      juser = muteUser(u, muted)
    } yield juser
  }
}