package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.MediaGroup
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait MediaGroupAddParticipantsReqMsgHdlr extends RightsManagementTrait {
  this: MediaGroupHdlrs =>

  def handle(msg: MediaGroupAddParticipantsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(mg: MediaGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(MediaGroupParticipantsAddedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(MediaGroupParticipantsAddedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = MediaGroupParticipantsAddedEvtMsgBody(msg.body.id, msg.body.mediaType, msg.header.userId, mg.findAllSenders(), mg.findAllReceivers())
      val event = MediaGroupParticipantsAddedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    val senders = msg.body.senders
    val receivers = msg.body.receivers
    val affectsOtherUsers = senders.exists(_.userId != msg.header.userId) || receivers.exists(_.userId != msg.header.userId)
    val groupId = msg.body.id

    if (affectsOtherUsers && permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to add participants to a media group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    MediaGroupApp.findMediaGroup(groupId, state.mediaGroups) match {
      case Some(mg) =>
        val updatedGroups = MediaGroupApp.addMediaGroupParticipants(
          groupId,
          senders,
          receivers,
          state.mediaGroups
        )
        broadcastEvent(mg)
        // TODO: DB update for participants
        val newState = state.update(updatedGroups)
        MediaGroupApp.handleMediaGroupUpdated(mg.id, updatedGroups, liveMeeting, bus.outGW)
        newState
      case None =>
        state
    }
  }
}
