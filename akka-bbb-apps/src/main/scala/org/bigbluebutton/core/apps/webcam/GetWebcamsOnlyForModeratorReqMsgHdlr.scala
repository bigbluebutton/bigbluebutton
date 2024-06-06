package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.MeetingStatus2x

trait GetWebcamsOnlyForModeratorReqMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         GetWebcamsOnlyForModeratorReqMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ) {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(meetingId: String, userId: String, webcamsOnlyForModerator: Boolean) {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetWebcamsOnlyForModeratorRespMsg.NAME, routing)
      val body = GetWebcamsOnlyForModeratorRespMsgBody(webcamsOnlyForModerator, userId)
      val header = BbbClientMsgHeader(GetWebcamsOnlyForModeratorRespMsg.NAME, meetingId, userId)
      val event = GetWebcamsOnlyForModeratorRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val webcamsOnlyForModerator = MeetingStatus2x.webcamsOnlyForModeratorEnabled(liveMeeting.status)

    broadcastEvent(meetingId, msg.body.requestedBy, webcamsOnlyForModerator)
  }
}
