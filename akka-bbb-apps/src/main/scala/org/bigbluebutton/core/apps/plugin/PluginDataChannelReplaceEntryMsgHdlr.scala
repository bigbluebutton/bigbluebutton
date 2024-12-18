package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelReplaceEntryMsg
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.{checkPermission, dataChannelCheckingLogic, defaultCreatorCheck}
import org.bigbluebutton.core.db.{JsonUtils, PluginDataChannelEntryDAO}
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{HandlerHelpers, LiveMeeting}

trait PluginDataChannelReplaceEntryMsgHdlr extends HandlerHelpers {

  def handle(msg: PluginDataChannelReplaceEntryMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {

    dataChannelCheckingLogic(liveMeeting, msg.header.userId, msg.body.pluginName, msg.body.channelName, (user, dc, meetingId) => {
      val hasPermission = checkPermission(user, dc.replaceOrDeletePermission, defaultCreatorCheck(
        meetingId, msg.body, msg.header.userId))

      if (!hasPermission.contains(true)) {
        println(s"No permission to write in plugin: '${msg.body.pluginName}', data channel: '${msg.body.channelName}'.")
      } else {
        PluginDataChannelEntryDAO.replace(
          msg.header.meetingId,
          msg.body.pluginName,
          msg.body.channelName,
          msg.body.subChannelName,
          msg.body.entryId,
          JsonUtils.mapToJson(msg.body.payloadJson),
        )
      }
    })
  }
}
