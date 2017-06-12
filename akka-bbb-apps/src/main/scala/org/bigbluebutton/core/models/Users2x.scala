package org.bigbluebutton.core.models

object Users2x {
  def findUserWithIntId(users: Users2x, intId: String): Option[String] = {
    users.toVector find (u => u == intId)
  }

  def add(users: Users2x, user: String): Option[String] = {
    users.save(user)
    Some(user)
  }

  def remove(users: Users2x, intId: String): Option[String] = {
    users.remove(intId)
  }

  def removeUserWithId(users: Users2x, voiceUserId: String): Option[String] = {
    users.remove(voiceUserId)
  }
}

class Users2x {
  private var users: Set[String] = Set.empty

  private def toVector: Vector[String] = users.toVector

  private def save(user: String): String = {
    users = users + user
    user
  }

  private def remove(id: String): Option[String] = {
    val user = for {
      user <- users.find(u => u == id)

    } yield {
      users = users.filterNot(u => u == id)
      user
    }

    user
  }
}

