package org.bigbluebutton.client.meeting

object UsersManager {
  def findWithId(manager: UsersManager, id: String): Option[User] = {
    manager.toVector.find(m => m.userId == id)
  }

  def remove(manager: UsersManager, id: String): Option[User] = {
    manager.remove(id)
  }

  def add(manager: UsersManager, user: User): User = {
    manager.save(user)
  }
}

class UsersManager {
  private var users = new collection.immutable.HashMap[String, User]

  private def toVector: Vector[User] = users.values.toVector

  private def save(user: User): User = {
    users += user.userId -> user
    user
  }

  private def remove(id: String): Option[User] = {
    val user = users.get(id)
    user foreach (u => users -= id)
    user
  }
}
