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
        log.warning(
          "User [{}] in meeting [{}] lacks permission to write in data-channel [{}] from plugin [{}].",
          msg.header.userId, msg.header.meetingId, msg.body.channelName, msg.body.pluginName
        )
      } else if (msg.body.payloadJson == null) {
        log.error(
          "Received payload null for plugin [{}] and data-channel [{}]. Not persisting entry. (meetingId: [{}])",
          msg.body.pluginName, msg.body.channelName, msg.header.meetingId
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
        log.debug(
          "Successfully inserted entry for plugin [{}] and data-channel [{}]. (meetingId: [{}])",
          msg.body.pluginName, msg.body.channelName, msg.header.meetingId
        )
      }
    })
  }
}
