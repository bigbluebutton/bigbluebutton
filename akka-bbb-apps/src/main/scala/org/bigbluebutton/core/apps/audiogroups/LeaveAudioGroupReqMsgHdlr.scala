package org.bigbluebutton.core.apps.audiogroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.AudioGroup
import org.bigbluebutton.core.db.AudioGroupUserDAO
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait LeaveAudioGroupReqMsgHdlr extends RightsManagementTrait {
  this: AudioGroupHdlrs =>

  def handle(msg: LeaveAudioGroupReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val participantUserId = msg.body.userId
    val affectsOtherUser = participantUserId != msg.header.userId

    def broadcastEvent(ag: AudioGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(AudioGroupParticipantLeftEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AudioGroupParticipantLeftEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = AudioGroupParticipantLeftEvtMsgBody(ag.id, msg.header.userId, participantUserId)
      val event = AudioGroupParticipantLeftEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    if (affectsOtherUser && permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to leave an audio group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    val groupId = msg.body.id

    AudioGroupApp.findAudioGroup(groupId, state.audioGroups) match {
      case Some(ag) =>
        ag.findParticipant(participantUserId) match {
          case Some(participant) =>
            val updatedGroups = AudioGroupApp.removeAudioGroupParticipant(
              groupId,
              participantUserId,
              state.audioGroups
            )
            broadcastEvent(ag)
            AudioGroupUserDAO.delete(liveMeeting.props.meetingProp.intId, groupId, participantUserId)
            System.out.println("AG== Participant left audio group: " + ag)
            state.update(updatedGroups)
          case None =>
            System.out.println("AG== Participant does not exist in audio group: " + participantUserId)
            state
        }

      case None =>
        System.out.println("AG== LeaveAudioGroup: group does not exist: " + msg.body.id)
        state
    }
  }
}
