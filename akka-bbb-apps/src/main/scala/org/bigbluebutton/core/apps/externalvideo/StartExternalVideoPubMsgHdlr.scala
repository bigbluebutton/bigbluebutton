package org.bigbluebutton.core.apps.externalvideo

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ ExternalVideoModel, PermissionCheck, RightsManagementTrait, ScreenshareModel }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait StartExternalVideoPubMsgHdlr extends RightsManagementTrait {
  this: ExternalVideoApp2x =>

  def handle(msg: StartExternalVideoPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("Received StartExternalVideoPubMsgr meetingId={} url={}", liveMeeting.props.meetingProp.intId, msg.body.externalVideoUrl)

    def broadcastEvent(msg: StartExternalVideoPubMsg) {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(StartExternalVideoEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(StartExternalVideoEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = StartExternalVideoEvtMsgBody(msg.body.externalVideoUrl)
      val event = StartExternalVideoEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter to start external videos"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {

      //Stop ScreenShare if it's running
      ScreenshareModel.stop(bus.outGW, liveMeeting)

      ExternalVideoModel.setURL(liveMeeting.externalVideoModel, msg.body.externalVideoUrl)
      broadcastEvent(msg)
    }
  }
}
