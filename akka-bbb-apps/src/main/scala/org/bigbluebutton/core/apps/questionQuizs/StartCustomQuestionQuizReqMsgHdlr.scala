package org.bigbluebutton.core.apps.questionQuizs

import org.bigbluebutton.common2.domain.SimpleQuestionQuizOutVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.QuestionQuizs
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait StartCustomQuestionQuizReqMsgHdlr extends RightsManagementTrait {
  this: QuestionQuizApp2x =>

  def handle(msg: StartCustomQuestionQuizReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: StartCustomQuestionQuizReqMsg, questionQuiz: SimpleQuestionQuizOutVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(QuestionQuizStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(QuestionQuizStartedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = QuestionQuizStartedEvtMsgBody(msg.header.userId, questionQuiz.id, msg.body.questionQuizType, msg.body.secretQuestionQuiz, msg.body.question, questionQuiz)
      val event = QuestionQuizStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }
    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to start custom questionQuiz."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      for {
        pvo <- QuestionQuizs.handleStartCustomQuestionQuizReqMsg(state, msg.header.userId, msg.body.questionQuizId, msg.body.questionQuizType, msg.body.secretQuestionQuiz, msg.body.isMultipleResponse, msg.body.answers, msg.body.question, liveMeeting)
      } yield {
        broadcastEvent(msg, pvo)
      }
    }
  }
}
