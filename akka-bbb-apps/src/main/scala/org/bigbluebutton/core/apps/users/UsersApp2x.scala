package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.running.MeetingActor

trait UsersApp2x
  extends UserLeaveReqMsgHdlr
  with LockUserInMeetingCmdMsgHdlr
  with ChangeUserLockSettingsInMeetingCmdMsgHdlr
  with LockUsersInMeetingCmdMsgHdlr
  with ClearAllUsersReactionCmdMsgHdlr {

  this: MeetingActor =>

}
