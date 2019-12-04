package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.UserState

object UserJoinedMeetingEvtMsgBuilder {
  def build(meetingId: String, userState: UserState): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userState.intId)
    val envelope = BbbCoreEnvelope(UserJoinedMeetingEvtMsg.NAME, routing)

    val body = UserJoinedMeetingEvtMsgBody(intId = userState.intId, extId = userState.extId, name = userState.name,
      role = userState.role, guest = userState.guest, authed = userState.authed,
      guestStatus = userState.guestStatus,
      emoji = userState.emoji,
      presenter = userState.presenter, locked = userState.locked, avatar = userState.avatar,
      clientType = userState.clientType)

    val event = UserJoinedMeetingEvtMsg(meetingId, userState.intId, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
