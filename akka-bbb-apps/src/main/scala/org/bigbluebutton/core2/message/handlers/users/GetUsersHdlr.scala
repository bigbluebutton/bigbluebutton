package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.{ OutMessageGateway }
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.{ GetUsersMeetingRespMsgBuilder, Sender }

trait GetUsersHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetUsers(msg: GetUsers): Unit = {
    sendAllUsersInMeeting(msg.requesterID)
  }

}
