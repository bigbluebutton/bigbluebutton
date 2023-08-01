package org.bigbluebutton.core.apps.questions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ QuestionsModel, PermissionCheck, RightsManagementTrait }

trait DeleteQuestionPubMsgHdlr extends RightsManagementTrait {
  this: QuestionsApp2x =>

  def handle(msg: DeleteQuestionPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received DeleteQuestionPubMsg {}", DeleteQuestionPubMsg)
    def broadcastEvent(
        questionId: String,
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(QuestionDeletedEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        QuestionDeletedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = QuestionDeletedEvtMsgBody(
        questionId
      )
      val event = QuestionDeletedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
        permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) 
    {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to delete questions"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      QuestionsModel.deleteQuestion(liveMeeting.questionsModel, msg.body.questionId);
      broadcastEvent(
        msg.body.questionId,
      )
    }
  }
}