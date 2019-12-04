package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait StopPollReqMsgHdlr extends RightsManagementTrait {
  this: PollApp2x =>

  def broadcastPollStoppedEvtMsg(requesterId: String, stoppedPollId: String, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, requesterId)
    val envelope = BbbCoreEnvelope(PollStoppedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(PollStoppedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

    val body = PollStoppedEvtMsgBody(requesterId, stoppedPollId)
    val event = PollStoppedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(msgEvent)
  }

  def handle(msg: StopPollReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to stop poll."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      stopPoll(state, msg.header.userId, liveMeeting, bus)
    }
  }

  def stopPoll(state: MeetingState2x, requesterId: String, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    for {
      stoppedPollId <- Polls.handleStopPollReqMsg(state, requesterId, liveMeeting)
    } yield {
      broadcastPollStoppedEvtMsg(requesterId, stoppedPollId, liveMeeting, bus)
    }
  }

}
