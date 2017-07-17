package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.users.{ ChangeUserEmojiCmdMsgHdlr, ValidateAuthTokenReqMsgHdlr }

trait UsersApp2x
    extends UserLeaveReqMsgHdlr

    with ChangeUserEmojiCmdMsgHdlr {

  this: MeetingActor =>

}
