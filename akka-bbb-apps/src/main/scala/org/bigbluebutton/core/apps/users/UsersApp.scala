package org.bigbluebutton.core.apps.users

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.handlers.users.ValidateAuthTokenReqMsgHdlr

class UsersApp(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMessageGateway,
  val eventBus:    IncomingEventBus
)(implicit val context: ActorContext)

    extends ValidateAuthTokenReqMsgHdlr
    with GetUsersMeetingReqMsgHdlr
    with RegisterUserReqMsgHdlr
    with ChangeUserRoleCmdMsgHdlr
    with SyncGetUsersMeetingRespMsgHdlr
    with LogoutAndEndMeetingCmdMsgHdlr
    with MeetingActivityResponseCmdMsgHdlr
    with SetRecordingStatusCmdMsgHdlr
    with GetRecordingStatusReqMsgHdlr
    with AssignPresenterReqMsgHdlr
    with EjectUserFromMeetingCmdMsgHdlr {

  val log = Logging(context.system, getClass)
}
