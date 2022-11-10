package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Pads
import org.bigbluebutton.core.running.LiveMeeting

trait PadPinnedReqMsgHdlr extends RightsManagementTrait {
  this: PadsApp2x =>

  def handle(msg: PadPinnedReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(groupId: String, pinned: Boolean): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadPinnedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PadPinnedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")
      val body = PadPinnedEvtMsgBody(groupId, pinned)
      val event = PadPinnedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    if (Pads.hasAccess(liveMeeting, msg.body.externalId, msg.header.userId)) {
      if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
        val meetingId = liveMeeting.props.meetingProp.intId
        val reason = "You need to be the presenter to pin Shared Notes"
        PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      } else {
        Pads.getGroup(liveMeeting.pads, msg.body.externalId) match {
          case Some(group) => broadcastEvent(group.externalId, msg.body.pinned)
          case _           =>
        }
      }
    }
  }
}
