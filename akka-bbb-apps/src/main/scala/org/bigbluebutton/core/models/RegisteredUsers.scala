package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

object RegisteredUsers {
  def create(userId: String, extId: String, name: String, roles: String,
             token: String, avatar: String, guest: Boolean, authenticated: Boolean,
             guestStatus: String): RegisteredUser = {
    new RegisteredUser(
      userId,
      extId,
      name,
      roles,
      token,
      avatar,
      guest,
      authenticated,
      guestStatus,
      System.currentTimeMillis(),
      false,
      false
    )
  }

  def findWithToken(token: String, users: RegisteredUsers): Option[RegisteredUser] = {
    users.toVector.find(u => u.authToken == token)
  }

  def findWithUserId(id: String, users: RegisteredUsers): Option[RegisteredUser] = {
    users.toVector.find(ru => id == ru.id)
  }

  def findUsersNotJoined(users: RegisteredUsers): Vector[RegisteredUser] = {
    users.toVector.filter(u => u.joined == false && u.markAsJoinTimedOut == false)
  }

  def getRegisteredUserWithToken(token: String, userId: String, regUsers: RegisteredUsers): Option[RegisteredUser] = {
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

  def add(users: RegisteredUsers, user: RegisteredUser): Vector[RegisteredUser] = {
    users.save(user)
  }

  def remove(id: String, users: RegisteredUsers): Option[RegisteredUser] = {
    users.delete(id)
  }

  def setWaitingForApproval(users: RegisteredUsers, user: RegisteredUser,
                            guestStatus: String): RegisteredUser = {
    val u = user.modify(_.guestStatus).setTo(guestStatus)
    users.save(u)
    u
  }

  def updateUserRole(users: RegisteredUsers, user: RegisteredUser,
                     role: String): RegisteredUser = {
    val u = user.modify(_.role).setTo(role)
    users.save(u)
    u
  }

  def updateUserJoin(users: RegisteredUsers, user: RegisteredUser): RegisteredUser = {
    val u = user.copy(joined = true)
    users.save(u)
    u
  }

  def markAsUserFailedToJoin(users: RegisteredUsers, user: RegisteredUser): RegisteredUser = {
    val u = user.copy(markAsJoinTimedOut = true)
    users.save(u)
    u
  }
}

class RegisteredUsers {
  private var regUsers = new collection.immutable.HashMap[String, RegisteredUser]

  private def toVector: Vector[RegisteredUser] = regUsers.values.toVector

  private def save(user: RegisteredUser): Vector[RegisteredUser] = {
    regUsers += user.authToken -> user
    regUsers.values.toVector
  }

  private def delete(id: String): Option[RegisteredUser] = {
    val ru = regUsers.values.find(p => p.id == id)
    ru foreach { u =>
      regUsers -= u.authToken
    }
    ru
  }
}

case class RegisteredUser(
    id:                 String,
    externId:           String,
    name:               String,
    role:               String,
    authToken:          String,
    avatarURL:          String,
    guest:              Boolean,
    authed:             Boolean,
    guestStatus:        String,
    registeredOn:       Long,
    joined:             Boolean,
    markAsJoinTimedOut: Boolean
)

