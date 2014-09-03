package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.User
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.UserVO
import org.bigbluebutton.core.api.Role._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.api.VoiceUser
import org.bigbluebutton.core.util.RandomStringGenerator

class UsersModel {
  private var uservos = new collection.immutable.HashMap[String, UserVO]
  
  def generateWebUserId:String = {
    val webUserId = RandomStringGenerator.randomAlphanumericString(6)
    if (! hasUser(webUserId)) webUserId else generateWebUserId
  }
  
  def addUser(uvo: UserVO) {
    uservos += uvo.userID -> uvo 
  }
  
  def removeUser(userId: String):Option[UserVO] = {
    val user = uservos get (userId)
    user foreach (u => uservos -= userId)
    
    user
  }
  
  def hasUser(userID: String):Boolean = {
    uservos.contains(userID)
  }
  
  def numUsers():Int = {
    uservos.size
  }
  
  def numWebUsers():Int = {
    uservos.values filter (u => u.phoneUser == false) size
  }

  def getUserWithExternalId(userID:String):Option[UserVO] = {
    uservos.values find (u => u.externUserID == userID) 
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