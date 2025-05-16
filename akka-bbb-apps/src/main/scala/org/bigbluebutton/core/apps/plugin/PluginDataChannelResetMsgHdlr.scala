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
          "No permission to reset data-channel [{}] for plugin [{}].",
          msg.body.channelName,
          msg.body.pluginName,
        )
      } else {
        PluginDataChannelEntryDAO.reset(
          meetingId,
          msg.body.pluginName,
          msg.body.channelName,
          msg.body.subChannelName
        )
        log.info(
          "Successfully reset data-channel [{}] for plugin [{}].",
          msg.body.channelName, msg.body.pluginName
        )
      }
    })
  }
}
