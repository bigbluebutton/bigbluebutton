package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, PluginPersistEventEvtMsg, PluginPersistEventEvtMsgBody, PluginPersistEventMsg, Routing }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PluginModel
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait PluginPersistEventMsgHdlr extends HandlerHelpers {
  this: PluginHdlrs =>

  def handle(msg: PluginPersistEventMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: PluginPersistEventMsg, bus: MessageBus): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PluginPersistEventEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PluginPersistEventEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PluginPersistEventEvtMsgBody(msg.body.pluginName, msg.body.eventName, msg.body.payload)
      val event = PluginPersistEventEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val pluginsDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("plugins")
    for {
      _ <- if (!pluginsDisabled) Some(()) else None
    } yield {
      PluginModel.getPluginByName(liveMeeting.plugins, msg.body.pluginName) match {
        case Some(p) =>
          val eventPersistencePermissions = p.manifest.content.eventPersistence.orNull;
          if (eventPersistencePermissions.isEnabled) {
            broadcastEvent(msg, bus)
          } else log.info(s"Event persistence not available for plugin '${msg.body.pluginName}'.")
        case None => log.info(s"Plugin '${msg.body.pluginName}' not found.")
      }
    }

  }
}
