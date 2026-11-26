package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.apps.presentationpod.PresentationInsertPages._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting

/**
 * A request to insert a blank page. It goes through the checks and the decision of a request for an upload
 * token with an insert intent; accepted, bbb-web makes a PDF page the size of the page before the requested
 * position, which is converted and delivered like an inserted file.
 */
trait InsertBlankPagePubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: InsertBlankPagePubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.header.userId

    def isPresenterOfPod: Boolean = {
      Users2x.findWithIntId(liveMeeting.users2x, userId).isDefined &&
        Users2x.userIsInPresenterGroup(liveMeeting.users2x, userId) &&
        PresentationPodsApp.getPresentationPod(state, msg.body.podId).exists(_.currentPresenter == userId)
    }

    // The row the upload toast shows for a request refused by the request rate limit, as for a token request.
    def reportRateLimited(uploadPresentationId: String): Unit = {
      if (liveMeeting.presUploadRateLimiter.allowRateLimitRow(
        userId, System.currentTimeMillis(),
        PresentationUploadTokenRateLimiter.MaxRateLimitRowsPerWindow, presUploadTokenWindowSec * 1000L
      )) {
        PresPresentationDAO.insertRejectedUpload(meetingId, userId, "", uploadPresentationId, BlankPageFilename,
          "PRESENTATION_UPLOAD_RATE_LIMIT_EXCEEDED", Map.empty)
        val maxRows = PresentationUploadTokenRateLimiter.maxRejectionRows(presUploadTokenMaxRequests)
        liveMeeting.presUploadRateLimiter.recordRejectionRow(userId, uploadPresentationId, maxRows)
          .foreach(expiredId => PresPresentationDAO.delete(meetingId, expiredId))
      }
    }

    def sendToBbbWeb(target: PresentationInPod, intent: InsertIntent, uploadPresentationId: String,
                     reference: PresentationPage): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PresentationInsertBlankPageSysMsg.NAME, routing)
      val header = BbbClientMsgHeader(PresentationInsertBlankPageSysMsg.NAME, meetingId, userId)
      val body = PresentationInsertBlankPageSysMsgBody(msg.body.podId, intent.targetId, intent.position,
        intent.seenTotalPages, intent.navigate, intent.requestPageId, userId, uploadPresentationId,
        BlankPageFilename, Math.round(reference.width).toInt, Math.round(reference.height).toInt)
      bus.outGW.send(BbbCommonEnvCoreMsg(envelope, PresentationInsertBlankPageSysMsg(header, body)))
    }

    log.info(s"handleInsertBlankPagePubMsg meetingId=$meetingId userId=$userId presentationId=${msg.body.presentationId} " +
      s"position=${msg.body.position} seenTotalPages=${msg.body.seenTotalPages}")

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("presentation")) {
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, "Presentation is disabled for this meeting",
        bus.outGW, liveMeeting)
      state
    } else if (filterPresentationMessage(liveMeeting.users2x, userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, userId)) {
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, "No permission to insert a blank page.",
        bus.outGW, liveMeeting)
      state
    } else if (!isPresenterOfPod) {
      log.info(s"Ignoring blank page request of a user that is not the presenter of the pod. meetingId=$meetingId userId=$userId")
      state
    } else {
      val uploadPresentationId = PresentationPodsApp.generatePresentationId(BlankPageFilename)
      val target = PresentationPodsApp.getPresentationPod(state, msg.body.podId)
        .flatMap(_.getPresentation(msg.body.presentationId))

      if (!liveMeeting.presUploadRateLimiter.allow(userId, System.currentTimeMillis(),
        presUploadTokenMaxRequests, presUploadTokenWindowSec * 1000L)) {
        log.warning(s"Rejecting blank page request: request rate limit exceeded. meetingId=$meetingId userId=$userId " +
          s"limit=$presUploadTokenMaxRequests windowSec=$presUploadTokenWindowSec")
        reportRateLimited(uploadPresentationId)
        state
      } else {
        val reference = target.flatMap(t => referencePage(t, msg.body.position, msg.body.seenTotalPages))
        decideToken(insertPagesEnabled(liveMeeting), target) match {
          case Some(key) =>
            log.info(s"Refusing blank page request: $key. meetingId=$meetingId userId=$userId presentationId=${msg.body.presentationId}")
            notifyInsertPages(meetingId, userId, "error", s"app.presentation.insertPages.error.$key",
              Map("filename" -> BlankPageNameKey), bus)
            state
          case None if reference.isEmpty =>
            log.warning(s"Refusing blank page request: the target has no page. meetingId=$meetingId " +
              s"presentationId=${msg.body.presentationId}")
            notifyInsertPages(meetingId, userId, "error", s"app.presentation.insertPages.error.${ErrorKey.Failed}",
              Map("filename" -> BlankPageNameKey), bus)
            state
          case None =>
            val t = target.get
            val intent = InsertIntent(t.id, msg.body.position, msg.body.seenTotalPages, msg.body.navigate,
              PresentationInPod.getCurrentPage(t).map(_.id).getOrElse(""))

            // The progress row of the insert: no token, then converting. Both go through the same database
            // queue, in this order.
            PresPresentationDAO.insertUploadTokenIfNotExists(meetingId, userId, "", uploadPresentationId, "", BlankPageFilename)
            PresPresentationDAO.setUploadInProgress(uploadPresentationId)

            val queue = enqueue(state.insertPagesQueue, uploadPresentationId, userId, msg.body.podId,
              BlankPageNameKey, intent, InsertStage.Conversion, System.currentTimeMillis())
            sendToBbbWeb(t, intent, uploadPresentationId, reference.get)
            state.update(queue)
        }
      }
    }
  }
}
