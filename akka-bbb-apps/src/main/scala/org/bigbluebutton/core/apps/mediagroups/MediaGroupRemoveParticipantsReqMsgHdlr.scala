package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.MediaGroup
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait MediaGroupRemoveParticipantsReqMsgHdlr extends RightsManagementTrait {
  this: MediaGroupHdlrs =>

  def handle(msg: MediaGroupRemoveParticipantsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(mg: MediaGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(MediaGroupParticipantsRemovedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(MediaGroupParticipantsRemovedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = MediaGroupParticipantsRemovedEvtMsgBody(msg.body.id, msg.body.mediaType, msg.header.userId, msg.body.userIds)
      val event = MediaGroupParticipantsRemovedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    val userIds = msg.body.userIds
    val affectsOtherUsers = userIds.contains(msg.header.userId)
    val groupId = msg.body.id

    if (affectsOtherUsers && permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove participants from a media group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    MediaGroupApp.findMediaGroup(groupId, state.mediaGroups) match {
      case Some(mg) =>
        val updatedGroups = MediaGroupApp.removeMediaGroupParticipants(
          groupId,
          userIds,
          state.mediaGroups
        )
        broadcastEvent(mg)
        // TODO: No DB for now - will be used later
        state.update(updatedGroups)
      case None =>
        state
    }
  }
}
