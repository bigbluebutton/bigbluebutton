package org.bigbluebutton.core.apps.externalvideo

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait, ExternalVideoModel }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }

trait StopExternalVideoPubMsgHdlr extends RightsManagementTrait {
  this: ExternalVideoApp2x =>

  def handle(msg: StopExternalVideoPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("Received StopExternalVideoPubMsgr meetingId={}", liveMeeting.props.meetingProp.intId)

    def broadcastEvent() {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(StopExternalVideoEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(StopExternalVideoEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = StopExternalVideoEvtMsgBody()
      val event = StopExternalVideoEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter to stop external video"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      ExternalVideoModel.clear(liveMeeting.externalVideoModel)
      broadcastEvent()
    }
  }
}
