package org.bigbluebutton.core.apps.questions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ QuestionsModel, PermissionCheck, RightsManagementTrait }

trait ApproveQuestionPubMsgHdlr extends RightsManagementTrait {
  this: QuestionsApp2x =>

  def handle(msg: ApproveQuestionPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received ApproveQuestionPubMsg {}", ApproveQuestionPubMsg)
    def broadcastEvent(
        questionId: String,
        approved:   Boolean
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(QuestionApprovedEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        QuestionApprovedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = QuestionApprovedEvtMsgBody(
        questionId,
        approved
      )
      val event = QuestionApprovedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to approve questions"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      val question = QuestionsModel.getQuestion(liveMeeting.questionsModel, msg.body.questionId)
      if (question != None) {
        val approved = question.get.setApproved()
        broadcastEvent(
          msg.body.questionId,
          approved
        )
      }
    }
  }
}