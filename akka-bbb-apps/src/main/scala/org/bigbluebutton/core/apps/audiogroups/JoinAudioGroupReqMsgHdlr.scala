package org.bigbluebutton.core.apps.audiogroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.AudioGroup
import org.bigbluebutton.core.db.AudioGroupUserDAO
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait JoinAudioGroupReqMsgHdlr extends RightsManagementTrait {
  this: AudioGroupHdlrs =>

  def handle(msg: JoinAudioGroupReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val participant = msg.body.participant
    val affectsOtherUser = participant.id != msg.header.userId
    val participantTypeValid = AudioGroupApp.isParticipantTypeValid(participant.participantType)

    def broadcastEvent(ag: AudioGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(AudioGroupParticipantJoinedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AudioGroupParticipantJoinedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = AudioGroupParticipantJoinedEvtMsgBody(ag.id, participant)
      val event = AudioGroupParticipantJoinedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    if (!participantTypeValid || permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    ) && affectsOtherUser) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to join an audio group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    val groupId = msg.body.id

    AudioGroupApp.findAudioGroup(groupId, state.audioGroups) match {
      case Some(ag) =>
        ag.findParticipant(participant.id) match {
          case Some(participant) =>
            state
          case None =>
            val updatedGroups = AudioGroupApp.addAudioGroupParticipant(
              groupId,
              participant,
              state.audioGroups
            )
            broadcastEvent(ag)
            AudioGroupUserDAO.insert(
              liveMeeting.props.meetingProp.intId,
              groupId,
              participant
            )
            val newState = state.update(updatedGroups)
            AudioGroupApp.handleAudioGroupUpdated(ag.id, updatedGroups, liveMeeting, bus.outGW)
            newState
        }

      case None =>
        state
    }
  }
}
