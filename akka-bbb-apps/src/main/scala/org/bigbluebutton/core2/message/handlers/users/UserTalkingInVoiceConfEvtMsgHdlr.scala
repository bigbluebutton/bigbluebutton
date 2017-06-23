package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.voiceconf.{UserMutedEvtMsg, UserMutedEvtMsgBody}
import org.bigbluebutton.core.models.{VoiceUserState, VoiceUsers}


trait UserTalkingInVoiceConfEvtMsgHdlr {
  def broadcastEvent(vu: VoiceUserState): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId,
      vu.intId)
    val envelope = BbbCoreEnvelope(UserMutedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserMutedEvtMsg.NAME, props.meetingProp.intId, vu.intId)

    val body = UserMutedEvtMsgBody(intId = vu.intId, voiceUserId = vu.intId, vu.muted)

    val event = UserMutedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)

    record(event)
  }

  for {
    mutedUser <- VoiceUsers.userMuted(liveMeeting.voiceUsers, msg.body.voiceUserId, msg.body.muted)
  } yield {
    broadcastEvent(mutedUser)
  }
}
