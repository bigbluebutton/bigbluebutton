package org.bigbluebutton.core.apps.questions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.QuestionsModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait CreateQuestionPubMsgHdlr {
  this: QuestionsApp2x =>

  def handle(msg: CreateQuestionPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received CreateQuestionPubMsg {}", CreateQuestionPubMsg)
    def broadcastEvent(
        questionId: String,
        userName:   String,
        text:       String,
        timestamp:  Long,
        approved:   Boolean,
        extUserId:  String
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(QuestionCreatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        QuestionCreatedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val body = QuestionCreatedEvtMsgBody(
        questionId,
        userName,
        text,
        timestamp,
        approved,
        extUserId
      )
      val event = QuestionCreatedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val timestamp = System.currentTimeMillis()
    val questionId = QuestionsModel.createQuestion(
      liveMeeting.questionsModel,
      msg.body.userName,
      msg.body.text,
      timestamp
    )
    val approved = QuestionsModel.getQuestion(liveMeeting.questionsModel, questionId).get.getApproved();

    broadcastEvent(
      questionId,
      msg.body.userName,
      msg.body.text,
      timestamp,
      approved,
      msg.body.extUserId
    )
  }
}
