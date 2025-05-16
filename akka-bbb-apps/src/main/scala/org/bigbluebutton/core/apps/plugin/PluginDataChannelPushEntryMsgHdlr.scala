package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelPushEntryMsg
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.{ checkPermission, dataChannelCheckingLogic }
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, LogHelper }

trait PluginDataChannelPushEntryMsgHdlr extends HandlerHelpers with LogHelper {

  def handle(msg: PluginDataChannelPushEntryMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {
    dataChannelCheckingLogic(liveMeeting, msg.header.userId, msg.body.pluginName, msg.body.channelName, (user, dc, meetingId) => {
      val hasPermission = checkPermission(user, dc.pushPermission)
      if (!hasPermission.contains(true)) {
        log.warning("No permission to write in data-channel [{}] for plugin [{}].", msg.body.channelName, msg.body.pluginName)
      } else if (msg.body.payloadJson == null) {
        log.error(
          "Received payload null for plugin [{}] and data channel [{}]. Not persisting entry.",
          msg.body.pluginName, msg.body.channelName
        )
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
        log.info(
          "Successfully inserted entry for plugin: [{}] and data channel: [{}].",
          msg.body.pluginName, msg.body.channelName
        )
      }
    })
  }
}
