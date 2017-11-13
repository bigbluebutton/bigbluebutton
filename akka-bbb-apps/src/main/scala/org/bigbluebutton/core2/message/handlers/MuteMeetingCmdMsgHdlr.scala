package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait MuteMeetingCmdMsgHdlrDefault {
  def handleMuteMeetingCmdMsg(msg: MuteMeetingCmdMsg): Unit = {}
}

trait MuteMeetingCmdMsgHdlrCheckPerm extends MuteMeetingCmdMsgHdlrDefault with SystemConfiguration {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  override def handleMuteMeetingCmdMsg(msg: MuteMeetingCmdMsg): Unit = {
    val isAllowed = PermissionCheck.isAllowed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )

    if (applyPermissionCheck && !isAllowed) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to mute meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.body.mutedBy, reason, outGW, liveMeeting)
    } else {
      super.handleMuteMeetingCmdMsg(msg)
    }
  }
}

trait MuteMeetingCmdMsgHdlr extends MuteMeetingCmdMsgHdlrDefault {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  override def handleMuteMeetingCmdMsg(msg: MuteMeetingCmdMsg): Unit = {

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

    if (MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
      MeetingStatus2x.unmuteMeeting(liveMeeting.status)
    } else {
      MeetingStatus2x.muteMeeting(liveMeeting.status)
    }

    val muted = MeetingStatus2x.isMeetingMuted(liveMeeting.status)
    val meetingMutedEvent = build(props.meetingProp.intId, msg.body.mutedBy, muted, msg.body.mutedBy)

    outGW.send(meetingMutedEvent)

    VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
      if (!vu.listenOnly) {
        muteUserInVoiceConf(vu, muted)
      }
    }
  }
}
