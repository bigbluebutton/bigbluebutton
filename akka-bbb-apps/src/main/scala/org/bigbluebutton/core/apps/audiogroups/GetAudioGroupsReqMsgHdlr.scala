package org.bigbluebutton.core.apps.audiogroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait GetAudioGroupsReqMsgHdlr {
  this: AudioGroupHdlrs =>

  def handle(msg: GetAudioGroupsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val audioGroups = state.audioGroups
    val audioGroupInfos = audioGroups.findAllAudioGroups().map { ag =>
      AudioGroupInfo(
        ag.id,
        ag.createdBy,
        ag.findAllSenders(),
        ag.findAllReceivers()
      )
    }
    val routing = Routing.addMsgToClientRouting(
      MessageTypes.BROADCAST_TO_MEETING,
      liveMeeting.props.meetingProp.intId,
      msg.header.userId
    )
    val envelope = BbbCoreEnvelope(GetAudioGroupsRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetAudioGroupsRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
    val body = GetAudioGroupsRespMsgBody(audioGroupInfos)
    val event = GetAudioGroupsRespMsg(header, body)
    val respMsg = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(respMsg)

    state
  }
}
