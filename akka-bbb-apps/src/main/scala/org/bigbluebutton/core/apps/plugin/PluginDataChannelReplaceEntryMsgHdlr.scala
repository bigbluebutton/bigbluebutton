package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelReplaceEntryMsg
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.{checkPermission, dataChannelCheckingLogic, defaultCreatorCheck}
import org.bigbluebutton.core.db.{JsonUtils, PluginDataChannelEntryDAO}
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{HandlerHelpers, LiveMeeting, LogHelper}

trait PluginDataChannelReplaceEntryMsgHdlr extends HandlerHelpers with LogHelper {

  def handle(msg: PluginDataChannelReplaceEntryMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {
    log.debug("RECEIVED PluginDataChannelReplaceEntryMsg msg {}", msg)

    dataChannelCheckingLogic(liveMeeting, msg.header.userId, msg.body.pluginName, msg.body.channelName, (user, dc, meetingId) => {
      val hasPermission = checkPermission(user, dc.replaceOrDeletePermission, defaultCreatorCheck(
        meetingId, msg.body, msg.header.userId))

      if (!hasPermission.contains(true)) {
        log.warning(
          s"User [${msg.header.userId}] in meeting [{}] lacks permission to update entry [{}] for plugin [{}] in data channel [{}].",
          msg.header.meetingId,
          msg.body.entryId,
          msg.body.pluginName,
          msg.body.channelName
        )

      } else {
        PluginDataChannelEntryDAO.replace(
          msg.header.meetingId,
          msg.body.pluginName,
          msg.body.channelName,
          msg.body.subChannelName,
          msg.body.entryId,
          JsonUtils.mapToJson(msg.body.payloadJson),
        )
        log.debug(
          "Successfully updated entry [{}] for plugin [{}] and data-channel [{}]. (meetingId: [{}])",
          msg.body.entryId, msg.body.pluginName, msg.body.channelName, msg.header.meetingId
        )
      }
    })
  }
}
