package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.User
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.UserVO
import org.bigbluebutton.core.api.Role._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.api.VoiceUser

class UsersModel {
  private var uservos = new collection.immutable.HashMap[String, UserVO]
  
//  private val users = new HashMap[String, User]

  def addUser(uvo: UserVO) {
    uservos += uvo.userID -> uvo 
  }
  
  def removeUser(userID: String):Option[UserVO] = {
    uservos get (userID) match {
      case Some(user) => {
        uservos -= userID
        Some(user)
      }
      case None => None
    }
  }
  
  def hasUser(userID: String):Boolean = {
    uservos.contains(userID)
  }
  
  def numUsers():Int = {
    uservos.size
  }
  
  def getUser(userID:String):Option[UserVO] = {
    uservos.values find (u => u.userID == userID) 
  }
  
  def getUsers():Array[UserVO] = {
	uservos.values toArray
  }
  
  def numModerators():Int = {
	getModerators.length
  }

  def getLoneModerator():Option[UserVO] = {
    uservos.values find (u => u.role == MODERATOR)
  }
    
  def getCurrentPresenter():Option[UserVO] = {
    uservos.values find (u => u.presenter == true)
  }
  
  def unbecomePresenter(userID: String) = {
	uservos.get(userID) match {
		case Some(u) => {
		  val nu = u.copy(presenter = false)
		  uservos += nu.userID -> nu
		}
		case None => // do nothing	
	}      
  }
  
  def becomePresenter(userID: String) = {
	uservos.get(userID) match {
		case Some(u) => {
		  val nu = u.copy(presenter = true)
		  uservos += nu.userID -> nu
		}
		case None => // do nothing	
	}      
  }
  
  def getModerators():Array[UserVO] = {
    uservos.values filter (u => u.role == MODERATOR ) toArray
  }
  
  def getViewers():Array[UserVO] = {
    uservos.values filter (u => u.role == VIEWER ) toArray  
  }
}