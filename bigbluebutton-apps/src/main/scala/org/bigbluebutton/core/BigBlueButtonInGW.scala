package org.bigbluebutton.core

import org.bigbluebutton.core.api.ChangeUserStatus
import org.bigbluebutton.core.api.UserLeaving
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.UserJoining
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.api.AssignPresenter
import org.bigbluebutton.core.Role._
import org.bigbluebutton.core.api.IBigBlueButtonInGW
import org.bigbluebutton.core.api.CreateMeeting

class BigBlueButtonInGW(bbbGW: BigBlueButtonGateway) extends IBigBlueButtonInGW {

	def setUserStatus(meetingID: String, userID: String, status: String, value: Object):Unit = {
		bbbGW.accept(new ChangeUserStatus(meetingID, userID, status, value));
	}

	def getUsers(meetingID: String, requesterID: String):Unit = {
		bbbGW.accept(new GetUsers(meetingID, requesterID))
	}

	def userLeft(meetingID: String, userID: String):Unit = {
		bbbGW.accept(new UserLeaving(meetingID, userID))
	}

	def userJoin(meetingID: String, userID: String, name: String, role: String, extUserID: String):Unit = {
		var userRole:Role = VIEWER;

		if (role == "MODERATOR") {
		  userRole = MODERATOR;
		}

		bbbGW.accept(new UserJoining(meetingID, userID, name, userRole, extUserID))
	}

	def assignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String):Unit = {
		bbbGW.accept(new AssignPresenter(meetingID, newPresenterID, newPresenterName, assignedBy))
	}

	def getCurrentPresenter(meetingID: String, requesterID: String):Unit = {
		// do nothing
	}
	
	def createMeeting2(meetingID: String, record: Boolean, voiceBridge: String) = {
		bbbGW.accept(new CreateMeeting(meetingID, record, voiceBridge))
	}
}