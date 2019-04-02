package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.domain.MeetingState2x

trait SyncGetVoiceUsersMsgHdlr {
  this: BaseMeetingActor =>

  def handleSyncGetVoiceUsersMsg(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildSyncGetVoiceUsersRespMsg(): BbbCommonEnvCoreMsg = {
      val voiceUsers = VoiceUsers.findAll(liveMeeting.voiceUsers).map { u =>
        VoiceConfUser(intId = u.intId, voiceUserId = u.voiceUserId, callingWith = u.callingWith, callerName = u.callerName,
          callerNum = u.callerNum, muted = u.muted, talking = u.talking, listenOnly = u.listenOnly)
      }

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(SyncGetVoiceUsersRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncGetVoiceUsersRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val body = SyncGetVoiceUsersRespMsgBody(voiceUsers)
      val event = SyncGetVoiceUsersRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val respMsg = buildSyncGetVoiceUsersRespMsg()
    bus.outGW.send(respMsg)

    state
  }
}
