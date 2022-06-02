package org.bigbluebutton.core.apps.questionQuizs

import org.bigbluebutton.common2.domain.SimpleQuestionQuizResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.QuestionQuizs
import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.core.models.Users2x

trait RespondToTypedQuestionQuizReqMsgHdlr {
  this: QuestionQuizApp2x =>

  def handle(msg: RespondToTypedQuestionQuizReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastQuestionQuizUpdatedEvent(msg: RespondToTypedQuestionQuizReqMsg, questionQuizId: String, questionQuiz: SimpleQuestionQuizResultOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(QuestionQuizUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(QuestionQuizUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = QuestionQuizUpdatedEvtMsgBody(questionQuizId, questionQuiz)
      val event = QuestionQuizUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def broadcastUserRespondedToTypedQuestionQuizRespMsg(msg: RespondToTypedQuestionQuizReqMsg, questionQuizId: String, answer: String, sendToId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, sendToId)
      val envelope = BbbCoreEnvelope(UserRespondedToTypedQuestionQuizRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserRespondedToTypedQuestionQuizRespMsg.NAME, liveMeeting.props.meetingProp.intId, sendToId)

      val body = UserRespondedToTypedQuestionQuizRespMsgBody(questionQuizId, msg.header.userId, answer)
      val event = UserRespondedToTypedQuestionQuizRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      (questionQuizId: String, updatedQuestionQuiz: SimpleQuestionQuizResultOutVO) <- QuestionQuizs.handleRespondToTypedQuestionQuizReqMsg(msg.header.userId, msg.body.questionQuizId,
        msg.body.questionId, msg.body.answer, liveMeeting)
    } yield {
      broadcastQuestionQuizUpdatedEvent(msg, questionQuizId, updatedQuestionQuiz)

      for {
        presenter <- Users2x.findPresenter(liveMeeting.users2x)
      } yield {
        broadcastUserRespondedToTypedQuestionQuizRespMsg(msg, questionQuizId, msg.body.answer, presenter.intId)
      }
    }
  }
}
