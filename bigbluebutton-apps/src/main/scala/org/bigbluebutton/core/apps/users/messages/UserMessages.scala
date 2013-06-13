package org.bigbluebutton.core.apps.users.messages

import org.bigbluebutton.core.api.OutMessage
import java.util.Map

case class EndAndKickAll(val meetingID: String, recorded: Boolean) extends OutMessage
case class AssignPresenter(meetingID: String, recorded: Boolean, newPresenterID: String, newPresenterName: String, assignedBy: String) extends OutMessage
case class UserJoined(meetingID: String, recorded: Boolean, internalUserID: String, 
			externalUserID: String, name: String, role: String, status: Map[String, Object]) extends OutMessage
case class UserLeft(meetingID: String, userID: String) extends OutMessage
case class UserStatusChange(meetingID: String, userID: String, status: String, value: Object) extends OutMessage