package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.models.{UserV, Voice}
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.api.Role._

class Users {

  private val users = collection.mutable.HashMap[String, UserV]()
  
  /**
   * Add a new user.
   */
  def add(user: UserV) = users += user.id -> user
  
  /**
   * Returns the number of users.
   */
  def count = users.size
  
  /**
   * Removes a user.
   */
  def remove(id: String) = users -= id
  
  /**
   * Gets a user.
   */
  def get(id: String):Option[UserV] = users.values.find(u => u.id == id)
  
  /**
   * Get all users.
   */
  def all():Array[UserV] = users.values.toArray
  
  def getPresenter():Option[UserV] = users.values.find(u => u.status.isPresenter)
  
  def makeEveryoneNotPresenter():Unit = {
    users.values map (u => {
     val p = u.copy(status = u.status.copy(isPresenter=false))
     users += p.id -> p
    })
  }
  
  def makePresenter(id:String):Option[UserV] = {
    var newPresenter: Option[UserV] = None
    get(id) match {
      case Some(u) => {
        val p = u.copy(status = u.status.copy(isPresenter=true))
        newPresenter = Some(p)
        users += p.id -> p
      }
      case None =>
    }
    newPresenter
  }

  def moderatorCount:Int = users.values.filter(u => u.role == MODERATOR).size
 
  def getVoiceUser(id:String):Option[UserV] = users.values.find(u => u.voice.id == id)
  
  def mute(id:String):Option[UserV] = {
    var user:Option[UserV] = None
    getVoiceUser(id) match {
      case Some(u) => {
        val mutedUser = u.copy(voice=u.voice.copy(muted=true))
        users += mutedUser.id -> mutedUser
        user = Some(mutedUser)
      }
      case None =>
    }
    
    user
  }
  
  def unmute(id:String):Option[UserV] = {
    var user:Option[UserV] = None
    getVoiceUser(id) match {
      case Some(u) => {
        val unmutedUser = u.copy(voice=u.voice.copy(muted=false))
        users += unmutedUser.id -> unmutedUser
        user = Some(unmutedUser)
      }
      case None =>
    }
    
    user
  }

  def lockVoice(id:String, lock: Boolean):Option[UserV] = {
    var user:Option[UserV] = None
    get(id) match {
      case Some(u) => {
        val lockedUser = u.copy(voice=u.voice.copy(locked=lock))
        users += lockedUser.id -> lockedUser
        user = Some(lockedUser)
      }
      case None =>
    }
    
    user
  }
    
  def joinedVoice(id:String, voice: Voice):Option[UserV] = {
    var user:Option[UserV] = None
    get(id) match {
      case Some(u) => {
        val voiceUser = u.copy(voice=voice)
        users += voiceUser.id -> voiceUser
        user = Some(voiceUser)
      }
      case None =>
    }
    
    user
  }
  
  def leftVoice(id:String):Option[UserV] = {
    var user:Option[UserV] = None
    getVoiceUser(id) match {
      case Some(u) => {
        val voiceUser = u.copy(voice=Voice())
        users += voiceUser.id -> voiceUser
        user = Some(voiceUser)
      }
      case None =>
    }
    
    user
  }
  
  def unlockedUsers():Array[UserV] = users.values filter (u => !u.voice.locked) toArray
}