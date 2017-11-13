package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.SystemConfiguration

trait ClearWhiteboardPubMsgHdlr extends SystemConfiguration {
  this: WhiteboardApp2x =>

  def handle(msg: ClearWhiteboardPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ClearWhiteboardPubMsg, fullClear: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ClearWhiteboardEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ClearWhiteboardEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ClearWhiteboardEvtMsgBody(msg.body.whiteboardId, msg.header.userId, fullClear)
      val event = ClearWhiteboardEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (!getWhiteboardAccess(liveMeeting) && applyPermissionCheck && !PermissionCheck.isAllowed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to clear the whiteboard."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW)
    } else {
      for {
        fullClear <- clearWhiteboard(msg.body.whiteboardId, msg.header.userId, liveMeeting)
      } yield {
        broadcastEvent(msg, fullClear)
      }
    }
  }
}
