package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelResetMsg
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.{ checkPermission, dataChannelCheckingLogic }
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait PluginDataChannelResetMsgHdlr extends HandlerHelpers {

  def handle(msg: PluginDataChannelResetMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {
    dataChannelCheckingLogic(liveMeeting, msg.header.userId, msg.body.pluginName, msg.body.channelName, (user, dc, meetingId) => {
      val hasPermission = checkPermission(user, dc.replaceOrDeletePermission)

      if (!hasPermission.contains(true)) {
        println(s"No permission to delete (reset) in plugin: '${msg.body.pluginName}', data channel: '${msg.body.channelName}'.")
      } else {
        PluginDataChannelEntryDAO.reset(
          meetingId,
          msg.body.pluginName,
          msg.body.channelName,
          msg.body.subChannelName
        )
      }
    })
  }
}
