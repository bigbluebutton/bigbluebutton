package org.bigbluebutton.core2.message.handlers.meeting

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.voice.VoiceApp
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait DestroyMeetingSysCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleDestroyMeetingSysCmdMsg(msg: DestroyMeetingSysCmdMsg) {
    log.info("Handling DestroyMeeting message for meetingId={}", msg.body.meetingId)

    if (liveMeeting.props.meetingProp.isBreakout) {
      log.info(
        "Informing parent meeting {} that a breakout room has been ended {}",
        liveMeeting.props.breakoutProps.parentId, liveMeeting.props.meetingProp.intId
      )

      // send out BreakoutRoomEndedEvtMsg to inform clients the breakout has ended
      outGW.send(MsgBuilder.buildBreakoutRoomEndedEvtMsg(liveMeeting.props.meetingProp.intId, "not-used",
        liveMeeting.props.breakoutProps.parentId))
    }

    // Eject all users using the client.
    outGW.send(MsgBuilder.buildEndAndKickAllSysMsg(liveMeeting.props.meetingProp.intId, "not-used"))

    // Force stopping of voice recording if voice conf is being recorded.
    VoiceApp.stopRecordingVoiceConference(liveMeeting, outGW)

    // Eject all users from the voice conference
    outGW.send(MsgBuilder.buildEjectAllFromVoiceConfMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf
    ))

    // send a system message to force disconnection
    outGW.send(MsgBuilder.buildDisconnectAllClientsSysMsg(liveMeeting.props.meetingProp.intId, "meeting-destroyed"))
    log.info("Disconnect all users from meeting (system msg).  meetingId=" + liveMeeting.props.meetingProp.intId)
  }

}
