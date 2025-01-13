package org.bigbluebutton.core.apps.audiogroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.db.AudioGroupDAO
import org.bigbluebutton.core.db.AudioGroupUserDAO
import org.bigbluebutton.core.models.AudioGroup
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait CreateAudioGroupReqMsgHdlr extends RightsManagementTrait {
  this: AudioGroupHdlrs =>

  def handle(msg: CreateAudioGroupReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(ag: AudioGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(AudioGroupCreatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AudioGroupCreatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = AudioGroupCreatedEvtMsgBody(ag.id, ag.createdBy, ag.findAllSenders(), ag.findAllReceivers())
      val event = AudioGroupCreatedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to create a new audio group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    val senders = msg.body.senders
    val receivers = msg.body.receivers

    AudioGroupApp.findAudioGroup(msg.body.id, state.audioGroups) match {
      case Some(ag) =>
        System.out.println("AG== Audio group already exists: " + ag)
        // Just update the audio group with the new participants
        val updatedGroups = AudioGroupApp.addAudioGroupParticipants(
          msg.body.id,
          senders,
          receivers,
          state.audioGroups
        )
        senders.foreach { sender =>
          AudioGroupUserDAO.insert(liveMeeting.props.meetingProp.intId, ag.id, sender)
        }
        receivers.foreach { receiver =>
          AudioGroupUserDAO.insert(liveMeeting.props.meetingProp.intId, ag.id, receiver)
        }

        val newState = state.update(updatedGroups)
        AudioGroupApp.handleAudioGroupUpdated(ag.id, updatedGroups, liveMeeting, bus.outGW)
        newState
      case None =>
        val newGroup = AudioGroupApp.createAudioGroup(
          msg.body.id,
          msg.header.userId,
          senders,
          receivers,
          state.audioGroups
        )
        val updatedGroups = AudioGroupApp.addAudioGroup(newGroup, state.audioGroups)
        broadcastEvent(newGroup)
        AudioGroupDAO.insert(liveMeeting.props.meetingProp.intId, newGroup)
        for (participant <- newGroup.findAllParticipants()) {
          AudioGroupUserDAO.insert(liveMeeting.props.meetingProp.intId, newGroup.id, participant)
        }
        System.out.println("AG== Created new audio group: " + newGroup)
        state.update(updatedGroups)
    }
  }
}
