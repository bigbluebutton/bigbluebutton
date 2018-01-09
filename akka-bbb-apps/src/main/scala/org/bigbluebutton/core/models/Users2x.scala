package org.bigbluebutton.core.models

import com.softwaremill.quicklens._

object Users2x {
  def findWithIntId(users: Users2x, intId: String): Option[UserState] = {
    users.toVector find (u => u.intId == intId)
  }

  def findAll(users: Users2x): Vector[UserState] = users.toVector

  def add(users: Users2x, user: UserState): Option[UserState] = {
    users.save(user)
    Some(user)
  }

  def remove(users: Users2x, intId: String): Option[UserState] = {
    users.remove(intId)
  }

  def numUsers(users: Users2x): Int = {
    users.toVector.length
  }

  def findNotPresenters(users: Users2x): Vector[UserState] = {
    users.toVector.filter(u => !u.presenter)
  }

  def changeRole(users: Users2x, u: UserState, newRole: String): UserState = {
    val newUserState = modify(u)(_.role).setTo(newRole).modify(_.roleChangedOn).setTo(System.currentTimeMillis())
    users.save(newUserState)
    newUserState
  }

  def ejectFromMeeting(users: Users2x, intId: String): Option[UserState] = {
    for {
      _ <- users.remove(intId)
      ejectedUser <- users.removeFromCache(intId)
    } yield {
      ejectedUser
    }
  }

  def makePresenter(users: Users2x, intId: String): Option[UserState] = {
    for {
      u <- findWithIntId(users, intId)
    } yield {
      val newUser = u.modify(_.presenter).setTo(true)
      users.save(newUser)
      newUser
    }
  }

  def makeNotPresenter(users: Users2x, intId: String): Option[UserState] = {
    for {
      u <- findWithIntId(users, intId)
    } yield {
      val newUser = u.modify(_.presenter).setTo(false)
      users.save(newUser)
      newUser
    }
  }

  def setEmojiStatus(users: Users2x, intId: String, emoji: String): Option[UserState] = {
    for {
      u <- findWithIntId(users, intId)
    } yield {
      val newUser = u.modify(_.emoji).setTo(emoji)
      users.save(newUser)
      newUser
    }
  }

  def setUserLocked(users: Users2x, intId: String, locked: Boolean): Option[UserState] = {
    for {
      u <- findWithIntId(users, intId)
    } yield {
      val newUser = u.modify(_.locked).setTo(locked)
      users.save(newUser)
      newUser
    }
  }

  def hasPresenter(users: Users2x): Boolean = {
    findPresenter(users) match {
      case Some(p) => true
      case None    => false
    }
  }

  def isPresenter(intId: String, users: Users2x): Boolean = {
    findWithIntId(users, intId) match {
      case Some(u) => u.presenter
      case None    => false
    }
  }

  def findPresenter(users: Users2x): Option[UserState] = {
    users.toVector.find(u => u.presenter)
  }

  def findModerator(users: Users2x): Option[UserState] = {
    users.toVector.find(u => u.role == Roles.MODERATOR_ROLE)
  }

  def addUserToPresenterGroup(users: Users2x, userIdToAdd: String): Boolean = {
    users.updatePresenterGroup(users.presenterGroup.filterNot(_ == userIdToAdd).:+(userIdToAdd)) // ensure no repetition
    users.presenterGroup.contains(userIdToAdd)
  }

  def removeUserFromPresenterGroup(users: Users2x, userIdToRemove: String): Boolean = {
    users.updatePresenterGroup(users.presenterGroup.filterNot(_ == userIdToRemove))
    !users.presenterGroup.contains(userIdToRemove)
  }

  def getPresenterGroupUsers(users2x: Users2x): Vector[String] = {
    users2x.presenterGroup
  }

  def userIsInPresenterGroup(users2x: Users2x, userId: String): Boolean = {
    users2x.presenterGroup.contains(userId)
  }

}

class Users2x {
  private var users: collection.immutable.HashMap[String, UserState] = new collection.immutable.HashMap[String, UserState]
  private var presenterGroup: Vector[String] = scala.collection.immutable.Vector.empty

  private var oldPresenterGroup: collection.immutable.HashMap[String, OldPresenter] = new collection.immutable.HashMap[String, OldPresenter]

  // Collection of users that left the meeting. We keep a cache of the old users state to recover in case
  // the user reconnected by refreshing the client. (ralam june 13, 2017)
  private var usersCache: collection.immutable.HashMap[String, UserState] = new collection.immutable.HashMap[String, UserState]

  private def toVector: Vector[UserState] = users.values.toVector

  private def save(user: UserState): UserState = {
    users += user.intId -> user
    user
  }

  private def remove(id: String): Option[UserState] = {
    for {
      user <- users.get(id)
    } yield {
      users -= id
      saveToCache(user)
      user
    }
  }

  private def saveToCache(user: UserState): Unit = {
    usersCache += user.intId -> user
  }

  private def removeFromCache(intId: String): Option[UserState] = {
    for {
      user <- usersCache.get(intId)
    } yield {
      usersCache -= intId
      user
    }
  }

  private def findUserFromCache(intId: String): Option[UserState] = {
    usersCache.values.find(u => u.intId == intId)
  }

  private def updatePresenterGroup(updatedGroup: Vector[String]): Unit = {
    presenterGroup = updatedGroup
  }

  def addOldPresenter(userId: String): OldPresenter = {
    val op = OldPresenter(userId, System.currentTimeMillis())
    oldPresenterGroup += op.userId -> op
    op
  }

  def removeOldPresenter(userId: String): Option[OldPresenter] = {
    for {
      op <- oldPresenterGroup.get(userId)
    } yield {
      oldPresenterGroup -= userId
      op
    }
  }

  def findOldPresenter(userId: String): Option[OldPresenter] = {
    oldPresenterGroup.get(userId)
  }

  def purgeOldPresenters(): Unit = {
    val now = System.currentTimeMillis()
    oldPresenterGroup.values.foreach { op =>
      if (now - op.changedPresenterOn < 5000) {
        oldPresenterGroup -= op.userId
      }
    }
  }
}

case class OldPresenter(userId: String, changedPresenterOn: Long)

case class UserState(intId: String, extId: String, name: String, role: String,
                     guest: Boolean, authed: Boolean, guestStatus: String, emoji: String, locked: Boolean,
                     presenter: Boolean, avatar: String, roleChangedOn: Long = System.currentTimeMillis())

case class UserIdAndName(id: String, name: String)

object CallingWith {
  val WEBRTC = "webrtc"
  val FLASH = "flash"
  val PHONE = "phone"
}

object Roles {
  val MODERATOR_ROLE = "MODERATOR"
  val PRESENTER_ROLE = "PRESENTER"
  val VIEWER_ROLE = "VIEWER"
  val GUEST_ROLE = "GUEST"
  val AUTHENTICATED_ROLE = "AUTHENTICATED"
}

object SystemUser {
  val ID = "SYSTEM"
}

object EjectReasonCode {
  val DUPLICATE_USER = "duplicate_user_in_meeting_eject_reason"
  val PERMISSION_FAILED = "not_enough_permission_eject_reason"
  val EJECT_USER = "user_requested_eject_reason"
  val SYSTEM_EJECT_USER = "system_requested_eject_reason"
  val VALIDATE_TOKEN = "validate_token_failed_eject_reason"
}
