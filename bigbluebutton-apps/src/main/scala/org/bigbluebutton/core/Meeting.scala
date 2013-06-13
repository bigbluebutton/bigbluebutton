package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.apps.poll.PollApp
import org.bigbluebutton.core.apps.poll.Poll
import org.bigbluebutton.core.apps.poll.PollApp
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.UserLeaving
import org.bigbluebutton.core.api.UserLeft
import org.bigbluebutton.core.api.OutMessageGateway
import org.bigbluebutton.core.api.AssignPresenter
import org.bigbluebutton.core.api.PresenterAssigned



class Meeting(meetingID: String, recorded: Boolean, outGW: OutMessageGateway) extends Actor {

  import org.bigbluebutton.core.messages._
  import org.bigbluebutton.core.apps.poll.messages._
  import org.bigbluebutton.core.api.Presenter
  
  var currentPresenter:Presenter
  
  private val users = new HashMap[String, User]
  //val polls = new PollApp(outGW)
  
  	def act() = {
	  loop {
	    react {
	      case userJoin: UserJoining => handleUserJoin(userJoin)
	      case userLeft: UserLeaving => handleUserLeft(userLeft)
	      case assignPresenter: AssignPresenter => handleAssignPresenter(assignPresenter)
	    }
	  }
  	}
  	
  	private def handleUserJoin(msg: UserJoining):Unit = {
  	  var newUser = new User(msg.userID, msg.extUserID, msg.name, msg.role)
  	  users += newUser.intUserID -> newUser
  	}
  	
  	private def handleUserLeft(msg: UserLeaving):Unit = {
  	  users.get(msg.userID) match {
  	    case Some(u) => users -= u.intUserID;
  	    outGW.send(new UserLeft(meetingID, recorded, msg.userID))
  	  }
  	}
  	
  	private def handleAssignPresenter(msg: AssignPresenter):Unit = {
  	  currentPresenter = new Presenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  	  outGW.send(new PresenterAssigned(meetingID, recorded, new Presenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)))
  	} 
}