package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.users.ValidateAuthTokenReqMsgHdlr

trait UsersApp2x
    extends RegisterUserReqMsgHdlr
    with ChangeUserRoleHdlr
    with SyncGetUsersMeetingRespMsgHdlr
    with EjectUserFromMeetingHdlr
    with ValidateAuthTokenReqMsgHdlr {

  this: MeetingActor =>

}
