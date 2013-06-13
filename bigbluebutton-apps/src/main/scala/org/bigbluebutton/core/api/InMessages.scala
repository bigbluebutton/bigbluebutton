package org.bigbluebutton.core.api

import org.bigbluebutton.core.Role._

abstract class InMessage

case class CreateMeeting(id: String, recorded: Boolean) extends InMessage
case class DestroyMeeting(id: String) extends InMessage
case class StartMeeting(id: String) extends InMessage
case class EndMeeting(id: String) extends InMessage

case class UserJoining(meetingID: String, userID: String, name: String, role: Role, extUserID: String) extends InMessage
case class UserLeaving(meetingID: String, userID: String) extends InMessage
case class GetUsers(meetingID: String, requesterID: String) extends InMessage
case class ChangeUserStatus(meetingID: String, userID: String, status: String, value: Object) extends InMessage
case class AssignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String) extends InMessage

case class SampleInMessage(meetingID: String) extends InMessage