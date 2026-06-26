package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs.{
  BbbClientMsgHeader,
  BbbCommonEnvCoreMsg,
  BbbCoreEnvelope,
  CreateMediaGroupReqMsg,
  MediaGroupCreatedEvtMsg,
  MediaGroupCreatedEvtMsgBody,
  MediaGroupParticipant,
  MessageTypes,
  Routing
}
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.MediaGroup
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.{ MediaGroupDAO, MediaGroupUserDAO }

trait CreateMediaGroupReqMsgHdlr extends RightsManagementTrait {
  this: MediaGroupHdlrs =>

  def handle(msg: CreateMediaGroupReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(mg: MediaGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(MediaGroupCreatedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(MediaGroupCreatedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = MediaGroupCreatedEvtMsgBody(mg.id, msg.header.userId, mg.mediaType, mg.locked, mg.record, mg.findAllSenders(), mg.findAllReceivers())
      val event = MediaGroupCreatedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to create a media group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else if (PublicMediaGroupIds.isPublicGroup(msg.body.id)) {
      // Public groups are created by the system, not by clients
      state
    } else {
      val senders = msg.body.senders
      val receivers = msg.body.receivers
      val groupId = msg.body.id

      def insertParticipants(
          senders:   Vector[MediaGroupParticipant],
          receivers: Vector[MediaGroupParticipant],
          mgId:      String
      ): Unit = {
        senders.foreach { sender =>
          MediaGroupUserDAO.insert(liveMeeting.props.meetingProp.intId, mgId, sender)
        }
        receivers.foreach { receiver =>
          MediaGroupUserDAO.insert(liveMeeting.props.meetingProp.intId, mgId, receiver)
        }
      }

      MediaGroupApp.findMediaGroup(groupId, state.mediaGroups) match {
        case Some(mg) =>
          // Just update the media group with the new participants
          val updatedGroups = MediaGroupApp.addMediaGroupParticipants(
            msg.body.id,
            senders,
            receivers,
            state.mediaGroups
          )

          insertParticipants(senders, receivers, mg.id)
          val newState = state.update(updatedGroups)
          MediaGroupApp.handleMediaGroupUpdated(mg.id, updatedGroups, liveMeeting, bus.outGW)
          newState
        case None =>
          // Lazily create public groups (and enroll all current users)
          // before creating the first scoped group. No-op once public groups already exist.
          val baseGroups = MediaGroupApp.ensurePublicGroupsCreated(liveMeeting, state.mediaGroups)
          val mg = MediaGroupApp.createMediaGroup(
            groupId,
            msg.header.userId,
            msg.body.mediaType,
            msg.body.locked,
            msg.body.record,
            senders,
            receivers,
            baseGroups
          )
          val updatedGroups = MediaGroupApp.addMediaGroup(mg, baseGroups)
          broadcastEvent(mg)
          MediaGroupDAO.insert(liveMeeting.props.meetingProp.intId, mg)
          insertParticipants(senders, receivers, mg.id)
          state.update(updatedGroups)
      }
    }
  }
}
