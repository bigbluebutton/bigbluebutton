package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelDeleteEntryMsg
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.{ checkPermission, dataChannelCheckingLogic, defaultCreatorCheck }
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait PluginDataChannelDeleteEntryMsgHdlr extends HandlerHelpers {

  def handle(msg: PluginDataChannelDeleteEntryMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {
    dataChannelCheckingLogic(liveMeeting, msg.header.userId, msg.body.pluginName, msg.body.channelName, (user, dc, meetingId) => {
      val hasPermission = checkPermission(user, dc.replaceOrDeletePermission, defaultCreatorCheck(
        meetingId, msg.body, msg.header.userId
      ))
      if (!hasPermission.contains(true)) {
        println(s"No permission to delete in plugin: '${msg.body.pluginName}', data channel: '${msg.body.channelName}'.")
      } else {
        PluginDataChannelEntryDAO.delete(
          meetingId,
          msg.body.pluginName,
          msg.body.channelName,
          msg.body.subChannelName,
          msg.body.entryId
        )
      }
    })
  }
}
