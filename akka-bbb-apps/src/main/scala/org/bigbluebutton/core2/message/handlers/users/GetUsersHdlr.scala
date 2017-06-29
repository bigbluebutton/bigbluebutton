package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.{ OutMessageGateway }
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.running.MeetingActor

trait GetUsersHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetUsers(msg: GetUsers): Unit = {
    sendAllUsersInMeeting(msg.requesterID)
  }

}
