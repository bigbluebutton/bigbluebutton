package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ MediaStream, WebcamStream, Webcams }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait UserBroadcastCamStartMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserBroadcastCamStartMsg(msg: UserBroadcastCamStartMsg): Unit = {

    def broadcastEvent(msg: UserBroadcastCamStartMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserBroadcastCamStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserBroadcastCamStartedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = UserBroadcastCamStartedEvtMsgBody(msg.header.userId, msg.body.stream)
      val event = UserBroadcastCamStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val stream = new MediaStream(msg.body.stream, msg.body.stream, msg.header.userId, Map.empty, Set.empty)
    val webcamStream = new WebcamStream(msg.body.stream, stream)

    for {
      uvo <- Webcams.addWebcamBroadcastStream(liveMeeting.webcams, webcamStream)
    } yield {
      broadcastEvent(msg)
    }
  }
}
