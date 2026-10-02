package org.bigbluebutton.core.apps.users

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsBooleanOrElse
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.presentationpod.SetPresenterInPodActionHandler
import org.bigbluebutton.core.apps.ExternalVideoModel
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.models.{ PresentationPod, RegisteredUsers, Roles, UserState, Users2x }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x.requestBroadcastStop
import org.bigbluebutton.core.db.{ ChatMessageDAO, UserStateDAO }
import org.bigbluebutton.core.graphql.GraphqlMiddleware

trait AssignPresenterReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleAssignPresenterReqMsg(msg: AssignPresenterReqMsg, state: MeetingState2x): MeetingState2x = {
    log.info(
      "handleAssignPresenterReqMsg: requestedBy={} assignedBy={} newPresenterId={}",
      msg.header.userId, msg.body.assignedBy, msg.body.newPresenterId
    )

    val authorized = AssignPresenterActionHandler.handleAction(
      liveMeeting, outGW, msg.header.userId, msg.body.assignedBy, msg.body.newPresenterId
    )

    if (authorized) {
      // Change presenter of default presentation pod
      SetPresenterInPodActionHandler.handleAction(state, liveMeeting, outGW,
        msg.header.userId, PresentationPod.DEFAULT_PRESENTATION_POD,
        msg.body.newPresenterId)
    } else {
      state
    }
  }

}

object AssignPresenterActionHandler extends RightsManagementTrait {

  /**
   * Decides whether requesterId may change the presenter of the meeting.
   *
   * requesterId must be the authenticated sender of the request, taken from the
   * message header. A field carried in the message body is chosen by the caller
   * and therefore cannot be used to authorize that same caller.
   *
   * Lives in the companion object so the decision can be unit tested without
   * standing up a LiveMeeting.
   */
  def isAllowedToAssignPresenter(users: Users2x, requesterId: String, isBreakout: Boolean): Boolean = {
    isBreakout ||
      !permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, users, requesterId)
  }

  /**
   * Applies the presenter change when requesterId is allowed to make it.
   *
   * assignedBy is only the label shown to participants (presenter events and the
   * chat notice); it never decides whether the change is allowed.
   *
   * @return true when the request was authorized, false when it was denied.
   *         Callers must skip presenter side effects, such as assigning the
   *         presenter of the presentation pod, when this returns false.
   */
  def handleAction(liveMeeting: LiveMeeting, outGW: OutMsgRouter, requesterId: String,
                   assignedBy: String, newPresenterId: String): Boolean = {
    val authorized = isAllowedToAssignPresenter(liveMeeting.users2x, requesterId,
      liveMeeting.props.meetingProp.isBreakout)

    if (!authorized) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change presenter in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, requesterId, reason, outGW, liveMeeting)
    } else {
      for {
        oldPres <- Users2x.findPresenter(liveMeeting.users2x)
      } yield {
        if (oldPres.intId != newPresenterId) {
          // Stop external video if it's running
          ExternalVideoModel.stop(outGW, liveMeeting)
          // Request a screen broadcast stop (goes to SFU, comes back through
          // ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg)
          requestBroadcastStop(outGW, liveMeeting)

          for {
            u <- RegisteredUsers.findWithUserId(oldPres.intId, liveMeeting.registeredUsers)
            newUserState <- Users2x.makeNotPresenter(liveMeeting.users2x, oldPres.intId)
          } yield {
            // Force reconnection with graphql to refresh permissions
            GraphqlMiddleware.requestGraphqlReconnection(u.sessionToken, "assigned_presenter")

            //Update dabatase
            UserStateDAO.update(newUserState)

            //Send redis Evt message
            broadcastOldPresenterChange(oldPres)
          }
        }
      }

      for {
        u <- RegisteredUsers.findWithUserId(newPresenterId, liveMeeting.registeredUsers)
        newPres <- Users2x.findWithIntId(liveMeeting.users2x, newPresenterId)
        newUserState <- Users2x.makePresenter(liveMeeting.users2x, newPres.intId)
      } yield {
        // Force reconnection with graphql to refresh permissions
        GraphqlMiddleware.requestGraphqlReconnection(u.sessionToken, "assigned_presenter")

        //Update dabatase
        UserStateDAO.update(newUserState)

        //Send redis Evt message
        broadcastNewPresenterChange(newPres)

        //Chat message to announce new presenter
        sendChatMessageAnnouncingNewPresenter(newPres)

      }
    }

    def broadcastOldPresenterChange(oldPres: UserState): Unit = {
      // unassign old presenter
      val routingUnassign = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, oldPres.intId
      )
      val envelopeUnassign = BbbCoreEnvelope(PresenterUnassignedEvtMsg.NAME, routingUnassign)
      val headerUnassign = BbbClientMsgHeader(PresenterUnassignedEvtMsg.NAME, liveMeeting.props.meetingProp.intId,
        oldPres.intId)

      val bodyUnassign = PresenterUnassignedEvtMsgBody(oldPres.intId, oldPres.name, assignedBy)
      val eventUnassign = PresenterUnassignedEvtMsg(headerUnassign, bodyUnassign)
      val msgEventUnassign = BbbCommonEnvCoreMsg(envelopeUnassign, eventUnassign)
      outGW.send(msgEventUnassign)
    }

    def broadcastNewPresenterChange(newPres: UserState): Unit = {
      // set new presenter
      val routingAssign = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, newPres.intId
      )
      val envelopeAssign = BbbCoreEnvelope(PresenterAssignedEvtMsg.NAME, routingAssign)
      val headerAssign = BbbClientMsgHeader(PresenterAssignedEvtMsg.NAME, liveMeeting.props.meetingProp.intId,
        newPres.intId)

      val bodyAssign = PresenterAssignedEvtMsgBody(newPres.intId, newPres.name, assignedBy)
      val eventAssign = PresenterAssignedEvtMsg(headerAssign, bodyAssign)
      val msgEventAssign = BbbCommonEnvCoreMsg(envelopeAssign, eventAssign)
      outGW.send(msgEventAssign)
    }

    def sendChatMessageAnnouncingNewPresenter(newPres: UserState): Unit = {
      val announcePresenterChangeInChat = getConfigPropertyValueByPathAsBooleanOrElse(
        liveMeeting.clientSettings,
        "public.chat.announcePresenterChangeInChat",
        alternativeValue = true
      )

      if (announcePresenterChangeInChat) {
        val assignedByName = Users2x.findWithIntId(liveMeeting.users2x, assignedBy).map(_.name).getOrElse("")

        val hideUserList = MeetingStatus2x.getPermissions(liveMeeting.status).hideUserList
        val shouldSkip = hideUserList && newPres.role == Roles.VIEWER_ROLE

        if (!shouldSkip) {
          val msgMeta = Map("assignedBy" -> assignedByName)
          ChatMessageDAO.insertSystemMsg(liveMeeting.props.meetingProp.intId, GroupChatApp.MAIN_PUBLIC_CHAT, "", "", GroupChatMessageType.USER_IS_PRESENTER_MSG, msgMeta, newPres.name)
        }
      }
    }

    authorized
  }
}
