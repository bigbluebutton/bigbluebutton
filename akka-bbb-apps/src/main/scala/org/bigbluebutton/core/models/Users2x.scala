package org.bigbluebutton.core.models

object Users2x {
  def findWithIntId(users: Users2x, intId: String): Option[UserState] = {
    users.toVector find (u => u.intId == intId)
  }

  def add(users: Users2x, user: UserState): Option[UserState] = {
    users.save(user)
    Some(user)
  }

  def remove(users: Users2x, intId: String): Option[UserState] = {
    users.remove(intId)
  }

  def findNotPresenters(users: Users2x): Vector[UserState] = {
    users.toVector.filter(u => !u.presenter)
  }

}

class Users2x {
  private var users: collection.immutable.HashMap[String, UserState] = new collection.immutable.HashMap[String, UserState]

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
}

