package org.bigbluebutton.common2.msgs

// In messages
object CreateQuestionPubMsg { val NAME = "CreateQuestionPubMsg" }
case class CreateQuestionPubMsg(header: BbbClientMsgHeader, body: CreateQuestionPubMsgBody) extends StandardMsg
case class CreateQuestionPubMsgBody(userName: String, text: String, extUserId: String)

object ApproveQuestionPubMsg { val NAME = "ApproveQuestionPubMsg" }
case class ApproveQuestionPubMsg(header: BbbClientMsgHeader, body: ApproveQuestionPubMsgBody) extends StandardMsg
case class ApproveQuestionPubMsgBody(questionId: String)

object DeleteQuestionPubMsg { val NAME = "DeleteQuestionPubMsg" }
case class DeleteQuestionPubMsg(header: BbbClientMsgHeader, body: DeleteQuestionPubMsgBody) extends StandardMsg
case class DeleteQuestionPubMsgBody(questionId: String)

object QuestionAnsweredPubMsg { val NAME = "QuestionAnsweredPubMsg" }
case class QuestionAnsweredPubMsg(header: BbbClientMsgHeader, body: QuestionAnsweredPubMsgBody) extends StandardMsg
case class QuestionAnsweredPubMsgBody(questionId: String, answerText: String)

object UpvoteQuestionPubMsg { val NAME = "UpvoteQuestionPubMsg" }
case class UpvoteQuestionPubMsg(header: BbbClientMsgHeader, body: UpvoteQuestionPubMsgBody) extends StandardMsg
case class UpvoteQuestionPubMsgBody(questionId: String, upvoterId: String)

object SetAutoApproveQuestionsPubMsg { val NAME = "SetAutoApproveQuestionsPubMsg" }
case class SetAutoApproveQuestionsPubMsg(header: BbbClientMsgHeader, body: SetAutoApproveQuestionsPubMsgBody) extends StandardMsg
case class SetAutoApproveQuestionsPubMsgBody(autoApprove: Boolean)

object GetAutoApproveQuestionsReqMsg { val NAME = "GetAutoApproveQuestionsReqMsg" }
case class GetAutoApproveQuestionsReqMsg(header: BbbClientMsgHeader, body: GetAutoApproveQuestionsReqMsgBody) extends StandardMsg
case class GetAutoApproveQuestionsReqMsgBody()

// Out messages
object QuestionCreatedEvtMsg { val NAME = "QuestionCreatedEvtMsg" }
case class QuestionCreatedEvtMsg(header: BbbClientMsgHeader, body: QuestionCreatedEvtMsgBody) extends BbbCoreMsg
case class QuestionCreatedEvtMsgBody(questionId: String, userName: String, text: String, timestamp: Long, approved: Boolean, extUserId: String)

object QuestionApprovedEvtMsg { val NAME = "QuestionApprovedEvtMsg" }
case class QuestionApprovedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: QuestionApprovedEvtMsgBody) extends BbbCoreMsg
case class QuestionApprovedEvtMsgBody(questionId: String, approved: Boolean)

object QuestionDeletedEvtMsg { val NAME = "QuestionDeletedEvtMsg" }
case class QuestionDeletedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: QuestionDeletedEvtMsgBody) extends BbbCoreMsg
case class QuestionDeletedEvtMsgBody(questionId: String)

object QuestionAnsweredEvtMsg { val NAME = "QuestionAnsweredEvtMsg" }
case class QuestionAnsweredEvtMsg(header: BbbCoreHeaderWithMeetingId, body: QuestionAnsweredEvtMsgBody) extends BbbCoreMsg
case class QuestionAnsweredEvtMsgBody(questionId: String, answerText: String)

object QuestionUpvotedEvtMsg { val NAME = "QuestionUpvotedEvtMsg" }
case class QuestionUpvotedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: QuestionUpvotedEvtMsgBody) extends BbbCoreMsg
case class QuestionUpvotedEvtMsgBody(questionId: String, upvoterId: String, upvoteHeld: Boolean, numUpvotes: Int)

object AutoApproveQuestionsChangedEvtMsg { val NAME = "AutoApproveQuestionsChangedEvtMsg" }
case class AutoApproveQuestionsChangedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: AutoApproveQuestionsChangedEvtMsgBody) extends BbbCoreMsg
case class AutoApproveQuestionsChangedEvtMsgBody(autoApprove: Boolean)

object GetAutoApproveQuestionsRespMsg { val NAME = "GetAutoApproveQuestionsRespMsg" }
case class GetAutoApproveQuestionsRespMsg(header: BbbClientMsgHeader, body: GetAutoApproveQuestionsRespMsgBody) extends StandardMsg
case class GetAutoApproveQuestionsRespMsgBody(autoApprove: Boolean)