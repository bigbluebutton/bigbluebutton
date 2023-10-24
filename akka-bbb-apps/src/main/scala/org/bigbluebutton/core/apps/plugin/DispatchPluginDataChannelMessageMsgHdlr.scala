package org.bigbluebutton.core.apps.plugin

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PluginDataChannelDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait DispatchPluginDataChannelMessageMsgHdlr extends HandlerHelpers {
  //  this: GroupChatHdlrs =>

  def handle(msg: DispatchPluginDataChannelMessageMsg, state: MeetingState2x, liveMeeting: LiveMeeting): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId
    //    val pluginDisabled: Boolean = liveMeeting.props.meetingProp.disabledFeatures.contains("plugin")

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      //Check plugin exists
      //Check channel exists
      //Check plugin write permission
      //Check if user has permission to write into this channel
      PluginDataChannelDAO.insert(
        meetingId,
        msg.body.pluginName,
        msg.body.dataChannel,
        msg.header.userId,
        msg.body.msgJson,
        msg.body.toRole,
        msg.body.toUserId
      )
    }
  }

}
