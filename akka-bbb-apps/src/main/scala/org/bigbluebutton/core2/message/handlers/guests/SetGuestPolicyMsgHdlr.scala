package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.SetGuestPolicyMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ GuestPolicy, GuestPolicyType, GuestWaiting, GuestsWaiting }
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

trait SetGuestPolicyMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleSetGuestPolicyMsg(msg: SetGuestPolicyMsg): Unit = {
    val newPolicy = msg.body.policy.toUpperCase()
    if (GuestPolicyType.policyTypes.contains(newPolicy)) {
      val policy = GuestPolicy(newPolicy, msg.body.setBy)
      GuestsWaiting.setGuestPolicy(liveMeeting.guestsWaiting, policy)
      val event = MsgBuilder.buildGuestPolicyChangedEvtMsg(
        liveMeeting.props.meetingProp.intId, msg.header.userId, newPolicy, msg.body.setBy
      )
      Sender.send(outGW, event)
    }
  }

}
