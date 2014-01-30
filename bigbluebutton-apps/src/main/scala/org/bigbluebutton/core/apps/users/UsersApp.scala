package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.Presenter
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.UserLeaving
import org.bigbluebutton.core.api.AssignPresenter
import org.bigbluebutton.core.api.PresenterAssigned
import org.bigbluebutton.core.User
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.apps.users.messages.UserJoined
import org.bigbluebutton.core.apps.users.messages.UserLeft
import org.bigbluebutton.core.api.Role
import org.bigbluebutton.core.api.UserVO
import java.util.ArrayList
import org.bigbluebutton.core.apps.users.messages.GetUsersReply
import org.bigbluebutton.core.api.ChangeUserStatus
import org.bigbluebutton.core.apps.users.messages.UserStatusChange
import org.bigbluebutton.core.api.SetLockSettings
import org.bigbluebutton.core.api.InitLockSettings
import org.bigbluebutton.core.api.LockSettingsInitialized
import org.bigbluebutton.core.api.NewLockSettings
import org.bigbluebutton.core.api.LockUser
import org.bigbluebutton.core.api.LockAllUsers
import org.bigbluebutton.core.api.GetLockSettings
import org.bigbluebutton.core.api.IsMeetingLocked
	
case class LockSettings(allowModeratorLocking: Boolean, disableCam: Boolean, 
                        disableMic: Boolean, disablePrivateChat: Boolean,
                        disablePublicChat: Boolean)

class UsersApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
  
  private val users = new UsersModel
  
  var lockSettings = new LockSettings(true, true, true, true, true)
  var locked = false
  var currentPresenter = new Presenter("system", "system", "system")
  
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      	  case userJoin: UserJoining => handleUserJoin(userJoin)
	      case userLeft: UserLeaving => handleUserLeft(userLeft)
	      case assignPresenter: AssignPresenter => handleAssignPresenter(assignPresenter)
	      case getUsers: GetUsers => handleGetUsers(getUsers)
	      case changeStatus: ChangeUserStatus => handleChangeUserStatus(changeStatus)
	      case message: SetLockSettings => handleSetLockSettings(message)
	      case message: InitLockSettings => handleInitLockSettings(message)
	      case message: LockUser => handleLockUser(message)
	      case message: LockAllUsers => handleLockAllUsers(message)
	      case message: GetLockSettings => handleGetLockSettings(message)
	      case message: IsMeetingLocked => handleIsMeetingLocked(message)
	      case _ => // do nothing
    }
  }
  
  def isUserModerator(userID: String):Boolean = {
    users.isModerator(userID)
  }
  
  def isUserPresenter(userID: String):Boolean = {
    users.isPresenter(userID)
  }
  
  def getCurrentPresenter():Presenter = {
    currentPresenter
  }
  
  def hasUser(userID: String):Boolean = {
    users.hasUser(userID)
  }
  
  def getUser(userID:String):UserVO = {
    users.getUser(userID)
  }
  
  private def handleLockUser(msg: LockUser) {
    
  }
  
  private def handleLockAllUsers(msg: LockAllUsers) {
    
  }
  
  private def handleGetLockSettings(msg: GetLockSettings) {
    
  }
  
  private def handleIsMeetingLocked(msg: IsMeetingLocked) {
    
  }
	      
  private def handleSetLockSettings(msg: SetLockSettings) {
    if (lockSettings != msg.settings) {
      lockSettings = msg.settings
      outGW.send(new NewLockSettings(meetingID, lockSettings))
    }    
  }
  
  private def handleInitLockSettings(msg: InitLockSettings) {
    if (lockSettings != msg.settings || locked != msg.locked) {
	    lockSettings = msg.settings   
	    locked = msg.locked
	    
	    outGW.send(new LockSettingsInitialized(msg.meetingID, msg.locked, msg.settings))
    }

  }  
  
  private def handleChangeUserStatus(msg: ChangeUserStatus):Unit = {    
	if (users.hasUser(msg.userID)) {
		  outGW.send(new UserStatusChange(meetingID, recorded, msg.userID, msg.status, msg.value))
	}  
  }
  
  private def handleGetUsers(msg: GetUsers):Unit = {
	  outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, users.getUsers))
  }
  
  private def handleUserJoin(msg: UserJoining):Unit = {
  	println("UsersApp: init handleUserJoin")
	users.addUser(msg.userID, msg.extUserID, msg.name, msg.role)
					
	outGW.send(new UserJoined(meetingID, recorded, msg.userID, 
			msg.extUserID, msg.name, msg.role.toString(), false, false, false))
	
	// Become presenter if the only moderator		
	if (users.numModerators == 1) {
	  if (users.isModerator(msg.userID)) {
		assignNewPresenter(msg.userID, msg.name, msg.userID)
	  }	  
	}
	println("UsersApp: end handleUserJoin")	
  }
			
  private def handleUserLeft(msg: UserLeaving):Unit = {
	 if (users.hasUser(msg.userID)) {
	  users.removeUser(msg.userID)
	  outGW.send(new UserLeft(msg.meetingID, recorded, msg.userID))
	 }
   else{
    println("This user is not here:" + msg.userID)
   }
  }
	
  private def handleAssignPresenter(msg: AssignPresenter):Unit = {
	assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  } 
	
  private def assignNewPresenter(newPresenterID:String, newPresenterName: String, assignedBy: String) {
    if (users.hasUser(newPresenterID)) {
      if (users.hasPresenter) {
   	    val curPresenter = users.getCurrentPresenter
  	    users.unbecomePresenter(curPresenter.userID)  
  	    outGW.send(new UserStatusChange(meetingID, recorded, curPresenter.userID, "presenter", false:java.lang.Boolean))
      }

  	  val newPresenter = users.getUser(newPresenterID)
  	  users.becomePresenter(newPresenter.userID)    
  	  
  	  currentPresenter = new Presenter(newPresenterID, newPresenterName, assignedBy)
  	  
  	  outGW.send(new PresenterAssigned(meetingID, recorded, new Presenter(newPresenterID, newPresenterName, assignedBy)))

      outGW.send(new UserStatusChange(meetingID, recorded, newPresenterID, "presenter", true:java.lang.Boolean))
    }
  }
}