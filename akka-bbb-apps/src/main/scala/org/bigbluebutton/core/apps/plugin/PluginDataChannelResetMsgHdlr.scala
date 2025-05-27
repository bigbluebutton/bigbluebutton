package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelResetMsg
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.{ checkPermission, dataChannelCheckingLogic }
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, LogHelper }

trait PluginDataChannelResetMsgHdlr extends HandlerHelpers with LogHelper {

  def handle(msg: PluginDataChannelResetMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {
    dataChannelCheckingLogic(liveMeeting, msg.header.userId, msg.body.pluginName, msg.body.channelName, (user, dc, meetingId) => {
      val hasPermission = checkPermission(user, dc.replaceOrDeletePermission)

      if (!hasPermission.contains(true)) {
        log.warning(
          "User [{}] in meeting [{}] lacks permission to reset data-channel [{}] from plugin [{}].",
          msg.header.userId, msg.header.meetingId, msg.body.channelName, msg.body.pluginName
        )
      } else {
        PluginDataChannelEntryDAO.reset(
          meetingId,
          msg.body.pluginName,
          msg.body.channelName,
          msg.body.subChannelName
        )
        log.debug(
          "Successfully reset data-channel [{}] for plugin [{}]. (meetingId: [{}])",
          msg.body.channelName, msg.body.pluginName, msg.header.meetingId
        )
      }
    })
  }
}
