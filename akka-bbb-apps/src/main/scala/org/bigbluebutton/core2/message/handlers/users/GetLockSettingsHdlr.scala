package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ GetLockSettings, NewPermissionsSetting }
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait GetLockSettingsHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetLockSettings(msg: GetLockSettings) {

    //    outGW.send(new NewPermissionsSetting(props.meetingProp.intId, msg.userId,
    //      MeetingStatus2x.getPermissions(liveMeeting.status),
    //      Users.getUsers(liveMeeting.users).toArray))
  }
}
