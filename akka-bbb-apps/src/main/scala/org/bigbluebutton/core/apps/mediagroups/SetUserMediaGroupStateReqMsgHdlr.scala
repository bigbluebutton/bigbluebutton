package org.bigbluebutton.core.apps.mediagroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait SetUserMediaGroupStateReqMsgHdlr extends RightsManagementTrait {
  this: MediaGroupHdlrs =>

  def handle(msg: SetUserMediaGroupStateReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val requesterId = msg.header.userId
    val targetUserId = msg.body.userId
    val affectsOtherUser = targetUserId != requesterId

    // Non-moderators can only set their own state
    if (affectsOtherUser && permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, requesterId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set media group state for another user"
      PermissionCheck.ejectUserForFailedPermission(meetingId, requesterId, reason, bus.outGW, liveMeeting)
      return state
    }

    // Per-entry permission check for locked groups
    val (permittedEntries, lockedErrors) = msg.body.entries.foldLeft(
      (Vector.empty[MediaGroupEntry], Vector.empty[MediaGroupEntryError])
    ) {
        case ((permitted, errors), entry) =>
          MediaGroupApp.findMediaGroup(entry.groupId, state.mediaGroups) match {
            case Some(mg) if mg.locked && permissionFailed(
              PermissionCheck.MOD_LEVEL,
              PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, requesterId
            ) =>
              (permitted, errors :+ MediaGroupEntryError(entry.groupId, entry.mediaType, "locked group requires moderator"))
            case _ =>
              (permitted :+ entry, errors)
          }
      }

    val result = MediaGroupApp.setUserMediaGroupState(
      targetUserId,
      permittedEntries,
      msg.body.scope,
      state.mediaGroups,
      liveMeeting,
      bus.outGW
    )

    val routing = Routing.addMsgToClientRouting(
      MessageTypes.DIRECT,
      liveMeeting.props.meetingProp.intId,
      requesterId
    )
    val envelope = BbbCoreEnvelope(SetUserMediaGroupStateRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(
      SetUserMediaGroupStateRespMsg.NAME,
      liveMeeting.props.meetingProp.intId,
      requesterId
    )
    val body = SetUserMediaGroupStateRespMsgBody(
      targetUserId,
      result.appliedState,
      result.errors ++ lockedErrors
    )
    val event = SetUserMediaGroupStateRespMsg(header, body)
    val respMsg = BbbCommonEnvCoreMsg(envelope, event)

    bus.outGW.send(respMsg)

    state.update(result.mediaGroups)
  }
}
