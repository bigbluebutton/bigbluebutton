package org.bigbluebutton.core.models

import com.softwaremill.quicklens.modify

object UsersState {
  def findWithIntId(users: UsersState, intId: String): Option[UserState] = users.toVector.find(u => u.intId == intId)
  def findModerators(users: UsersState): Vector[UserState] = users.toVector.filter(u => u.role == Roles.MODERATOR_ROLE)
  def findPresenters(users: UsersState): Vector[UserState] = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE)
  def findViewers(users: UsersState): Vector[UserState] = users.toVector.filter(u => u.role == Roles.VIEWER_ROLE)
  def hasModerator(users: UsersState): Boolean = users.toVector.filter(u => u.role == Roles.MODERATOR_ROLE).length > 0
  def hasPresenter(users: UsersState): Boolean = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE).length > 0
  def hasNoPresenter(users: UsersState): Boolean = users.toVector.filter(u => u.role == Roles.PRESENTER_ROLE).length == 0

  def hasUserWithIntId(users: UsersState, intId: String): Boolean = {
    findWithIntId(users, intId) match {
      case Some(u) => true
      case None => false
    }
  }
  def numUsers(users: UsersState): Int = users.toVector.size

  def usersWhoAreNotPresenter(users: UsersState): Vector[UserState] = users.toVector filter (u => u.presenter == false)

  def unbecomePresenter(users: UsersState, intId: String) = {
    for {
      u <- findWithIntId(users, intId)
      user = modify(u)(_.presenter).setTo(false)
    } yield users.save(user)
  }

  def becomePresenter(users: UsersState, intId: String) = {
    for {
      u <- findWithIntId(users, intId)
      user = modify(u)(_.presenter).setTo(true)
    } yield users.save(user)
  }

  def isModerator(id: String, users: Users): Boolean = {
    Users.findWithId(id, users) match {
      case Some(user) => return user.role == Roles.MODERATOR_ROLE && !user.waitingForAcceptance
      case None => return false
    }
  }

  def add(users: UsersState, state: UserState): Option[UserState] = {
    users.save(state)
    Some(state)
  }

  def remove(users: UsersState, intId: String): Option[UserState] = {
    users.remove(intId)
  }

}

class UsersState {
  private var usersStatus: collection.immutable.HashMap[String, UserState] = new collection.immutable.HashMap[String, UserState]

  private def toVector: Vector[UserState] = usersStatus.values.toVector

  private def save(user: UserState): UserState = {
    usersStatus += user.intId -> user
    user
  }

  private def remove(intId: String): Option[UserState] = {
    val user = usersStatus.get(intId)
    user foreach (u => usersStatus -= intId)
    user
  }
}

case class UserState(intId: String, extId: String, name: String, role: String,
  guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emoji: String, locked: Boolean,
  presenter: Boolean, avatar: String)
