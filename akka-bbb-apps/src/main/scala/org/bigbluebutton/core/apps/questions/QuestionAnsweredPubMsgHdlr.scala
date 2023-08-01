package org.bigbluebutton.core.apps.questions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ QuestionsModel, PermissionCheck, RightsManagementTrait }

trait QuestionAnsweredPubMsgHdlr extends RightsManagementTrait {
  this: QuestionsApp2x =>

  def handle(msg: QuestionAnsweredPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received QuestionAnsweredPubMsg {}", QuestionAnsweredPubMsg)
    def broadcastEvent(
        questionId: String,
        answerText: String
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(QuestionAnsweredEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        QuestionAnsweredEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = QuestionAnsweredEvtMsgBody(
        questionId,
        answerText
      )
      val event = QuestionAnsweredEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to answer questions"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      val question = QuestionsModel.getQuestion(liveMeeting.questionsModel, msg.body.questionId)
      if (question != None) {
        question.get.setAnswered()
        question.get.setAnswerText(msg.body.answerText)
        broadcastEvent(
          msg.body.questionId,
          msg.body.answerText
        )
      }
    }
  }
}