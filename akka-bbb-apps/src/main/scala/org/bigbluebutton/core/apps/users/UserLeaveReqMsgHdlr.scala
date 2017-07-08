package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.MeetingActor

trait UserLeaveReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserLeaveReqMsg(msg: UserLeaveReqMsg): Unit = {
    for {
      u <- Users2x.remove(liveMeeting.users2x, msg.body.userId)
    } yield {
      log.info("User left meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)

      captionApp2x.handleUserLeavingMsg(msg.body.userId)
      liveMeeting.startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
      sendUserLeftMeetingEvtMsg(outGW, props.meetingProp.intId, msg.body.userId)
    }
  }

  def sendUserLeftMeetingEvtMsg(outGW: OutMessageGateway, meetingId: String, userId: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserLeftMeetingEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserLeftMeetingEvtMsg.NAME, meetingId, userId)
    val body = UserLeftMeetingEvtMsgBody(userId)
    val event = UserLeftMeetingEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
