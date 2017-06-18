package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.voiceconf.{ UserJoinedVoiceConfEvtMsg, UserJoinedVoiceConfToClientEvtMsg, UserJoinedVoiceConfToClientEvtMsgBody }
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ VoiceUser2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor

trait UserJoinedVoiceConfEvtMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handle(msg: UserJoinedVoiceConfEvtMsg): Unit = {
    log.warning("Received user joined voice conference " + msg)

    def broadcastEvent(voiceUserState: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, voiceUserState.intId)
      val envelope = BbbCoreEnvelope(UserJoinedVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserJoinedVoiceConfToClientEvtMsg.NAME, props.meetingProp.intId, voiceUserState.intId)

      val body = UserJoinedVoiceConfToClientEvtMsgBody(intId = voiceUserState.intId, voiceUserId = voiceUserState.voiceUserId,
        callerName = voiceUserState.callerName, callerNum = voiceUserState.callerNum, muted = voiceUserState.muted,
        talking = voiceUserState.talking, callingWith = voiceUserState.callingWith, listenOnly = voiceUserState.listenOnly)

      val event = UserJoinedVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    val voiceUser = VoiceUser2x(msg.body.intId, msg.body.voiceUserId)
    val voiceUserState = VoiceUserState(intId = msg.body.intId, voiceUserId = msg.body.voiceUserId,
      callingWith = msg.body.callingWith, callerName = msg.body.callerIdName, callerNum = msg.body.callerIdNum,
      muted = msg.body.muted, talking = msg.body.talking, listenOnly = false)

    VoiceUsers.add(liveMeeting.voiceUsers, voiceUserState)

    broadcastEvent(voiceUserState)
  }
}
