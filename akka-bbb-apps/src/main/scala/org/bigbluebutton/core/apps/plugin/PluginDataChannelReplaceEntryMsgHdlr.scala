package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelReplaceEntryMsg
import org.bigbluebutton.core.db.{JsonUtils, PluginDataChannelEntryDAO}
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{PluginModel, Roles, Users2x}
import org.bigbluebutton.core.running.{HandlerHelpers, LiveMeeting}

trait PluginDataChannelReplaceEntryMsgHdlr extends HandlerHelpers {

  def handle(msg: PluginDataChannelReplaceEntryMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {
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
              val hasPermission = for {
                replaceOrDeletePermission <- dc.replaceOrDeletePermission
              } yield {
                replaceOrDeletePermission.toLowerCase match {
                  case "all" => true
                  case "moderator" => user.role == Roles.MODERATOR_ROLE
                  case "presenter" => user.presenter
                  case "creator" => {
                    val creatorUserId = PluginDataChannelEntryDAO.getEntryCreator(
                      meetingId,
                      msg.body.pluginName,
                      msg.body.channelName,
                      msg.body.subChannelName,
                      msg.body.entryId
                    )
                    creatorUserId == msg.header.userId
                  }
                  case _ => false
                }
              }

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
            case None => println(s"Data channel '${msg.body.channelName}' not found in plugin '${msg.body.pluginName}'.")
          }
        case None => println(s"Plugin '${msg.body.pluginName}' not found.")
      }
    }
  }
}
