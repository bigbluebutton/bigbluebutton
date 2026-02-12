package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.MediaGroup
import org.bigbluebutton.core.db.MediaGroupUserDAO
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait MediaGroupUpdateParticipantReqMsgHdlr extends RightsManagementTrait {
  this: MediaGroupHdlrs =>

  def handle(msg: MediaGroupUpdateParticipantReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val participant = msg.body.participant
    val participantUserId = participant.userId
    val affectsOtherUser = participantUserId != msg.header.userId
    val groupId = msg.body.id

    def broadcastEvent(mg: MediaGroup, p: MediaGroupParticipant): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(MediaGroupParticipantUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(MediaGroupParticipantUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = MediaGroupParticipantUpdatedEvtMsgBody(groupId, msg.body.mediaType, p)
      val event = MediaGroupParticipantUpdatedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    ) && affectsOtherUser) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to update a media group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    MediaGroupApp.findMediaGroup(groupId, state.mediaGroups) match {
      case Some(mg) =>
        mg.findParticipant(participantUserId) match {
          case Some(_) =>
            val effectiveParticipant =
              if (PublicMediaGroupIds.isPublicGroup(groupId) &&
                MediaGroupApp.isUserOnlyInPublicGroupForMediaType(
                  participantUserId,
                  msg.body.mediaType,
                  state.mediaGroups
                )) {
                participant.copy(sender = true, receiver = true, active = true)
              } else {
                participant
              }
            val updatedGroups = MediaGroupApp.updateMediaGroupParticipant(
              groupId,
              effectiveParticipant,
              state.mediaGroups
            )
            broadcastEvent(mg, effectiveParticipant)
            MediaGroupUserDAO.update(liveMeeting.props.meetingProp.intId, groupId, effectiveParticipant)
            val newState = state.update(updatedGroups)
            MediaGroupApp.handleMediaGroupUpdated(mg.id, updatedGroups, liveMeeting, bus.outGW)
            newState
          case None =>
            state
        }
      case None =>
        state
    }
  }
}
