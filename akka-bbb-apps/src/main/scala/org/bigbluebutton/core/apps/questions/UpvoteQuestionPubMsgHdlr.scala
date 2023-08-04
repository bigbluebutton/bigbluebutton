package org.bigbluebutton.core.apps.questions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.QuestionsModel

trait UpvoteQuestionPubMsgHdlr {
  this: QuestionsApp2x =>

  def handle(msg: UpvoteQuestionPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received UpvoteQuestionPubMsg {}", UpvoteQuestionPubMsg)
    def broadcastEvent(
        questionId: String,
        upvoterId:  String,
        upvoteHeld: Boolean,
        numUpvotes: Int
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(QuestionUpvotedEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        QuestionUpvotedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = QuestionUpvotedEvtMsgBody(
        questionId,
        upvoterId,
        upvoteHeld,
        numUpvotes
      )
      val event = QuestionUpvotedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val question = QuestionsModel.getQuestion(liveMeeting.questionsModel, msg.body.questionId)
    if (question != None) {
      var upvoted = question.get.upvoted(msg.body.upvoterId)
      if (upvoted == true) {
        question.get.removeUpvoter(msg.body.upvoterId)
      } else {
        question.get.addUpvoter(msg.body.upvoterId)
      }
      upvoted = question.get.upvoted(msg.body.upvoterId)
      val numUpvotes = question.get.getNumUpvotes()

      broadcastEvent(
        msg.body.questionId,
        msg.body.upvoterId,
        upvoted,
        numUpvotes
      )
    }
  }
}