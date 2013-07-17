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

class UsersApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
  
  private val users = new UsersModel
  
  var currentPresenter = new Presenter("system", "system", "system")
  
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      	  case userJoin: UserJoining => handleUserJoin(userJoin)
	      case userLeft: UserLeaving => handleUserLeft(userLeft)
	      case assignPresenter: AssignPresenter => handleAssignPresenter(assignPresenter)
	      case getUsers: GetUsers => handleGetUsers(getUsers)
	      case changeStatus: ChangeUserStatus => handleChangeUserStatus(changeStatus)
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