package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ NewPermissionsSetting, SetLockSettings }
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait SetLockSettingsHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleSetLockSettings(msg: SetLockSettings) {
    if (!liveMeeting.permissionsEqual(msg.settings)) {
      liveMeeting.newPermissions(msg.settings)

      /*
      outGW.send(new NewPermissionsSetting(props.meetingProp.intId, msg.setByUser,
        MeetingStatus2x.getPermissions(liveMeeting.status),
        Users.getUsers(liveMeeting.users).toArray))
*/
      handleLockLayout(msg.settings.lockedLayout, msg.setByUser)
    }
  }
}
