package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait GetCamSubscribePermissionReqMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         GetCamSubscribePermissionReqMsg,
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
      val envelope = BbbCoreEnvelope(GetCamSubscribePermissionRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetCamSubscribePermissionRespMsg.NAME, meetingId, userId)
      val body = GetCamSubscribePermissionRespMsgBody(
        meetingId,
        userId,
        streamId,
        sfuSessionId,
        allowed
      )
      val event = GetCamSubscribePermissionRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val allowed = CameraHdlrHelpers.isCameraSubscribeAllowed(
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
