package org.bigbluebutton.core.models

import com.softwaremill.quicklens.modify

object UsersStatus {
  def findWithId(users: UsersStatus, userId: String): Option[UserStatus] = users.toVector.find(u => u.id == userId)
  def findModerators(users: UsersStatus): Vector[UserStatus] = users.toVector.filter(u => u.role == Roles.MODERATOR_ROLE)
  def findPresenters(users: UsersStatus): Vector[UserStatus] = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE)
  def findViewers(users: UsersStatus): Vector[UserStatus] = users.toVector.filter(u => u.role == Roles.VIEWER_ROLE)
  def hasModerator(users: UsersStatus): Boolean = users.toVector.filter(u => u.role == Roles.MODERATOR_ROLE).length > 0
  def hasPresenter(users: UsersStatus): Boolean = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE).length > 0
  def hasNoPresenter(users: UsersStatus): Boolean = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE).length == 0

  def hasUserWithId(users: UsersStatus, id: String): Boolean = {
    findWithId(users, id) match {
      case Some(u) => true
      case None => false
    }
  }
  def numUsers(users: UsersStatus): Int = users.toVector.size

  def usersWhoAreNotPresenter(users: UsersStatus): Vector[UserStatus] = users.toVector filter (u => u.presenter == false)

  def unbecomePresenter(users: UsersStatus, userId: String) = {
    for {
      u <- findWithId(users, userId)
      user = modify(u)(_.presenter).setTo(false)
    } yield users.save(user)
  }

  def becomePresenter(users: UsersStatus, userId: String) = {
    for {
      u <- findWithId(users, userId)
      user = modify(u)(_.presenter).setTo(true)
    } yield users.save(user)
  }

  def isModerator(id: String, users: Users): Boolean = {
    Users.findWithId(id, users) match {
      case Some(user) => return user.role == Roles.MODERATOR_ROLE && !user.waitingForAcceptance
      case None => return false
    }
  }
}

class UsersStatus {
  private var usersStatus: collection.immutable.HashMap[String, UserStatus] = new collection.immutable.HashMap[String, UserStatus]

  private def toVector: Vector[UserStatus] = usersStatus.values.toVector

  private def save(user: UserStatus): UserStatus = {
    usersStatus += user.id -> user
    user
  }

  private def remove(id: String): Option[UserStatus] = {
    val user = usersStatus.get(id)
    user foreach (u => usersStatus -= id)
    user
  }
}

case class UserStatus(id: String, externalId: String, name: String, role: String,
  guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emoji: String,
  presenter: Boolean, avatar: String)
