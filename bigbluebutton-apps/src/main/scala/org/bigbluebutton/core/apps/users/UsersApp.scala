package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.Presenter
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.UserLeaving
import org.bigbluebutton.core.api.UserLeft
import org.bigbluebutton.core.api.AssignPresenter
import org.bigbluebutton.core.api.PresenterAssigned
import org.bigbluebutton.core.User
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.apps.users.messages.UserJoined
import org.bigbluebutton.core.api.Role
import org.bigbluebutton.core.api.UserVO
import java.util.ArrayList
import org.bigbluebutton.core.apps.users.messages.GetUsersReply
import org.bigbluebutton.core.api.ChangeUserStatus

class UsersApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
  
  private val users = new HashMap[String, User]
  var currentPresenter = new Presenter("system", "system", "system")
  
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      	  case userJoin: UserJoining => handleUserJoin(userJoin)
	      case userLeft: UserLeaving => handleUserLeft(userLeft)
	      case assignPresenter: AssignPresenter => handleAssignPresenter(assignPresenter)
	      case getUsers: GetUsers => handleGetUsers(getUsers)
	      case changeStatus: ChangeUserStatus => // do nothing for now
	      case _ => // do nothing
    }
  }
  
  private def handleGetUsers(msg: GetUsers):Unit = {
	  var u = new ArrayList[UserVO]()
	  users.values.foreach(kv => u.add(kv.toUserVO))
 
	  outGW.send(new GetUsersReply(msg.meetingID, msg.requesterID, u))
  }
  
	private def handleUserJoin(msg: UserJoining):Unit = {
		var newUser = new User(msg.userID, msg.extUserID, msg.name, msg.role)
		users += newUser.intUserID -> newUser
					
		outGW.send(new UserJoined(meetingID, recorded, msg.userID, 
			msg.extUserID, msg.name, msg.role.toString(), false, false, false))
	}
	
	private def handleUserLeft(msg: UserLeaving):Unit = {
		users.get(msg.userID) match {
			case Some(u) => {
			  users -= u.intUserID;
			  outGW.send(new UserLeft(msg.meetingID, recorded, msg.userID))
			}
			case None => // do nothing
			
		}
	}
	
	private def handleAssignPresenter(msg: AssignPresenter):Unit = {
		currentPresenter = new Presenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
		outGW.send(new PresenterAssigned(meetingID, recorded, new Presenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)))
	} 
}