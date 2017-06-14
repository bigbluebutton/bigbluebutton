package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ InitLockSettings, PermissionsSettingInitialized }
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait InitLockSettingsHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleInitLockSettings(msg: InitLockSettings) {
    if (!MeetingStatus2x.permisionsInitialized(liveMeeting.status)) {
      MeetingStatus2x.initializePermissions(liveMeeting.status)
      liveMeeting.newPermissions(msg.settings)
      outGW.send(new PermissionsSettingInitialized(msg.meetingID, msg.settings,
        Users.getUsers(liveMeeting.users).toArray))
    }
  }
}
