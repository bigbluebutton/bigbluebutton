package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs.PluginDataChannelReplaceOrDeleteBaseBody
import org.bigbluebutton.core.db.PluginDataChannelEntryDAO
import org.bigbluebutton.core.models.{ Roles, UserState }

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
}
