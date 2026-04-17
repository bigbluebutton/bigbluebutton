package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait GetMediaGroupsReqMsgHdlr {
  this: MediaGroupHdlrs =>

  def handle(msg: GetMediaGroupsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildMediaGroupInfo(mg: org.bigbluebutton.core.models.MediaGroup): MediaGroupInfo = {
      MediaGroupInfo(
        mg.id,
        mg.createdBy,
        mg.mediaType,
        mg.locked,
        mg.record,
        mg.findAllSenders(),
        mg.findAllReceivers()
      )
    }

    val mediaGroups = state.mediaGroups.findAllMediaGroups()
    val mediaGroupInfos = mediaGroups map (mg => buildMediaGroupInfo(mg))

    val routing = Routing.addMsgToClientRouting(
      MessageTypes.DIRECT,
      liveMeeting.props.meetingProp.intId,
      msg.header.userId
    )
    val envelope = BbbCoreEnvelope(GetMediaGroupsRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetMediaGroupsRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
    val body = GetMediaGroupsRespMsgBody(mediaGroupInfos)
    val event = GetMediaGroupsRespMsg(header, body)
    val respMsg = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(respMsg)

    state
  }
}
