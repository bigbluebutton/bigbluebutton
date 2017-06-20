package org.bigbluebutton.core.apps.users

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.LiveMeeting

class UsersApp2x(val liveMeeting: LiveMeeting,
  val outGW: OutMessageGateway)(implicit val context: ActorContext)
    extends ChangeUserRoleHdlr
    with EjectUserFromMeetingHdlr {

  val log = Logging(context.system, getClass)

}
