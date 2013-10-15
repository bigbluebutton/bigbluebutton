package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.models.UserV
import scala.collection.mutable.ArrayBuffer

class Users {

  private val users = collection.mutable.HashMap[String, UserV]()
  
  /**
   * Add a new user.
   */
  def add(user: UserV) = {
    users += user.id -> user
  }
  
  /**
   * Returns the number of users.
   */
  def size = users.size
  
  /**
   * Removes a user.
   */
  def remove(id: String) = {
    users -= id
  }
  
  /**
   * Gets a user.
   */
  def get(id: String):Option[UserV] = {
    var user:Option[UserV] = None
    users.get(id) match {
      case Some(u) => user = Some(u.copy())
      case None => // do nothing
    }
    user
  }
  
  /**
   * Get all users.
   */
  def all():Array[UserV] = {
    val u = new ArrayBuffer[UserV]()
    users.values.foreach(kv => u += kv.copy())
    u.toArray
  }
}