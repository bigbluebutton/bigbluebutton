package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.MediaGroup
import org.bigbluebutton.core.apps.mediagroups.PublicMediaGroupIds
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.{ MediaGroupDAO, MediaGroupUserDAO }

trait DestroyMediaGroupReqMsgHdlr extends RightsManagementTrait {
  this: MediaGroupHdlrs =>

  def handle(msg: DestroyMediaGroupReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val groupId = msg.body.id

    if (PublicMediaGroupIds.isPublicGroup(groupId)) {
      state
    } else {
      def broadcastEvent(mg: MediaGroup): Unit = {
        val routing = Routing.addMsgToClientRouting(
          MessageTypes.BROADCAST_TO_MEETING,
          liveMeeting.props.meetingProp.intId,
          msg.header.userId
        )
        val envelope = BbbCoreEnvelope(MediaGroupDestroyedEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(MediaGroupDestroyedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
        val body = MediaGroupDestroyedEvtMsgBody(msg.header.userId, mg.id, mg.mediaType)
        val event = MediaGroupDestroyedEvtMsg(header, body)
        val respMsg = BbbCommonEnvCoreMsg(envelope, event)
        bus.outGW.send(respMsg)
      }

      MediaGroupApp.findMediaGroup(groupId, state.mediaGroups) match {
        case Some(mg) =>
          if (permissionFailed(
            PermissionCheck.MOD_LEVEL,
            PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
          ) || (mg.locked && mg.createdBy != msg.header.userId)) {
            val meetingId = liveMeeting.props.meetingProp.intId
            val reason = "No permission to destroy a media group"
            PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
            state
          } else {
            val updatedGroups = MediaGroupApp.deleteMediaGroup(groupId, state.mediaGroups)
            broadcastEvent(mg)
            MediaGroupUserDAO.deleteAll(liveMeeting.props.meetingProp.intId, groupId)
            MediaGroupDAO.delete(liveMeeting.props.meetingProp.intId, groupId)
            state.update(updatedGroups)
          }
        case None =>
          state
      }
    }
  }
}
