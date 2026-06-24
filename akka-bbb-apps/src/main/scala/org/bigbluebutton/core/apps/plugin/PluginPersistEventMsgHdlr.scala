package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, PluginPersistEventEvtMsg, PluginPersistEventEvtMsgBody, PluginPersistEventMsg, Routing }
import org.bigbluebutton.core.apps.PermissionCheck
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

      val body = PluginPersistEventEvtMsgBody(msg.body.pluginName, msg.body.eventName, msg.body.payloadJson)
      val event = PluginPersistEventEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("plugins")) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "Plugin feature is disabled for this meeting"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      PluginModel.getPluginManifestContentByName(liveMeeting.plugins, msg.body.pluginName) match {
        case Some(pluginManifestContent) => if (msg.body.eventName.trim.isEmpty) {
          log.info(s"Empty event name received for plugin '${msg.body.pluginName}'")
        } else {
          val eventPersistence = pluginManifestContent.eventPersistence
          eventPersistence match {
            case Some(permissions) if permissions.isEnabled =>
              broadcastEvent(msg, bus)
            case Some(_) =>
              log.info(s"Event persistence is disabled for plugin '${msg.body.pluginName}'")
            case None =>
              log.info(s"Event persistence permissions not defined for plugin '${msg.body.pluginName}'")
          }
        }
        case None =>
          log.info(s"Plugin '${msg.body.pluginName}' not found.")
      }

    }

  }
}
