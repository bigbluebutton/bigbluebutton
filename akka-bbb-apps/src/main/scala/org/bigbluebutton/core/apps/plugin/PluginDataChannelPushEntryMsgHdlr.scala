package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelPushEntryMsg
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.{ checkPermission, dataChannelCheckingLogic, defaultCreatorCheck }
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait PluginDataChannelPushEntryMsgHdlr extends HandlerHelpers {

  def handle(msg: PluginDataChannelPushEntryMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {
    dataChannelCheckingLogic(liveMeeting, msg.header.userId, msg.body.pluginName, msg.body.channelName, (user, dc, meetingId) => {
      val hasPermission = checkPermission(user, dc.pushPermission)
      if (!hasPermission.contains(true)) {
        println(s"No permission to write in plugin: '${msg.body.pluginName}', data channel: '${msg.body.channelName}'.")
      } else {
        PluginDataChannelEntryDAO.insert(
          meetingId,
          msg.body.pluginName,
          msg.body.channelName,
          msg.body.subChannelName,
          msg.header.userId,
          msg.body.payloadJson,
          msg.body.toRoles,
          msg.body.toUserIds
        )
      }
    })
  }
}
