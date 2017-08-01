package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait ShowPollResultReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleShowPollResultReqMsg(msg: ShowPollResultReqMsg): Unit = {

    def broadcastEvent(msg: ShowPollResultReqMsg, result: SimplePollResultOutVO, annot: AnnotationVO): Unit = {
      // PollShowResultEvtMsg
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollShowResultEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollShowResultEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = PollShowResultEvtMsgBody(msg.header.userId, msg.body.pollId, result)
      val event = PollShowResultEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      // SendWhiteboardAnnotationPubMsg
      val annotationRouting = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val annotationEnvelope = BbbCoreEnvelope(SendWhiteboardAnnotationEvtMsg.NAME, annotationRouting)
      val annotationHeader = BbbClientMsgHeader(SendWhiteboardAnnotationEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val annotMsgBody = SendWhiteboardAnnotationEvtMsgBody(annot)
      val annotationEvent = SendWhiteboardAnnotationEvtMsg(annotationHeader, annotMsgBody)
      val annotationMsgEvent = BbbCommonEnvCoreMsg(annotationEnvelope, annotationEvent)
      outGW.send(annotationMsgEvent)
    }

    for {
      (result, annotationProp) <- Polls.handleShowPollResultReqMsg(msg.header.userId, msg.body.pollId, liveMeeting)
    } yield {

      broadcastEvent(msg, result, annotationProp)
    }
  }
}
