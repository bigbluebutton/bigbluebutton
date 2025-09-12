package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsIntOrElse
import org.bigbluebutton.core.db.NotificationDAO
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ModifyWhiteboardAccessPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: ModifyWhiteboardAccessPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ModifyWhiteboardAccessPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ModifyWhiteboardAccessEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ModifyWhiteboardAccessEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ModifyWhiteboardAccessEvtMsgBody(msg.body.whiteboardId, msg.body.multiUser)
      val event = ModifyWhiteboardAccessEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)

      val wbModel = liveMeeting.wbModel.getWhiteboard(msg.body.whiteboardId)
      val oldMultiUser = wbModel.oldMultiUser
      val newMultiUser = wbModel.multiUser
      val newWriters = newMultiUser.filter(u => !oldMultiUser.contains(u))
      val oldWriters = oldMultiUser.filter(u => !newMultiUser.contains(u))

      for (u <- newWriters) {
        val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
          u,
          liveMeeting.props.meetingProp.intId,
          "info",
          "pen_tool",
          "app.whiteboard.available",
          "Notification to when the user received whiteboard access",
          Map()
        )
        bus.outGW.send(notifyEvent)
        NotificationDAO.insert(notifyEvent)
      }

      for (u <- oldWriters) {
        val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
          u,
          liveMeeting.props.meetingProp.intId,
          "info",
          "pen_tool",
          "app.whiteboard.unavailable",
          "Notification to when the user lost whiteboard access",
          Map()
        )
        bus.outGW.send(notifyEvent)
        NotificationDAO.insert(notifyEvent)
      }
    }

    val maxNumberOfActiveUsers = getConfigPropertyValueByPathAsIntOrElse(liveMeeting.clientSettings, "public.whiteboard.maxNumberOfActiveUsers", 25)

    if (filterWhiteboardMessage(msg.body.whiteboardId, msg.header.userId, liveMeeting) && permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      if (isNonEjectionGracePeriodOver(msg.body.whiteboardId, msg.header.userId, liveMeeting)) {
        val meetingId = liveMeeting.props.meetingProp.intId
        val reason = "No permission to modify access to the whiteboard."
        PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      }
    } else if (msg.body.multiUser.length > maxNumberOfActiveUsers) {
      log.info("Setting whiteboard access in meeting {} for whiteboard {} exceeds the maximum number of {} writers. Ignoring the message...", msg.header.meetingId, msg.body.whiteboardId, maxNumberOfActiveUsers)
    } else {
      modifyWhiteboardAccess(msg.body.whiteboardId, msg.body.multiUser, liveMeeting)
      broadcastEvent(msg)
    }
  }
}
