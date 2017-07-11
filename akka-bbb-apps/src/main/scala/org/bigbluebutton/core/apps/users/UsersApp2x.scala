package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.users.{ ChangeUserEmojiCmdMsgHdlr, ValidateAuthTokenReqMsgHdlr }

trait UsersApp2x
    extends RegisterUserReqMsgHdlr
    with ChangeUserRoleCmdMsgHdlr
    with SyncGetUsersMeetingRespMsgHdlr
    with ValidateAuthTokenReqMsgHdlr
    with UserLeaveReqMsgHdlr
    with LogoutAndEndMeetingCmdMsgHdlr
    with MeetingActivityResponseCmdMsgHdlr
    with SetRecordingStatusCmdMsgHdlr
    with GetRecordingStatusReqMsgHdlr
    with AssignPresenterReqMsgHdlr
    with EjectUserFromMeetingCmdMsgHdlr
    with ChangeUserEmojiCmdMsgHdlr {

  this: MeetingActor =>

}
