package org.bigbluebutton.core.apps.questionQuizs

import akka.actor.ActorContext
import akka.event.Logging

class QuestionQuizApp2x(implicit val context: ActorContext)
  extends GetCurrentQuestionQuizReqMsgHdlr
  with RespondToQuestionQuizReqMsgHdlr
  with RespondToTypedQuestionQuizReqMsgHdlr
  with ShowQuestionQuizResultReqMsgHdlr
  with StartCustomQuestionQuizReqMsgHdlr
  with StartQuestionQuizReqMsgHdlr
  with StopQuestionQuizReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
