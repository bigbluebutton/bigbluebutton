package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.SetGuestPolicyCmdMsg
import org.bigbluebutton.core.models.{ GuestPolicy, GuestPolicyType, GuestsWaiting }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder }

trait SetGuestPolicyMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetGuestPolicyMsg(msg: SetGuestPolicyCmdMsg): Unit = {
    val newPolicy = msg.body.policy.toUpperCase()
    if (GuestPolicyType.policyTypes.contains(newPolicy)) {
      val policy = GuestPolicy(newPolicy, msg.body.setBy)
      GuestsWaiting.setGuestPolicy(liveMeeting.guestsWaiting, policy)
      val event = MsgBuilder.buildGuestPolicyChangedEvtMsg(
        liveMeeting.props.meetingProp.intId, msg.header.userId, newPolicy, msg.body.setBy
      )
      outGW.send(event)
    }
  }

}
