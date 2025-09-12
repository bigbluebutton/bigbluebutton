package org.bigbluebutton.core.apps.audiogroups

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.AudioGroupDAO
import org.bigbluebutton.core.db.AudioGroupUserDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.AudioGroup
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait DestroyAudioGroupReqMsgHdlr extends RightsManagementTrait {
  this: AudioGroupHdlrs =>

  def handle(msg: DestroyAudioGroupReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(ag: AudioGroup): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        msg.header.userId
      )
      val envelope = BbbCoreEnvelope(AudioGroupDestroyedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(AudioGroupDestroyedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val body = AudioGroupDestroyedEvtMsgBody(msg.header.userId, ag.id)
      val event = AudioGroupDestroyedEvtMsg(header, body)
      val respMsg = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(respMsg)
    }

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to destroy an audio group"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      return state
    }

    AudioGroupApp.findAudioGroup(msg.body.id, state.audioGroups) match {
      case Some(ag) =>
        val updatedGroups = AudioGroupApp.deleteAudioGroup(msg.body.id, state.audioGroups)
        broadcastEvent(ag)
        AudioGroupDAO.delete(liveMeeting.props.meetingProp.intId, msg.body.id)
        AudioGroupUserDAO.deleteAll(liveMeeting.props.meetingProp.intId, msg.body.id)
        state.update(updatedGroups)
      case None =>
        state
    }
  }
}
