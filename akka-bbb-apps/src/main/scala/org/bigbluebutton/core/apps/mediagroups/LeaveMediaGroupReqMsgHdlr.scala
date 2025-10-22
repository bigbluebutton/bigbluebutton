package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.MediaGroup
import org.bigbluebutton.core.db.MediaGroupUserDAO
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait LeaveMediaGroupReqMsgHdlr extends RightsManagementTrait {
  this: MediaGroupHdlrs =>

  def handle(msg: LeaveMediaGroupReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val participantUserId = msg.body.userId
    val affectsOtherUser = participantUserId != msg.header.userId
    val groupId = msg.body.id

    def broadcastEvent(mg: MediaGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(MediaGroupParticipantLeftEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(MediaGroupParticipantLeftEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = MediaGroupParticipantLeftEvtMsgBody(groupId, msg.body.mediaType, msg.header.userId, participantUserId)
      val event = MediaGroupParticipantLeftEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    MediaGroupApp.findMediaGroup(groupId, state.mediaGroups) match {
      case Some(mg) =>
        if ((mg.locked && permissionFailed(
          PermissionCheck.MOD_LEVEL,
          PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
        )) || (affectsOtherUser && permissionFailed(
            PermissionCheck.MOD_LEVEL,
            PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
          ))) {
          val meetingId = liveMeeting.props.meetingProp.intId
          val reason = "No permission to leave a media group"
          PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
          state
        } else {
          mg.findParticipant(participantUserId) match {
            case Some(_) =>
              val updatedGroups = MediaGroupApp.removeMediaGroupParticipant(
                groupId,
                participantUserId,
                state.mediaGroups
              )
              broadcastEvent(mg)
              MediaGroupUserDAO.delete(liveMeeting.props.meetingProp.intId, groupId, participantUserId)
              val newState = state.update(updatedGroups)
              MediaGroupApp.handleMediaGroupUpdated(mg.id, updatedGroups, liveMeeting, bus.outGW)
              newState
            case None =>
              state
          }
        }
      case None =>
        state
    }
  }
}
