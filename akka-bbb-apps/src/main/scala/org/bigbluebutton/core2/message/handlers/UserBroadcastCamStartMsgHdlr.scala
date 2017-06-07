package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages.MessageBody.{ UserBroadcastCamStartedEvtMsgBody }
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait UserBroadcastCamStartMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserBroadcastCamStartMsg(msg: UserBroadcastCamStartMsg): Unit = {

    def broadcastEvent(msg: UserBroadcastCamStartMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserBroadcastCamStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserBroadcastCamStartedEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = UserBroadcastCamStartedEvtMsgBody(msg.header.userId, msg.body.stream)
      val event = UserBroadcastCamStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      uvo <- Users.userSharedWebcam(msg.header.userId, liveMeeting.users, msg.body.stream)
    } yield {
      broadcastEvent(msg)
    }
  }
}
