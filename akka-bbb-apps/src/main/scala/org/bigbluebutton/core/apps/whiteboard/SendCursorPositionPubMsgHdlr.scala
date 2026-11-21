package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.PresPageCursorDAO
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core2.MeetingStatus2x

trait SendCursorPositionPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: SendCursorPositionPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: SendCursorPositionPubMsg, userIsViewer: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendCursorPositionEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendCursorPositionEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      // The lock state travels with each event (instead of being frozen into the
      // receivers' sessions) so a hideViewersCursor change takes effect immediately
      // without reconnecting anyone: the middleware only checks whether the
      // receiving connection belongs to a locked viewer.
      val hiddenForLockedViewers = userIsViewer && MeetingStatus2x.getPermissions(liveMeeting.status).hideViewersCursor
      val body = SendCursorPositionEvtMsgBody(msg.body.whiteboardId, userIsViewer, hiddenForLockedViewers, msg.body.xPercent, msg.body.yPercent)
      val event = SendCursorPositionEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    for {
      userState <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      if (userState.whiteboardWriteAccess || userState.presenter) {
        val userIsViewer = (userState.role != Roles.MODERATOR_ROLE) && !userState.presenter
        broadcastEvent(msg, userIsViewer)

        // commenting for now as the new approach to provide cursor position from bbb-graphql-middleware is under testing
        // PresPageCursorDAO.insertOrUpdate(msg.body.whiteboardId, liveMeeting.props.meetingProp.intId, msg.header.userId, msg.body.xPercent, msg.body.yPercent)
      }
    }

  }
}
