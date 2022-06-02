package org.bigbluebutton.core.apps.questionQuizs

import org.bigbluebutton.common2.domain.SimpleQuestionQuizResultOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.QuestionQuizs
import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.core.models.Users2x

trait RespondToQuestionQuizReqMsgHdlr {
  this: QuestionQuizApp2x =>

  def handle(msg: RespondToQuestionQuizReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastQuestionQuizUpdatedEvent(msg: RespondToQuestionQuizReqMsg, questionQuizId: String, questionQuiz: SimpleQuestionQuizResultOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(QuestionQuizUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(QuestionQuizUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = QuestionQuizUpdatedEvtMsgBody(questionQuizId, questionQuiz)
      val event = QuestionQuizUpdatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def broadcastUserRespondedToQuestionQuizRecordMsg(msg: RespondToQuestionQuizReqMsg, questionQuizId: String, answerId: Int, answer: String, isSecret: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UserRespondedToQuestionQuizRecordMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserRespondedToQuestionQuizRecordMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = UserRespondedToQuestionQuizRecordMsgBody(questionQuizId, answerId, answer, isSecret)
      val event = UserRespondedToQuestionQuizRecordMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def broadcastUserRespondedToQuestionQuizRespMsg(msg: RespondToQuestionQuizReqMsg, questionQuizId: String, answerIds: Seq[Int], sendToId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, sendToId)
      val envelope = BbbCoreEnvelope(UserRespondedToQuestionQuizRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserRespondedToQuestionQuizRespMsg.NAME, liveMeeting.props.meetingProp.intId, sendToId)

      val body = UserRespondedToQuestionQuizRespMsgBody(questionQuizId, msg.header.userId, answerIds)
      val event = UserRespondedToQuestionQuizRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      (questionQuizId: String, updatedQuestionQuiz: SimpleQuestionQuizResultOutVO) <- QuestionQuizs.handleRespondToQuestionQuizReqMsg(msg.header.userId, msg.body.questionQuizId,
        msg.body.questionId, msg.body.answerIds, liveMeeting)
    } yield {
      broadcastQuestionQuizUpdatedEvent(msg, questionQuizId, updatedQuestionQuiz)
      for {
        questionQuiz <- QuestionQuizs.getQuestionQuiz(questionQuizId, liveMeeting.questionQuizs)
      } yield {
        for {
          answerId <- msg.body.answerIds
        } yield {
          val answerText = questionQuiz.questions(0).answers.get(answerId).key
          broadcastUserRespondedToQuestionQuizRecordMsg(msg, questionQuizId, answerId, answerText, questionQuiz.isSecret)
        }
      }

      for {
        presenter <- Users2x.findPresenter(liveMeeting.users2x)
      } yield {
        broadcastUserRespondedToQuestionQuizRespMsg(msg, questionQuizId, msg.body.answerIds, presenter.intId)
      }
    }
  }
}
