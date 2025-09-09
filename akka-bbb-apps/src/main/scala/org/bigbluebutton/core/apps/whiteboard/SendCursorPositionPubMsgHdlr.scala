package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.PresPageCursorDAO
import org.bigbluebutton.core.models.{ Roles, Users2x }

trait SendCursorPositionPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: SendCursorPositionPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: SendCursorPositionPubMsg, userIsViewer: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendCursorPositionEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendCursorPositionEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SendCursorPositionEvtMsgBody(msg.body.whiteboardId, userIsViewer, msg.body.xPercent, msg.body.yPercent)
      val event = SendCursorPositionEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (filterWhiteboardMessage(msg.body.whiteboardId, msg.header.userId, liveMeeting) && permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to send your cursor position."
      // Just drop messages as these might be delayed messages from multi-user whiteboard. Don't want to
      // eject user unnecessarily when switching from multi-user to single user. (ralam feb 7, 2018)
      //PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      for {
        regUser <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
      } yield {
        val userIsViewer = (regUser.role != Roles.MODERATOR_ROLE) && !regUser.presenter
        broadcastEvent(msg, userIsViewer)

        // commenting for now as the new approach to provide cursor position from bbb-graphql-middleware is under testing
        // PresPageCursorDAO.insertOrUpdate(msg.body.whiteboardId, liveMeeting.props.meetingProp.intId, msg.header.userId, msg.body.xPercent, msg.body.yPercent)
      }

    }
  }
}
