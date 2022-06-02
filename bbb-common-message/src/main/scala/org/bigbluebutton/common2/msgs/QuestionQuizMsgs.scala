package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.{ QuestionQuizVO, SimpleQuestionQuizOutVO, SimpleQuestionQuizResultOutVO }
import com.fasterxml.jackson.databind.JsonNode

object GetCurrentQuestionQuizReqMsg { val NAME = "GetCurrentQuestionQuizReqMsg" }
case class GetCurrentQuestionQuizReqMsg(header: BbbClientMsgHeader, body: GetCurrentQuestionQuizReqMsgBody) extends StandardMsg
case class GetCurrentQuestionQuizReqMsgBody(requesterId: String)

object GetCurrentQuestionQuizRespMsg { val NAME = "GetCurrentQuestionQuizRespMsg" }
case class GetCurrentQuestionQuizRespMsg(header: BbbClientMsgHeader, body: GetCurrentQuestionQuizRespMsgBody) extends BbbCoreMsg
case class GetCurrentQuestionQuizRespMsgBody(userId: String, hasQuestionQuiz: Boolean, questionQuiz: Option[QuestionQuizVO])

object QuestionQuizShowResultEvtMsg { val NAME = "QuestionQuizShowResultEvtMsg" }
case class QuestionQuizShowResultEvtMsg(header: BbbClientMsgHeader, body: QuestionQuizShowResultEvtMsgBody) extends BbbCoreMsg
case class QuestionQuizShowResultEvtMsgBody(userId: String, questionQuizId: String, questionQuiz: SimpleQuestionQuizResultOutVO)

object QuestionQuizStartedEvtMsg { val NAME = "QuestionQuizStartedEvtMsg" }
case class QuestionQuizStartedEvtMsg(header: BbbClientMsgHeader, body: QuestionQuizStartedEvtMsgBody) extends BbbCoreMsg
case class QuestionQuizStartedEvtMsgBody(userId: String, questionQuizId: String, questionQuizType: String, secretQuestionQuiz: Boolean, question: String, questionQuiz: SimpleQuestionQuizOutVO)

object QuestionQuizStoppedEvtMsg { val NAME = "QuestionQuizStoppedEvtMsg" }
case class QuestionQuizStoppedEvtMsg(header: BbbClientMsgHeader, body: QuestionQuizStoppedEvtMsgBody) extends BbbCoreMsg
case class QuestionQuizStoppedEvtMsgBody(userId: String, questionQuizId: String)

object QuestionQuizUpdatedEvtMsg { val NAME = "QuestionQuizUpdatedEvtMsg" }
case class QuestionQuizUpdatedEvtMsg(header: BbbClientMsgHeader, body: QuestionQuizUpdatedEvtMsgBody) extends BbbCoreMsg
case class QuestionQuizUpdatedEvtMsgBody(questionQuizId: String, questionQuiz: SimpleQuestionQuizResultOutVO)

object UserRespondedToQuestionQuizRecordMsg { val NAME = "UserRespondedToQuestionQuizRecordMsg" }
case class UserRespondedToQuestionQuizRecordMsg(header: BbbClientMsgHeader, body: UserRespondedToQuestionQuizRecordMsgBody) extends BbbCoreMsg
case class UserRespondedToQuestionQuizRecordMsgBody(questionQuizId: String, answerId: Int, answer: String, isSecret: Boolean)

object RespondToQuestionQuizReqMsg { val NAME = "RespondToQuestionQuizReqMsg" }
case class RespondToQuestionQuizReqMsg(header: BbbClientMsgHeader, body: RespondToQuestionQuizReqMsgBody) extends StandardMsg
case class RespondToQuestionQuizReqMsgBody(requesterId: String, questionQuizId: String, questionId: Int, answerIds: Seq[Int])

object RespondToTypedQuestionQuizReqMsg { val NAME = "RespondToTypedQuestionQuizReqMsg" }
case class RespondToTypedQuestionQuizReqMsg(header: BbbClientMsgHeader, body: RespondToTypedQuestionQuizReqMsgBody) extends StandardMsg
case class RespondToTypedQuestionQuizReqMsgBody(requesterId: String, questionQuizId: String, questionId: Int, answer: String)

object UserRespondedToQuestionQuizRespMsg { val NAME = "UserRespondedToQuestionQuizRespMsg" }
case class UserRespondedToQuestionQuizRespMsg(header: BbbClientMsgHeader, body: UserRespondedToQuestionQuizRespMsgBody) extends BbbCoreMsg
case class UserRespondedToQuestionQuizRespMsgBody(questionQuizId: String, userId: String, answerIds: Seq[Int])

object UserRespondedToTypedQuestionQuizRespMsg { val NAME = "UserRespondedToTypedQuestionQuizRespMsg" }
case class UserRespondedToTypedQuestionQuizRespMsg(header: BbbClientMsgHeader, body: UserRespondedToTypedQuestionQuizRespMsgBody) extends BbbCoreMsg
case class UserRespondedToTypedQuestionQuizRespMsgBody(questionQuizId: String, userId: String, answer: String)

object ShowQuestionQuizResultReqMsg { val NAME = "ShowQuestionQuizResultReqMsg" }
case class ShowQuestionQuizResultReqMsg(header: BbbClientMsgHeader, body: ShowQuestionQuizResultReqMsgBody) extends StandardMsg
case class ShowQuestionQuizResultReqMsgBody(requesterId: String, questionQuizId: String)

object StartCustomQuestionQuizReqMsg { val NAME = "StartCustomQuestionQuizReqMsg" }
case class StartCustomQuestionQuizReqMsg(header: BbbClientMsgHeader, body: StartCustomQuestionQuizReqMsgBody) extends StandardMsg
case class StartCustomQuestionQuizReqMsgBody(requesterId: String, questionQuizId: String, questionQuizType: String, secretQuestionQuiz: Boolean, isMultipleResponse: Boolean, answers: Seq[String], question: String)

object StartQuestionQuizReqMsg { val NAME = "StartQuestionQuizReqMsg" }
case class StartQuestionQuizReqMsg(header: BbbClientMsgHeader, body: StartQuestionQuizReqMsgBody) extends StandardMsg
case class StartQuestionQuizReqMsgBody(requesterId: String, questionQuizId: String, questionQuizType: String, secretQuestionQuiz: Boolean, question: String, isMultipleResponse: Boolean)

object StopQuestionQuizReqMsg { val NAME = "StopQuestionQuizReqMsg" }
case class StopQuestionQuizReqMsg(header: BbbClientMsgHeader, body: StopQuestionQuizReqMsgBody) extends StandardMsg
case class StopQuestionQuizReqMsgBody(requesterId: String)
