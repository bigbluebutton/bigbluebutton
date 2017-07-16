package org.bigbluebutton.core.apps.users

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.handlers.users.ValidateAuthTokenReqMsgHdlr

class UsersApp(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMessageGateway
)(implicit val context: ActorContext)

    extends ValidateAuthTokenReqMsgHdlr
    with GetUsersMeetingReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
