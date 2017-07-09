package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.running.{ HandlerHelpers, MeetingActor }

trait GetUsersHdlr extends HandlerHelpers {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetUsers(msg: GetUsers): Unit = {
    sendAllUsersInMeeting(outGW, msg.requesterID, liveMeeting)
  }

}
