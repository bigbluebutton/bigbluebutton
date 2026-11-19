package org.bigbluebutton.core.apps.presentationpod

import org.apache.commons.codec.digest.DigestUtils
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ InsertIntent, InsertStage, PresentationInPod, PresentationPod, PresentationUploadTokenRateLimiter, Users2x }
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.util.RandomStringGenerator

trait PresentationUploadTokenReqMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationUploadTokenReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastPresentationUploadTokenPassResp(msg: PresentationUploadTokenReqMsg, token: String, presId: String): Unit = {
      // send back to client
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(PresentationUploadTokenPassRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadTokenPassRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadTokenPassRespMsgBody(msg.body.podId, token, msg.body.filename, msg.body.uploadTemporaryId, presId)
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

    def broadcastPresentationUploadTokenSysPubMsg(msg: PresentationUploadTokenReqMsg, token: String, presId: String,
                                                  intent: InsertIntent = InsertIntent.empty): Unit = {
      // send to bbb-web
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PresentationUploadTokenSysPubMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationUploadTokenSysPubMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = PresentationUploadTokenSysPubMsgBody(msg.body.podId, token, msg.body.filename, liveMeeting.props.meetingProp.intId, presId,
        intent.targetId, intent.position, intent.seenTotalPages, intent.navigate, intent.requestPageId)
      val event = PresentationUploadTokenSysPubMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    // Record the rejection on a row of its own so the uploader shows why that file failed.
    // The empty token tells the client not to send the file. The user's oldest rejection rows
    // beyond one window's worth are deleted, so their number stays bounded.
    def reportRejection(msg: PresentationUploadTokenReqMsg, presentationId: String,
                        errorMsgKey: String, errorDetails: Map[String, String]): Unit = {
      val meetingId = liveMeeting.props.meetingProp.intId
      val userId = msg.header.userId
      PresPresentationDAO.insertRejectedUpload(
        meetingId,
        userId,
        msg.body.uploadTemporaryId,
        presentationId,
        msg.body.filename,
        errorMsgKey,
        errorDetails
      )

      val maxRows = PresentationUploadTokenRateLimiter.maxRejectionRows(presUploadTokenMaxRequests)
      liveMeeting.presUploadRateLimiter.recordRejectionRow(userId, presentationId, maxRows)
        .foreach(expiredId => PresPresentationDAO.delete(meetingId, expiredId))
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

    // A token request with an insert intent, after the checks every token request goes through. Refused, it
    // only notifies the requester and leaves the row that ends the client's token request; accepted, the
    // token is issued as for any upload, and the insert enters the queue waiting for the file.
    def handleInsertTokenRequest(msg: PresentationUploadTokenReqMsg, presentationId: String,
                                 pod: Option[PresentationPod]): MeetingState2x = {
      val meetingId = liveMeeting.props.meetingProp.intId
      val userId = msg.header.userId
      val target = pod.flatMap(_.getPresentation(msg.body.insertIntoPresentationId))

      PresentationInsertPages.decideToken(insertPagesEnabled(liveMeeting), target) match {
        case Some(key) =>
          log.info(s"Refusing insert token request: $key. meetingId=$meetingId userId=$userId " +
            s"presentationId=${msg.body.insertIntoPresentationId}")
          broadcastPresentationUploadTokenFailResp(msg)
          PresPresentationDAO.insertRefusedInsertRequest(meetingId, userId, msg.body.uploadTemporaryId, presentationId,
            msg.body.filename, key)
          val maxRows = PresentationUploadTokenRateLimiter.maxRejectionRows(presUploadTokenMaxRequests)
          liveMeeting.presUploadRateLimiter.recordRejectionRow(userId, presentationId, maxRows)
            .foreach(expiredId => PresPresentationDAO.delete(meetingId, expiredId))
          notifyInsertPages(meetingId, userId, "error", s"app.presentation.insertPages.error.$key",
            Map("filename" -> msg.body.filename), bus)
          state
        case None =>
          val t = target.get
          val intent = InsertIntent(t.id, msg.body.insertAtPosition, msg.body.insertSeenTotalPages,
            msg.body.insertNavigate, PresentationInPod.getCurrentPage(t).map(_.id).getOrElse(""))
          val token = PresentationPodsApp.generateToken(msg.body.podId, userId)
          broadcastPresentationUploadTokenPassResp(msg, token, presentationId)
          broadcastPresentationUploadTokenSysPubMsg(msg, token, presentationId, intent)
          PresPresentationDAO.insertUploadTokenIfNotExists(meetingId, userId, msg.body.uploadTemporaryId, presentationId,
            token, msg.body.filename)
          state.update(PresentationInsertPages.enqueue(state.insertPagesQueue, presentationId, userId, msg.body.podId,
            msg.body.filename, intent, InsertStage.Request, System.currentTimeMillis()))
      }
    }

    log.info("handlePresentationUploadTokenReqMsg" + liveMeeting.props.meetingProp.intId +
      " userId=" + msg.header.userId + " filename=" + msg.body.filename)

    val meetingId = liveMeeting.props.meetingProp.intId

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("presentation")) {
      broadcastPresentationUploadTokenFailResp(msg)
      val reason = "Presentation is disabled for this meeting"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to request presentation upload token."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      if (userIsAllowedToUploadInPod(msg.body.podId, msg.header.userId)) {
        val presentationId = PresentationPodsApp.generatePresentationId(msg.body.filename)
        // The pod count does not include tokens already issued but not yet converted;
        // the per-user request rate limit bounds that window.
        val pod = PresentationPodsApp.getPresentationPod(state, msg.body.podId)

        // Rate limit first, so every request counts against it, including ones the pod
        // cap would refuse.
        if (!liveMeeting.presUploadRateLimiter.allow(
          msg.header.userId, System.currentTimeMillis(),
          presUploadTokenMaxRequests, presUploadTokenWindowSec * 1000L
        )) {
          log.warning("Rejecting presentation upload token request: request rate limit exceeded. " +
            s"meetingId=$meetingId userId=${msg.header.userId} limit=$presUploadTokenMaxRequests windowSec=$presUploadTokenWindowSec")
          broadcastPresentationUploadTokenFailResp(msg)
          if (liveMeeting.presUploadRateLimiter.allowRateLimitRow(
            msg.header.userId, System.currentTimeMillis(),
            PresentationUploadTokenRateLimiter.MaxRateLimitRowsPerWindow, presUploadTokenWindowSec * 1000L
          )) {
            reportRejection(msg, presentationId, "PRESENTATION_UPLOAD_RATE_LIMIT_EXCEEDED", Map.empty)
          }
          state
        } else if (msg.body.insertIntoPresentationId.nonEmpty) {
          // An insert of pages: its decision takes the place of the pod cap.
          handleInsertTokenRequest(msg, presentationId, pod)
        } else if (pod.exists(PresentationPodsApp.podIsFullFor(_, presentationId, presMaxPerPod))) {
          log.warning("Rejecting presentation upload token request: pod presentation limit reached. " +
            s"meetingId=$meetingId userId=${msg.header.userId} podId=${msg.body.podId} " +
            s"count=${pod.map(_.getPresentationsSize()).getOrElse(0)} limit=$presMaxPerPod")
          broadcastPresentationUploadTokenFailResp(msg)
          reportRejection(msg, presentationId, "PRESENTATION_UPLOAD_POD_LIMIT_REACHED",
            Map("maxPresentationsPerPod" -> presMaxPerPod.toString))
          state
        } else {
          val token = PresentationPodsApp.generateToken(msg.body.podId, msg.header.userId)
          broadcastPresentationUploadTokenPassResp(msg, token, presentationId)
          broadcastPresentationUploadTokenSysPubMsg(msg, token, presentationId)

          PresPresentationDAO.insertUploadTokenIfNotExists(
            meetingId,
            msg.header.userId,
            msg.body.uploadTemporaryId,
            presentationId,
            token,
            msg.body.filename
          )
          state
        }

      } else {
        broadcastPresentationUploadTokenFailResp(msg)
        state
      }
    }
  }

}
