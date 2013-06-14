package org.bigbluebutton.core.apps.users.messages

import org.bigbluebutton.core.api.OutMessage
import java.util.Map
import org.bigbluebutton.core.api.IOutMessage
import java.util.ArrayList
import org.bigbluebutton.core.api.UserVO

case class EndAndKickAll(meetingID: String, recorded: Boolean) extends IOutMessage
case class GetUsersReply(meetingID: String, requesterID: String, users: ArrayList[UserVO]) extends IOutMessage
case class AssignPresenter(meetingID: String, recorded: Boolean, newPresenterID: String, newPresenterName: String, assignedBy: String) extends IOutMessage
case class UserJoined(meetingID: String, recorded: Boolean, internalUserID: String, 
			externalUserID: String, name: String, role: String, raiseHand: Boolean, presenter: Boolean, hasStream: Boolean) extends IOutMessage
case class UserLeft(meetingID: String, recorded: Boolean, userID: String) extends IOutMessage
case class UserStatusChange(meetingID: String, recorded: Boolean, userID: String, status: String, value: Object) extends IOutMessage