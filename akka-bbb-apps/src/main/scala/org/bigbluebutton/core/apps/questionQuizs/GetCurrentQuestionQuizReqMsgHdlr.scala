package org.bigbluebutton.core.apps.questionQuizs

import org.bigbluebutton.common2.domain.QuestionQuizVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.QuestionQuizs
import org.bigbluebutton.core.running.LiveMeeting

trait GetCurrentQuestionQuizReqMsgHdlr {
  this: QuestionQuizApp2x =>

  def handle(msgIn: GetCurrentQuestionQuizReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: GetCurrentQuestionQuizReqMsg, hasQuestionQuiz: Boolean, pvo: Option[QuestionQuizVO]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(GetCurrentQuestionQuizRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetCurrentQuestionQuizRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = GetCurrentQuestionQuizRespMsgBody(msg.header.userId, hasQuestionQuiz, pvo)
      val event = GetCurrentQuestionQuizRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val questionQuizVO = QuestionQuizs.handleGetCurrentQuestionQuizReqMsg(state, msgIn.header.userId, liveMeeting)

    questionQuizVO match {
      case Some(questionQuiz) =>
        broadcastEvent(msgIn, true, questionQuizVO)
      case None =>
        broadcastEvent(msgIn, false, None)
    }
  }
}
