package org.bigbluebutton.core.apps.audiogroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.AudioGroup
import org.bigbluebutton.core.db.AudioGroupUserDAO
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait AudioGroupUpdateParticipantReqMsgHdlr extends RightsManagementTrait {
  this: AudioGroupHdlrs =>

  def handle(msg: AudioGroupUpdateParticipantReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val participant = msg.body.participant
    val participantUserId = participant.id
    val affectsOtherUser = participantUserId != msg.header.userId
    val participantTypeValid = AudioGroupApp.isParticipantTypeValid(participant.participantType)

    def broadcastEvent(ag: AudioGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(AudioGroupParticipantUpdatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AudioGroupParticipantUpdatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = AudioGroupParticipantUpdatedEvtMsgBody(ag.id, participant)
      val event = AudioGroupParticipantUpdatedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    if (!participantTypeValid || permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    ) && affectsOtherUser) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to update an audio group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    val groupId = msg.body.id

    AudioGroupApp.findAudioGroup(groupId, state.audioGroups) match {
      case Some(ag) =>
        ag.findParticipant(participantUserId) match {
          case Some(oldParticipant) =>
            val updatedGroups = AudioGroupApp.updateAudioGroupParticipant(
              groupId,
              participant,
              state.audioGroups
            )
            broadcastEvent(ag)
            System.out.println("AG== Participant updated in audio group: " + ag, oldParticipant, participant, updatedGroups)
            AudioGroupUserDAO.update(liveMeeting.props.meetingProp.intId, groupId, participant)
            state.update(updatedGroups)
          case None =>
            System.out.println("AG== Participant not found in audio group: " + ag)
            state
        }
      case None =>
        System.out.println("AG== Audio group not found: " + groupId)
        state
    }
  }
}
