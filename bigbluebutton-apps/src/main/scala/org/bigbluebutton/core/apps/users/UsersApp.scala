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

class UsersApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
  
  private val users = new HashMap[String, User]
  var currentPresenter = new Presenter("system", "system", "system")
  
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      	  case userJoin: UserJoining => handleUserJoin(userJoin)
	      case userLeft: UserLeaving => handleUserLeft(userLeft)
	      case assignPresenter: AssignPresenter => handleAssignPresenter(assignPresenter)
    }
  }
  
	private def handleUserJoin(msg: UserJoining):Unit = {
		var newUser = new User(msg.userID, msg.extUserID, msg.name, msg.role)
		users += newUser.intUserID -> newUser
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