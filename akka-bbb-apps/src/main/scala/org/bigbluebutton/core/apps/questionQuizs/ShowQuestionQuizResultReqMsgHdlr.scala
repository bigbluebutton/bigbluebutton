package org.bigbluebutton.core.apps.questionQuizs

import org.bigbluebutton.common2.domain.SimpleQuestionQuizResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.QuestionQuizs
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ShowQuestionQuizResultReqMsgHdlr extends RightsManagementTrait {
  this: QuestionQuizApp2x =>

  def handle(msg: ShowQuestionQuizResultReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ShowQuestionQuizResultReqMsg, result: SimpleQuestionQuizResultOutVO, annot: AnnotationVO): Unit = {
      // QuestionQuizShowResultEvtMsg
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(QuestionQuizShowResultEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(QuestionQuizShowResultEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = QuestionQuizShowResultEvtMsgBody(msg.header.userId, msg.body.questionQuizId, result)
      val event = QuestionQuizShowResultEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)

      // SendWhiteboardAnnotationPubMsg
      val annotationRouting = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val annotationEnvelope = BbbCoreEnvelope(SendWhiteboardAnnotationsEvtMsg.NAME, annotationRouting)
      val annotationHeader = BbbClientMsgHeader(SendWhiteboardAnnotationsEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val annotMsgBody = SendWhiteboardAnnotationsEvtMsgBody(annot.wbId, Array[AnnotationVO](annot))
      val annotationEvent = SendWhiteboardAnnotationsEvtMsg(annotationHeader, annotMsgBody)
      val annotationMsgEvent = BbbCommonEnvCoreMsg(annotationEnvelope, annotationEvent)
      bus.outGW.send(annotationMsgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to show questionQuiz results."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      for {
        (result, annotationProp) <- QuestionQuizs.handleShowQuestionQuizResultReqMsg(state, msg.header.userId, msg.body.questionQuizId, liveMeeting)
      } yield {
        broadcastEvent(msg, result, annotationProp)
      }
    }
  }
}
