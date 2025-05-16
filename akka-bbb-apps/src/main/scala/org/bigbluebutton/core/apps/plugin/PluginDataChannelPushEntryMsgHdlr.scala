package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.common2.msgs.{ PluginDataChannelPushEntryMsg, PluginDataChannelPushEntryEvtMsg, PluginDataChannelPushEntryEvtMsgBody, BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, Routing }
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.{ checkPermission, dataChannelCheckingLogic, defaultCreatorCheck }
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait PluginDataChannelPushEntryMsgHdlr extends HandlerHelpers {
  this: PluginHdlrs =>

  def broadcastEvent(msg: PluginDataChannelPushEntryMsg, entryId: String, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
    val envelope = BbbCoreEnvelope(PluginDataChannelPushEntryEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(PluginDataChannelPushEntryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

    val body = PluginDataChannelPushEntryEvtMsgBody(msg.body.pluginName, msg.body.channelName, msg.body.subChannelName, msg.body.payloadJson, entryId, msg.body.toRoles, msg.body.toUserIds)
    val event = PluginDataChannelPushEntryEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(msgEvent)
  }

  def handle(msg: PluginDataChannelPushEntryMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    dataChannelCheckingLogic(liveMeeting, msg.header.userId, msg.body.pluginName, msg.body.channelName, (user, dc, meetingId) => {
      val hasPermission = checkPermission(user, dc.pushPermission)
      if (!hasPermission.contains(true)) {
        println(s"No permission to write in plugin: '${msg.body.pluginName}', data channel: '${msg.body.channelName}'.")
      } else {
        val entryId = PluginDataChannelEntryDAO.insert(
          meetingId,
          msg.body.pluginName,
          msg.body.channelName,
          msg.body.subChannelName,
          msg.header.userId,
          msg.body.payloadJson,
          msg.body.toRoles,
          msg.body.toUserIds
        )
        broadcastEvent(msg, entryId, liveMeeting, bus)
      }
    })
  }
}
