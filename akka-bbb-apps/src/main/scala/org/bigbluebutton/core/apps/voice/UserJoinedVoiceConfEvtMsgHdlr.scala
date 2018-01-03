package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait UserJoinedVoiceConfEvtMsgHdlr extends BreakoutHdlrHelpers with SystemConfiguration {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserJoinedVoiceConfEvtMsg(msg: UserJoinedVoiceConfEvtMsg): Unit = {
    log.info("Received user joined voice conference " + msg)

    handleUserJoinedVoiceConfEvtMsg(msg.body.voiceConf, msg.body.intId, msg.body.voiceUserId,
      msg.body.callingWith, msg.body.callerIdName, msg.body.callerIdNum, msg.body.muted, msg.body.talking)
  }

  def handleUserJoinedVoiceConfEvtMsg(voiceConf: String, intId: String, voiceUserId: String, callingWith: String,
                                      callerIdName: String, callerIdNum: String, muted: Boolean, talking: Boolean): Unit = {
    def broadcastEvent(voiceUserState: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, voiceUserState.intId
      )
      val envelope = BbbCoreEnvelope(UserJoinedVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        UserJoinedVoiceConfToClientEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, voiceUserState.intId
      )

      val body = UserJoinedVoiceConfToClientEvtMsgBody(voiceConf, voiceUserState.intId, voiceUserState.voiceUserId,
        voiceUserState.callerName, voiceUserState.callerNum, voiceUserState.muted, voiceUserState.talking,
        voiceUserState.callingWith, voiceUserState.listenOnly)

      val event = UserJoinedVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val isListenOnly = if (callerIdName.startsWith("LISTENONLY")) true else false

    val voiceUserState = VoiceUserState(intId, voiceUserId, callingWith, callerIdName, callerIdNum, muted, talking, listenOnly = isListenOnly)
    VoiceUsers.add(liveMeeting.voiceUsers, voiceUserState)

    broadcastEvent(voiceUserState)

    if (liveMeeting.props.meetingProp.isBreakout) {
      updateParentMeetingWithUsers()
    }

    // if the meeting is muted tell freeswitch to mute the new person
    if (!isListenOnly && MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
      val event = MsgBuilder.buildMuteUserInVoiceConfSysMsg(liveMeeting.props.meetingProp.intId, voiceConf, voiceUserId, true)
      outGW.send(event)
    }
  }

}
