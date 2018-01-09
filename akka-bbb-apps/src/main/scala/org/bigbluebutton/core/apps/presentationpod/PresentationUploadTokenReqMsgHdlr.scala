package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait PresentationUploadTokenReqMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationUploadTokenReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastPresentationUploadTokenPassResp(msg: PresentationUploadTokenReqMsg, token: String): Unit = {
      // send back to client
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationUploadTokenPassRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadTokenPassRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadTokenPassRespMsgBody(msg.body.podId, token, msg.body.filename)
      val event = PresentationUploadTokenPassRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def broadcastPresentationUploadTokenFailResp(msg: PresentationUploadTokenReqMsg): Unit = {
      // send back to client
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationUploadTokenFailRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadTokenFailRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadTokenFailRespMsgBody(msg.body.podId, msg.body.filename)
      val event = PresentationUploadTokenFailRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def broadcastPresentationUploadTokenSysPubMsg(msg: PresentationUploadTokenReqMsg, token: String): Unit = {
      // send to bbb-web
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PresentationUploadTokenSysPubMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadTokenSysPubMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadTokenSysPubMsgBody(msg.body.podId, token, msg.body.filename)
      val event = PresentationUploadTokenSysPubMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    def userIsAllowedToUploadInPod(podId: String, userId: String): Boolean = {
      var allowed = false

      for {
        user <- Users2x.findWithIntId(liveMeeting.users2x, userId)
        pod <- PresentationPodsApp.getPresentationPod(state, podId)
      } yield {
        if (Users2x.userIsInPresenterGroup(liveMeeting.users2x, userId)) {
          allowed = pod.currentPresenter == userId
        }
      }

      allowed
    }

    log.info("handlePresentationUploadTokenReqMsg" + liveMeeting.props.meetingProp.intId +
      " userId=" + msg.header.userId + " filename=" + msg.body.filename)

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to request presentation upload token."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      if (userIsAllowedToUploadInPod(msg.body.podId, msg.header.userId)) {
        val token = PresentationPodsApp.generateToken(msg.body.podId, msg.header.userId)
        broadcastPresentationUploadTokenPassResp(msg, token)
        broadcastPresentationUploadTokenSysPubMsg(msg, token)
      } else {
        broadcastPresentationUploadTokenFailResp(msg)
      }
    }

    state
  }

}
