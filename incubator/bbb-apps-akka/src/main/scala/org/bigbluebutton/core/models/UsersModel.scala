package org.bigbluebutton.core.models

import org.bigbluebutton.core.domain.{ ModeratorRole, Role2x, UserAbilities, _ }

class Users3x {
  private var users: collection.immutable.HashMap[String, User3x] = new collection.immutable.HashMap[String, User3x]

  def save(user: User3x): Unit = {
    users += user.id.value -> user
  }

  def remove(id: IntUserId): Option[User3x] = {
    val user = users.get(id.value)
    user foreach (u => users -= id.value)
    user
  }

  def toVector: Vector[User3x] = users.values.toVector
}

object Users3x {
  def findWithId(id: IntUserId, users: Vector[User3x]): Option[User3x] = users.find(u => u.id.value == id.value)
  def findWithExtId(id: ExtUserId, users: Vector[User3x]): Option[User3x] = users.find(u => u.extId.value == id.value)
  def findModerators(users: Vector[User3x]): Vector[User3x] = users.filter(u => u.roles.contains(ModeratorRole))
  def findPresenters(users: Vector[User3x]): Vector[User3x] = users.filter(u => u.roles.contains(PresenterRole))
  def hasModerator(users: Vector[User3x]): Boolean = users.filter(u => u.roles.contains(ModeratorRole)).length > 0
  def hasPresenter(users: Vector[User3x]): Boolean = users.filter(u => u.roles.contains(PresenterRole)).length > 0
}

object RegisteredUsers2x {
  def create(userId: IntUserId, extId: ExtUserId, name: Name, roles: Set[Role2x],
    token: AuthToken, avatar: Avatar,
    logoutUrl: LogoutUrl,
    welcome: Welcome,
    dialNumbers: Set[DialNumber],
    pinNumber: PinNumber,
    config: Set[String],
    extData: Set[String]): RegisteredUser2x = {
    new RegisteredUser2x(userId, extId, name, roles, token, avatar: Avatar,
      logoutUrl: LogoutUrl,
      welcome: Welcome,
      dialNumbers: Set[DialNumber],
      pinNumber: PinNumber,
      config: Set[String],
      extData: Set[String])
  }

  def findWithToken(token: AuthToken, users: Vector[RegisteredUser2x]): Option[RegisteredUser2x] = {
    users.find(u => u.authToken.value == token.value)
  }

  def findWithUserId(id: IntUserId, users: Vector[RegisteredUser2x]): Option[RegisteredUser2x] = {
    users.find(ru => id.value == ru.id.value)
  }
}

class RegisteredUsers2x {
  private var regUsers = new collection.immutable.HashMap[String, RegisteredUser2x]

  def toVector: Vector[RegisteredUser2x] = regUsers.values.toVector

  def add(user: RegisteredUser2x): Vector[RegisteredUser2x] = {
    regUsers += user.authToken.value -> user
    regUsers.values.toVector
  }

  def remove(id: IntUserId): Option[RegisteredUser2x] = {
    val ru = RegisteredUsers2x.findWithUserId(id, toVector)
    ru foreach { u => regUsers -= u.authToken.value }
    ru
  }
}
