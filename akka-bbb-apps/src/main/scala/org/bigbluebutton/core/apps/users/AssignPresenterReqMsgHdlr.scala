package org.bigbluebutton.core.apps.users

import org.bigbluebutton.ClientSettings.{ getConfigPropertyValueByPathAsBooleanOrElse, getConfigPropertyValueByPathAsIntOrElse }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.presentationpod.SetPresenterInPodActionHandler
import org.bigbluebutton.core.apps.ExternalVideoModel
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.models.{ PresentationPod, RegisteredUsers, UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x.requestBroadcastStop
import org.bigbluebutton.core.db.ChatMessageDAO
import org.bigbluebutton.core2.message.senders.Sender

trait AssignPresenterReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleAssignPresenterReqMsg(msg: AssignPresenterReqMsg, state: MeetingState2x): MeetingState2x = {
    log.info("handleAssignPresenterReqMsg: assignedBy={} newPresenterId={}", msg.body.assignedBy, msg.body.newPresenterId)
    AssignPresenterActionHandler.handleAction(liveMeeting, outGW, msg.body.assignedBy, msg.body.newPresenterId)

    // Change presenter of default presentation pod
    SetPresenterInPodActionHandler.handleAction(state, liveMeeting, outGW,
      msg.header.userId, PresentationPod.DEFAULT_PRESENTATION_POD,
      msg.body.newPresenterId)
  }

}

object AssignPresenterActionHandler extends RightsManagementTrait {

  def handleAction(liveMeeting: LiveMeeting, outGW: OutMsgRouter, assignedBy: String, newPresenterId: String): Unit = {
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

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, assignedBy)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change presenter in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, assignedBy, reason, outGW, liveMeeting)
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

          Users2x.makeNotPresenter(liveMeeting.users2x, oldPres.intId)
          broadcastOldPresenterChange(oldPres)

          // Force reconnection with graphql to refresh permissions
          for {
            u <- RegisteredUsers.findWithUserId(oldPres.intId, liveMeeting.registeredUsers)
          } yield {
            Sender.sendForceUserGraphqlReconnectionSysMsg(liveMeeting.props.meetingProp.intId, oldPres.intId, u.sessionToken, "role_changed", outGW)
          }
        }
      }

      for {
        newPres <- Users2x.findWithIntId(liveMeeting.users2x, newPresenterId)
      } yield {
        Users2x.makePresenter(liveMeeting.users2x, newPres.intId)
        broadcastNewPresenterChange(newPres)

        // Force reconnection with graphql to refresh permissions
        for {
          u <- RegisteredUsers.findWithUserId(newPres.intId, liveMeeting.registeredUsers)
        } yield {
          Sender.sendForceUserGraphqlReconnectionSysMsg(liveMeeting.props.meetingProp.intId, newPres.intId, u.sessionToken, "role_changed", outGW)
        }

        //Chat message to announce new presenter
        val announcePresenterChangeInChat = getConfigPropertyValueByPathAsBooleanOrElse(
          liveMeeting.clientSettings,
          "public.chat.announcePresenterChangeInChat",
          alternativeValue = true
        )

        if (announcePresenterChangeInChat) {
          val assignedByName = Users2x.findWithIntId(liveMeeting.users2x, assignedBy).get match {
            case u: UserState => u.name
            case _            => ""
          }

          //System message
          val msgMeta = Map(
            "assignedBy" -> assignedByName
          )
          ChatMessageDAO.insertSystemMsg(liveMeeting.props.meetingProp.intId, GroupChatApp.MAIN_PUBLIC_CHAT, "", GroupChatMessageType.USER_IS_PRESENTER_MSG, msgMeta, newPres.name)
        }

      }
    }
  }
}
