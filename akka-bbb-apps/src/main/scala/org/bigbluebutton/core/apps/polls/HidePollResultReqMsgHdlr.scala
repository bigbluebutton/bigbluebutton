package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Polls
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait HidePollResultReqMsgHdlr extends RightsManagementTrait {
  this: PollApp2x =>

  def handle(msg: HidePollResultReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: HidePollResultReqMsg, hiddenPollId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PollHideResultEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PollHideResultEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PollHideResultEvtMsgBody(msg.header.userId, hiddenPollId)
      val event = PollHideResultEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to hide poll result."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      for {
        hiddenPollId <- Polls.handleHidePollResultReqMsg(msg.header.userId, msg.body.pollId, liveMeeting)
      } yield {
        broadcastEvent(msg, hiddenPollId)
      }
    }
  }
}
