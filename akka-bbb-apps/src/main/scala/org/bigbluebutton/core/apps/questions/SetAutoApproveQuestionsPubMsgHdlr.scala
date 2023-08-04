package org.bigbluebutton.core.apps.questions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ QuestionsModel, PermissionCheck, RightsManagementTrait }

trait SetAutoApproveQuestionsPubMsgHdlr extends RightsManagementTrait {
  this: QuestionsApp2x =>

  def handle(msg: SetAutoApproveQuestionsPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received SetAutoApproveQuestionsPubMsg {}", SetAutoApproveQuestionsPubMsg)
    def broadcastEvent(
        autoApprove: Boolean,
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(AutoApproveQuestionsChangedEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        AutoApproveQuestionsChangedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = AutoApproveQuestionsChangedEvtMsgBody(
        autoApprove,
      )
      val event = AutoApproveQuestionsChangedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
        permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) 
    {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to change autoapprove questions"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      QuestionsModel.setAutoApproveQuestions(liveMeeting.questionsModel, msg.body.autoApprove);
      broadcastEvent(
        msg.body.autoApprove
      )
    }
  }
}