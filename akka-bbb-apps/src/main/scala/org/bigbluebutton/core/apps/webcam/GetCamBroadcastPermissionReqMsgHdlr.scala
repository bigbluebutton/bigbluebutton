package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait GetCamBroadcastPermissionReqMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         GetCamBroadcastPermissionReqMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ) {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(
        meetingId:    String,
        userId:       String,
        streamId:     String,
        sfuSessionId: String,
        allowed:      Boolean
    ) {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetCamBroadcastPermissionRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetCamBroadcastPermissionRespMsg.NAME, meetingId, userId)
      val body = GetCamBroadcastPermissionRespMsgBody(
        meetingId,
        userId,
        streamId,
        sfuSessionId,
        allowed
      )
      val event = GetCamBroadcastPermissionRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val allowed = CameraHdlrHelpers.isCameraBroadcastAllowed(
      liveMeeting,
      meetingId,
      msg.body.userId,
      msg.body.streamId
    )

    broadcastEvent(
      meetingId,
      msg.body.userId,
      msg.body.streamId,
      msg.body.sfuSessionId,
      allowed
    )
  }
}
