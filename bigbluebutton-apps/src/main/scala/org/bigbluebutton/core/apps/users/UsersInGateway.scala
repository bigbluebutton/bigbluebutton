package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api.InMessageGateway
import org.bigbluebutton.core.api.ChangeUserStatus
import org.bigbluebutton.core.api.SampleInMessage
import org.bigbluebutton.conference.service.participants.IUsersInGW
import org.bigbluebutton.core.api.UserLeaving
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.api.AssignPresenter
import org.bigbluebutton.core.Role._

class UsersInGateway(inGW: InMessageGateway) extends IUsersInGW {

  	def setUserStatus(meetingID: String, userID: String, status: String, value: Object):Unit = {
		inGW.accept(new ChangeUserStatus(meetingID, userID, status, value));
	}
	
	def getUsers(meetingID: String, requesterID: String):Unit = {
		inGW.accept(new GetUsers(meetingID, requesterID))
	}
	
	def userLeft(meetingID: String, userID: String):Unit = {
  		inGW.accept(new UserLeaving(meetingID, userID))
	}
	
	def userJoin(meetingID: String, userID: String, name: String, role: String, extUserID: String):Unit = {
	  var userRole:Role = VIEWER;
	  
	  if (role == "MODERATOR") userRole = MODERATOR;
	  
  		inGW.accept(new UserJoining(meetingID, userID, name, userRole, extUserID))
	}
		
	def assignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String):Unit = {
  		inGW.accept(new AssignPresenter(meetingID, newPresenterID, newPresenterName, assignedBy))
	}
}