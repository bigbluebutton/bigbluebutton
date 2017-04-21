package org.bigbluebutton.core.models

object RegisteredUsers {
  def create(userId: String, extId: String, name: String, roles: String,
    token: String, avatar: String, guest: Boolean, authenticated: Boolean,
    waitingForAcceptance: Boolean): RegisteredUser = {
    new RegisteredUser(userId, extId, name, roles, token, avatar, guest, authenticated, waitingForAcceptance)
  }

  def findWithToken(token: String, users: Vector[RegisteredUser]): Option[RegisteredUser] = {
    users.find(u => u.authToken == token)
  }

  def findWithUserId(id: String, users: Vector[RegisteredUser]): Option[RegisteredUser] = {
    users.find(ru => id == ru.id)
  }

  def getRegisteredUserWithToken(token: String, userId: String, regUsers: Vector[RegisteredUser]): Option[RegisteredUser] = {
    def isSameUserId(ru: RegisteredUser, userId: String): Option[RegisteredUser] = {
      if (userId.startsWith(ru.id)) {
        Some(ru)
      } else {
        None
      }
    }

    for {
      ru <- RegisteredUsers.findWithToken(token, regUsers)
      user <- isSameUserId(ru, userId)
    } yield user
  }

  def updateRegUser(uvo: UserVO, regUsers: RegisteredUsers) {
    for {
      ru <- RegisteredUsers.findWithUserId(uvo.id, regUsers.toVector)
      regUser = new RegisteredUser(uvo.id, uvo.externalId, uvo.name, uvo.role, ru.authToken,
        uvo.avatarURL, uvo.guest, uvo.authed, uvo.waitingForAcceptance)
    } yield regUsers.save(regUser)
  }
}

class RegisteredUsers {
  private var regUsers = new collection.immutable.HashMap[String, RegisteredUser]

  def toVector: Vector[RegisteredUser] = regUsers.values.toVector

  def save(user: RegisteredUser): Vector[RegisteredUser] = {
    regUsers += user.authToken -> user
    regUsers.values.toVector
  }

  def delete(id: String): Option[RegisteredUser] = {
    val ru = RegisteredUsers.findWithUserId(id, toVector)
    ru foreach { u => regUsers -= u.authToken }
    ru
  }
}

case class RegisteredUser(
  id: String,
  externId: String,
  name: String,
  role: String,
  authToken: String,
  avatarURL: String,
  guest: Boolean,
  authed: Boolean,
  waitingForAcceptance: Boolean)

