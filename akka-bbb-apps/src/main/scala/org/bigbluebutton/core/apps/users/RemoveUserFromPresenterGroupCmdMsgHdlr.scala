package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.presentationpod.PresentationPodsApp
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.domain.MeetingState2x

trait RemoveUserFromPresenterGroupCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleRemoveUserFromPresenterGroupCmdMsg(msg: RemoveUserFromPresenterGroupCmdMsg, state: MeetingState2x): MeetingState2x = {

    def broadcastSetPresenterInPodRespMsg(podId: String, nextPresenterId: String, requesterId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, requesterId
      )
      val envelope = BbbCoreEnvelope(SetPresenterInPodRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetPresenterInPodRespMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

      val body = SetPresenterInPodRespMsgBody(podId, nextPresenterId)
      val event = SetPresenterInPodRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    var newState = state

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove user from presenter group."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val userId = msg.body.userId
      val requesterId = msg.body.requesterId

      for {
        requester <- Users2x.findWithIntId(liveMeeting.users2x, requesterId)
      } yield {
        if (requester.role == Roles.MODERATOR_ROLE) {
          Users2x.removeUserFromPresenterGroup(liveMeeting.users2x, userId)
          outGW.send(buildRemoveUserFromPresenterGroup(liveMeeting.props.meetingProp.intId, userId, requesterId))

          val pods = PresentationPodsApp.findPodsWhereUserIsPresenter(state.presentationPodManager, userId)
          if (pods.length > 0) {
            val presenters = Users2x.getPresenterGroupUsers(liveMeeting.users2x)
            var newPresenter = ""
            if (presenters.length > 0) {
              newPresenter = presenters.head
            }

            pods foreach { pod =>
              val updatedPod = pod.setCurrentPresenter(newPresenter)
              broadcastSetPresenterInPodRespMsg(pod.id, newPresenter, "system")
              val newpods = state.presentationPodManager.addPod(updatedPod)
              newState = state.update(newpods)
            }
          }
        }
      }
    }

    newState
  }

}
