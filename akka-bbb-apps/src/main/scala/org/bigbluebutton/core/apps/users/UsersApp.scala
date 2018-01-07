package org.bigbluebutton.core.apps.users

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

class UsersApp(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMsgRouter,
  val eventBus:    InternalEventBus
)(implicit val context: ActorContext)

    extends ValidateAuthTokenReqMsgHdlr
    with GetUsersMeetingReqMsgHdlr
    with RegisterUserReqMsgHdlr
    with ChangeUserRoleCmdMsgHdlr
    with SyncGetUsersMeetingRespMsgHdlr
    with LogoutAndEndMeetingCmdMsgHdlr
    with MeetingActivityResponseCmdMsgHdlr
    with SetRecordingStatusCmdMsgHdlr
    with UpdateWebcamsOnlyForModeratorCmdMsgHdlr
    with GetRecordingStatusReqMsgHdlr
    with AssignPresenterReqMsgHdlr
    with EjectUserFromMeetingCmdMsgHdlr {

  val log = Logging(context.system, getClass)
}
