package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.running.MeetingActor

trait UsersApp2x
  extends UserLeaveReqMsgHdlr
  with LockUserInMeetingCmdMsgHdlr
  with LockUsersInMeetingCmdMsgHdlr
  with GetLockSettingsReqMsgHdlr
  with ChangeUserEmojiCmdMsgHdlr
  with ClearAllUsersEmojiCmdMsgHdlr
  with UserReactionTimeExpiredCmdMsgHdlr {

  this: MeetingActor =>

}
