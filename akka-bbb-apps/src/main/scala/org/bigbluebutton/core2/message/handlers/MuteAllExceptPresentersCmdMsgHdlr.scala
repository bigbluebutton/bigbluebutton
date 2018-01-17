package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ UserState, Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait MuteAllExceptPresentersCmdMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleMuteAllExceptPresentersCmdMsg(msg: MuteAllExceptPresentersCmdMsg) {
    if (msg.body.mute != MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
      if (msg.body.mute) {
        MeetingStatus2x.muteMeeting(liveMeeting.status)
      } else {
        MeetingStatus2x.unmuteMeeting(liveMeeting.status)
      }

      val muted = MeetingStatus2x.isMeetingMuted(liveMeeting.status)
      val event = build(props.meetingProp.intId, msg.body.mutedBy, muted, msg.body.mutedBy)

      outGW.send(event)

      // I think the correct flow would be to find those who are presenters and exclude them
      // from the list of voice users. The remaining, mute.
      VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
        if (!vu.listenOnly) {
          Users2x.findWithIntId(liveMeeting.users2x, vu.intId) match {
            case Some(u) => if (!u.presenter) muteUserInVoiceConf(vu, muted)
            case None    => muteUserInVoiceConf(vu, muted)
          }
        }
      }
    }
  }

  def usersWhoAreNotPresenter(): Vector[UserState] = {
    Users2x.findNotPresenters(liveMeeting.users2x)
  }

  def build(meetingId: String, userId: String, muted: Boolean, mutedBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(MeetingMutedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(MeetingMutedEvtMsg.NAME, meetingId, userId)

    val body = MeetingMutedEvtMsgBody(muted, mutedBy)
    val event = MeetingMutedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def muteUserInVoiceConf(vu: VoiceUserState, mute: Boolean): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, vu.intId)
    val envelope = BbbCoreEnvelope(MuteUserInVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(MuteUserInVoiceConfSysMsg.NAME, props.meetingProp.intId)

    val body = MuteUserInVoiceConfSysMsgBody(props.voiceProp.voiceConf, vu.voiceUserId, mute)
    val event = MuteUserInVoiceConfSysMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)

  }

}
