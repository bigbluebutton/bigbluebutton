package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.User
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.UserVO
import org.bigbluebutton.core.api.Role._
import scala.collection.mutable.ArrayBuffer

class UsersModel {
  private var uservos = new collection.immutable.HashMap[String, UserVO]
  
//  private val users = new HashMap[String, User]

  def addUser(userID:String, extUserID: String, name :String, role: Role):Unit = {
    uservos += userID -> new UserVO(userID, extUserID, name, 
                  role, raiseHand=false, presenter=false, 
                  hasStream=false, locked=false)
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

/*  
  def isModerator(userID: String):Boolean = {
    var moderator = false 
    if (hasUser(userID)) {
      val u = getUser(userID)
      moderator = if (u.role == Role.MODERATOR) true else false
    }             
    moderator
  }
  
  def isPresenter(userID: String):Boolean = {
    var presenter = false    
    if (hasUser(userID)) {
      val u = getUser(userID)
      presenter = u.presenter
    }   
    presenter
  }
*/  
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