package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ClearWhiteboardPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: ClearWhiteboardPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ClearWhiteboardPubMsg, fullClear: Boolean): Unit = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, liveMeeting.props.systemProps.html5InstanceId.toString)
      val envelope = BbbCoreEnvelope(ClearWhiteboardEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ClearWhiteboardEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ClearWhiteboardEvtMsgBody(msg.body.whiteboardId, msg.header.userId, fullClear)
      val event = ClearWhiteboardEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (filterWhiteboardMessage(msg.body.whiteboardId, msg.header.userId, liveMeeting) && permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      if (isNonEjectionGracePeriodOver(msg.body.whiteboardId, msg.header.userId, liveMeeting)) {
        val meetingId = liveMeeting.props.meetingProp.intId
        val reason = "No permission to clear the whiteboard."
        PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      }
    } else {
      log.error("Ignoring message ClearWhiteboardPubMsg since this functions is not available in the new Whiteboard")
    }
  }
}
