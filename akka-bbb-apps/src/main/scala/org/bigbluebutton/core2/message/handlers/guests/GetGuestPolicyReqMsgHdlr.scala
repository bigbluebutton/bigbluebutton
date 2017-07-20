package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ GuestWaiting, GuestsWaiting, Roles, Users2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

trait GetGuestPolicyReqMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleGetGuestPolicyReqMsg(msg: GetGuestPolicyReqMsg): Unit = {
    val guests = GuestsWaiting.findAll(liveMeeting.guestsWaiting)
    notifyModeratorsOfGuestWaiting(guests, liveMeeting.users2x, liveMeeting.props.meetingProp.intId)

    val event = buildGetGuestPolicyRespMsg(liveMeeting.props.meetingProp.intId, msg.body.requestedBy,
      liveMeeting.guestsWaiting.getGuestPolicy().policy)
    outGW.send(event)
  }

  def notifyModeratorsOfGuestWaiting(guests: Vector[GuestWaiting], users: Users2x, meetingId: String): Unit = {
    val mods = Users2x.findAll(users).filter(p => p.role == Roles.MODERATOR_ROLE)
    mods foreach { m =>
      val event = MsgBuilder.buildGuestsWaitingForApprovalEvtMsg(meetingId, m.intId, guests)
      Sender.send(outGW, event)
    }
  }

  def buildGetGuestPolicyRespMsg(meetingId: String, userId: String, policy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetGuestPolicyRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetGuestPolicyRespMsg.NAME, meetingId, userId)
    val body = GetGuestPolicyRespMsgBody(policy)
    val event = GetGuestPolicyRespMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }
}
