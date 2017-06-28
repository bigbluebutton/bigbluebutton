package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.UserState

object UserLeftMeetingEvtMsgSender {
  def build(meetingId: String, user: UserState): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, user.intId)
    val envelope = BbbCoreEnvelope(UserLeftMeetingEvtMsg.NAME, routing)

    val body = UserLeftMeetingEvtMsgBody(intId = user.intId)
    val event = UserLeftMeetingEvtMsg(meetingId, user.intId, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
