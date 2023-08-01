package org.bigbluebutton.core.apps.questions

import akka.actor.ActorContext
import akka.event.Logging

class QuestionsApp2x(implicit val context: ActorContext)
  extends CreateQuestionPubMsgHdlr
  with ApproveQuestionPubMsgHdlr
  with DeleteQuestionPubMsgHdlr
  with QuestionAnsweredPubMsgHdlr
  with UpvoteQuestionPubMsgHdlr
  with SetAutoApproveQuestionsPubMsgHdlr
  with GetAutoApproveQuestionsReqMsgHdlr {

  val log = Logging(context.system, getClass)
}