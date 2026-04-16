package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Users2x, Roles, PresentationPod }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter, MeetingActor }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.apps.presentationpod.SetPresenterInPodActionHandler
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.db.NotificationDAO
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait UserSetPresenterRequestReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserSetPresenterRequestReqMsg(msg: UserSetPresenterRequestReqMsg): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val senderId = msg.header.userId
    val requesterId = msg.body.requesterId
    val requestedPresenter = msg.body.requestedPresenter
    val approved = msg.body.approved

    log.info("Received set presenter request. meetingId=" + meetingId +
      " senderId=" + senderId + " requesterId=" + requesterId +
      " requestedPresenter=" + requestedPresenter + " approved=" + approved)

    // User is setting their own flag to request presenter
    if (requestedPresenter && senderId == requesterId) {
      for {
        requester <- Users2x.findWithIntId(liveMeeting.users2x, requesterId)
      } yield {
        if (requester.presenter) {
          log.info("User is already presenter. meetingId=" + meetingId + " requesterId=" + requesterId)
        } else if (requester.role == Roles.MODERATOR_ROLE) {
          log.info("Moderator can become presenter directly. meetingId=" + meetingId + " requesterId=" + requesterId)
        } else {
          val permissions = org.bigbluebutton.core2.MeetingStatus2x.getPermissions(liveMeeting.status)
          if (permissions.presenterPolicy == "moderatorOnly") {
            log.info("Presenter request is locked. meetingId=" + meetingId + " requesterId=" + requesterId)
          } else if (permissions.presenterPolicy == "freeForAll") {
            // Auto-approve: directly assign as presenter
            // Use requesterId as assignedBy and skip permission check
            Users2x.setUserRequestedPresenter(liveMeeting.users2x, requesterId, false)

            log.info("Free-for-all presenter policy, auto-assigning presenter. meetingId=" + meetingId +
              " requesterId=" + requesterId + " requesterName=" + requester.name +
              " assignedBy=" + requesterId)

            AssignPresenterActionHandler.handleAction(liveMeeting, outGW, requesterId, requesterId, skipPermissions = true)

            return SetPresenterInPodActionHandler.handleAction(state, liveMeeting, outGW,
              requesterId, PresentationPod.DEFAULT_PRESENTATION_POD,
              requesterId)
          } else {
            Users2x.setUserRequestedPresenter(liveMeeting.users2x, requesterId, true)
            log.info("User requested presenter. meetingId=" + meetingId +
              " requesterId=" + requesterId + " requesterName=" + requester.name)
          }
        }
      }
      state
    } else if (!requestedPresenter) {
      // Moderator is answering the request (lowering the flag)
      if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL,
        liveMeeting.users2x, senderId)) {
        val reason = "No permission to answer presenter request."
        PermissionCheck.ejectUserForFailedPermission(meetingId, senderId, reason, outGW, liveMeeting)
        state
      } else {
        for {
          requester <- Users2x.findWithIntId(liveMeeting.users2x, requesterId)
        } yield {
          // Reset the request flag
          Users2x.setUserRequestedPresenter(liveMeeting.users2x, requesterId, false)

          if (approved) {
            // Build and send AssignPresenterReqMsg to assign the specific user as presenter
            val assignMsg = AssignPresenterReqMsg(
              BbbClientMsgHeader(AssignPresenterReqMsg.NAME, meetingId, senderId),
              AssignPresenterReqMsgBody(senderId, requesterId)
            )
            val newState = handlePresenterChange(assignMsg, state)

            val senderName = Users2x.findWithIntId(liveMeeting.users2x, senderId).map(_.name).getOrElse("")
            val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
              meetingId,
              "info",
              "co_presentation",
              "app.notification.presenterRequestApproved",
              "Notification when a presenter request is approved",
              Map("presenterName" -> requester.name, "approvedByName" -> senderName)
            )
            outGW.send(notifyEvent)
            NotificationDAO.insert(notifyEvent)

            log.info("Presenter request approved. meetingId=" + meetingId +
              " requesterId=" + requesterId + " approvedBy=" + senderId)
            return newState
          } else {
            log.info("Presenter request denied. meetingId=" + meetingId +
              " requesterId=" + requesterId + " deniedBy=" + senderId)
          }
        }
        state
      }
    } else {
      state
    }
  }
}
