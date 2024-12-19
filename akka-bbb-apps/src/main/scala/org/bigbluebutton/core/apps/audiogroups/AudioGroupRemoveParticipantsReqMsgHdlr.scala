package org.bigbluebutton.core.apps.audiogroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.AudioGroup
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait AudioGroupRemoveParticipantsReqMsgHdlr extends RightsManagementTrait {
  this: AudioGroupHdlrs =>

  def handle(msg: AudioGroupRemoveParticipantsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(ag: AudioGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(AudioGroupParticipantsRemovedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AudioGroupParticipantsRemovedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = AudioGroupParticipantsRemovedEvtMsgBody(msg.header.userId, ag.id, ag.findAllSenders(), ag.findAllReceivers())
      val event = AudioGroupParticipantsRemovedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    val senders = msg.body.senders
    val receivers = msg.body.receivers
    val affectsOtherUsers = senders.exists(_ != msg.header.userId) || receivers.exists(_ != msg.header.userId)

    if (affectsOtherUsers && permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove participants from an audio group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    AudioGroupApp.findAudioGroup(msg.body.id, state.audioGroups) match {
      case Some(ag) =>
        val updatedGroups = AudioGroupApp.removeAudioGroupParticipants(
          msg.body.id,
          senders,
          receivers,
          state.audioGroups
        )
        broadcastEvent(ag)
        System.out.println("AG== Removed participants from audio group: " + ag)
        // TODO: No DB for now - will be used later :tm:
        state.update(updatedGroups)
      case None =>
        System.out.println("AG== Audio group does not exist: " + msg.body.id)
        state
    }
  }
}
