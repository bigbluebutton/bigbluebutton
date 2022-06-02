package org.bigbluebutton.core.apps.questionQuizs

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.QuestionQuizs
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait StopQuestionQuizReqMsgHdlr extends RightsManagementTrait {
  this: QuestionQuizApp2x =>

  def broadcastQuestionQuizStoppedEvtMsg(requesterId: String, stoppedQuestionQuizId: String, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, requesterId)
    val envelope = BbbCoreEnvelope(QuestionQuizStoppedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(QuestionQuizStoppedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

    val body = QuestionQuizStoppedEvtMsgBody(requesterId, stoppedQuestionQuizId)
    val event = QuestionQuizStoppedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(msgEvent)
  }

  def handle(msg: StopQuestionQuizReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to stop questionQuiz."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      stopQuestionQuiz(state, msg.header.userId, liveMeeting, bus)
    }
  }

  def stopQuestionQuiz(state: MeetingState2x, requesterId: String, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    for {
      stoppedQuestionQuizId <- QuestionQuizs.handleStopQuestionQuizReqMsg(state, requesterId, liveMeeting)
    } yield {
      broadcastQuestionQuizStoppedEvtMsg(requesterId, stoppedQuestionQuizId, liveMeeting, bus)
    }
  }

}
