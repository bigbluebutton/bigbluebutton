package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.{
  Users2x,
  VoiceUsers,
  Webcams
}
import org.bigbluebutton.core.running.LiveMeeting

trait SyncGetWebcamInfoRespMsgHdlr {
  this: WebcamApp2x =>

  def handleSyncGetWebcamInfoRespMsg(liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val routing = Routing.addMsgToHtml5InstanceIdRouting(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.systemProps.html5InstanceId.toString
    )
    val envelope = BbbCoreEnvelope(SyncGetWebcamInfoRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(
      SyncGetWebcamInfoRespMsg.NAME,
      liveMeeting.props.meetingProp.intId,
      "nodeJSapp"
    )

    val webcamsList = Webcams.findAll(liveMeeting.webcams) flatMap { webcam =>
      val streamId = webcam.streamId
      val userId = webcam.userId
      val pin = Users2x.isPin(userId, liveMeeting.users2x)
      for {
        u <- Users2x.findWithIntId(liveMeeting.users2x, userId)
      } yield {
        VoiceUsers.findWIthIntId(liveMeeting.voiceUsers, userId) match {
          case Some(vu) => WebcamStreamInfo(streamId, userId, u.name, pin, vu.floor, vu.lastFloorTime)
          case _        => WebcamStreamInfo(streamId, userId, u.name, pin, false, "0")
        }
      }
    }

    val body = SyncGetWebcamInfoRespMsgBody(webcamsList)
    val event = SyncGetWebcamInfoRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    bus.outGW.send(msgEvent)
  }
}
