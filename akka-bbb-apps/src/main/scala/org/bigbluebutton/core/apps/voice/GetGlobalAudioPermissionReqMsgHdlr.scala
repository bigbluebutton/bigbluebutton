package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.Users2x

trait GetGlobalAudioPermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def build(
      meetingId:    String,
      voiceConf:    String,
      userId:       String,
      sfuSessionId: String,
      allowed:      Boolean
  ): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetGlobalAudioPermissionRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetGlobalAudioPermissionRespMsg.NAME, meetingId, userId)

    val body = GetGlobalAudioPermissionRespMsgBody(meetingId, voiceConf, userId, sfuSessionId, allowed)
    val event = GetGlobalAudioPermissionRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def handleGetGlobalAudioPermissionReqMsg(msg: GetGlobalAudioPermissionReqMsg) {
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (!user.userLeftFlag.left
        && user.authed
        && liveMeeting.props.meetingProp.intId == msg.body.meetingId
        && liveMeeting.props.voiceProp.voiceConf == msg.body.voiceConf) {
        allowed = true
      }
    }

    val event = build(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      msg.body.userId,
      msg.body.sfuSessionId,
      allowed
    )
    outGW.send(event)
  }
}
