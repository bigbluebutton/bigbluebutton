package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelPushEntryMsg
import org.bigbluebutton.core.apps.plugin.PluginHdlrHelpers.checkPermission
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ PluginModel, Roles, UserState, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait PluginDataChannelPushEntryMsgHdlr extends HandlerHelpers {

  def handle(msg: PluginDataChannelPushEntryMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {
    val pluginsDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("plugins")
    val meetingId = liveMeeting.props.meetingProp.intId

    for {
      _ <- if (!pluginsDisabled) Some(()) else None
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      PluginModel.getPluginByName(liveMeeting.plugins, msg.body.pluginName) match {
        case Some(p) =>
          p.manifest.content.dataChannels.getOrElse(List()).find(dc => dc.name == msg.body.channelName) match {
            case Some(dc) =>
              val hasPermission = checkPermission(user, dc.pushPermission)
              if (!hasPermission.contains(true)) {
                println(s"No permission to write in plugin: '${msg.body.pluginName}', data channel: '${msg.body.channelName}'.")
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
              }
            case None => println(s"Data channel '${msg.body.channelName}' not found in plugin '${msg.body.pluginName}'.")
          }
        case None => println(s"Plugin '${msg.body.pluginName}' not found.")
      }
    }
  }
}
