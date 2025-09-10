package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelReplaceOrDeleteBaseBody
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.models.{ DataChannel, PluginModel, Roles, UserState, Users2x }
import org.bigbluebutton.core.running.LiveMeeting

object PluginHdlrHelpers {
  def checkPermission(user: UserState, permissionType: List[String], creatorCheck: => Boolean = false): List[Boolean] = {
    permissionType.map(_.toLowerCase).map {
      case "all"       => true
      case "moderator" => user.role == Roles.MODERATOR_ROLE
      case "presenter" => user.presenter
      case "creator"   => creatorCheck
      case _           => false
    }
  }
  def defaultCreatorCheck[T <: PluginDataChannelReplaceOrDeleteBaseBody](meetingId: String, msgBody: T, userId: String): Boolean = {
    val creatorUserId = PluginDataChannelEntryDAO.getEntryCreator(
      meetingId,
      msgBody.pluginName,
      msgBody.channelName,
      msgBody.subChannelName,
      msgBody.entryId
    )
    creatorUserId == userId
  }

  def dataChannelCheckingLogic(liveMeeting: LiveMeeting, userId: String,
                               pluginName: String, channelName: String,
                               caseSomeDataChannelAndPlugin: (UserState, DataChannel, String) => Unit): Option[Unit] = {
    val pluginsDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("plugins")
    val meetingId = liveMeeting.props.meetingProp.intId

    for {
      _ <- if (!pluginsDisabled) Some(()) else None
      user <- Users2x.findWithIntId(liveMeeting.users2x, userId)
    } yield {
      PluginModel.getPluginManifestContentByName(liveMeeting.plugins, pluginName) match {
        case Some(pluginManifestContent) =>
          pluginManifestContent.dataChannels.getOrElse(List()).find(dc => dc.name == channelName) match {
            case Some(dc) =>
              caseSomeDataChannelAndPlugin(user, dc, meetingId)
            case None => println(s"Data channel '${channelName}' not found in plugin '${pluginName}'.")
          }
        case None => println(s"Plugin '${pluginName}' not found.")
      }
    }
  }
}
