package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.User
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.UserVO
import org.bigbluebutton.core.api.Role._
import scala.collection.mutable.ArrayBuffer

class UsersModel {
  private val users = new HashMap[String, User]

  def addUser(userID:String, extUserID: String, name :String, role: Role):Unit = {
    var newUser = new User(userID, extUserID, name, role)
	users += newUser.intUserID -> newUser
  }
  
  def removeUser(userID: String):Unit = {
    if (hasUser(userID)) users -= userID
  }
  
  def hasUser(userID: String):Boolean = {
    users.contains(userID)
  }
  
  def numUsers():Int = {
    users.size
  }
  
  def isModerator(userID: String):Boolean = {
    var moderator = false 
    if (hasUser(userID)) {
      val u = getUser(userID)
      moderator = if (u.role == MODERATOR.toString()) true else false
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
  
  def getUser(userID:String):UserVO = {
    var user: UserVO = null    
	users.get(userID) match {
		case Some(u) => user = u.toUserVO
		case None => user = null	
	}    	
	user
  }
  
  def getUsers():Array[UserVO] = {
	val u = new ArrayBuffer[UserVO]()
	users.values.foreach(kv => u += kv.toUserVO)	
	u.toArray
  }
  
  def numModerators():Int = {
	var modCount = 0;	  
	users.values.foreach(kv => {
	  if (kv.role == MODERATOR) modCount += 1
	})	  
	modCount
  }

  def getLoneModerator():Option[UserVO] = {
    var mod:Option[UserVO] = None    
	users.values.foreach(kv => {
		if (kv.role == MODERATOR) mod = Some(kv.toUserVO)
	})
	mod
  }
  
  /**
   * Returns TRUE if there is a presenter. Callers should call this
   * method first before calling getCurrentPresenter()
   */
  def hasPresenter():Boolean = {
    var presenter = false    
	users.values.foreach(kv => {
		if (kv.isPresenter) presenter = true
	})	  
	presenter    
  }
  
  /**
   * Callers should call first hasPresenter() to check if
   * there is a presenter.
   * 
   * Returns NULL if there is no presenter.
   */
  def getCurrentPresenter():UserVO = {
    var presenter:UserVO = null    
	users.values.foreach(kv => {
		if (kv.isPresenter) presenter = kv.toUserVO
	})	  
	presenter
  }
  
  def unbecomePresenter(userID: String) = {
	users.get(userID) match {
		case Some(u) => u.unbecomePresenter
		case None => // do nothing	
	}      
  }
  
  def becomePresenter(userID: String) = {
	users.get(userID) match {
		case Some(u) => u.becomePresenter
		case None => // do nothing	
	}       
  }
  
  def getModerators():Array[UserVO] = {
    val mods = new ArrayBuffer[UserVO]()
    users.values.foreach(u => {
      if (u.role == MODERATOR) mods += u.toUserVO
    })
    mods.toArray
  }
  
  def getViewers():Array[UserVO] = {
    val viewers = new ArrayBuffer[UserVO]()
    users.values.foreach(u => {
      if (u.role != MODERATOR) viewers += u.toUserVO
    })
    viewers.toArray    
  }
}