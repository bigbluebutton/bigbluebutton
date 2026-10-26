package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationPageConversionStartedSysMsgHdlr extends SystemConfiguration {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationPageConversionStartedSysMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(msg: PresentationPageConversionStartedSysMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationPageConversionStartedSysMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationPageConversionStartedSysMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PresentationPageConversionStartedSysMsgBody(
        podId = msg.body.podId,
        presentationId = msg.body.presentationId,
        current = msg.body.current,
        default = msg.body.default,
        presName = msg.body.presName,
        presFilenameConverted = msg.body.presFilenameConverted,
        downloadable = msg.body.downloadable,
        removable = msg.body.removable,
        authzToken = msg.body.authzToken,
        numPages = msg.body.numPages,
        systemUpload = msg.body.systemUpload
      )
      val event = PresentationPageConversionStartedSysMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    // Tell bbb-web the presentation will not be added to a pod, so it stops converting it
    // and deletes its files.
    def sendConversionRejected(reason: String): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PresentationConversionRejectedSysMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationConversionRejectedSysMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val body = PresentationConversionRejectedSysMsgBody(
        meetingId = liveMeeting.props.meetingProp.intId,
        podId = msg.body.podId,
        presentationId = msg.body.presentationId,
        reason = reason
      )
      val event = PresentationConversionRejectedSysMsg(header, body)
      bus.outGW.send(BbbCommonEnvCoreMsg(envelope, event))
    }

    val downloadable = msg.body.downloadable
    val removable = msg.body.removable
    val presentationId = msg.body.presentationId
    val podId = msg.body.podId
    val meetingId = liveMeeting.props.meetingProp.intId
    val maxPerPod = PresentationPodsApp.maxPresentationsPerPodFor(msg.body.systemUpload, presMaxPerPod)

    val pres = new PresentationInPod(presentationId, msg.body.presName, msg.body.default, msg.body.current, Map.empty, downloadable,
      "", removable, filenameConverted = msg.body.presFilenameConverted, uploadCompleted = false, numPages = msg.body.numPages, errorDetails = Map.empty)

    PresentationPodsApp.getPresentationPod(state, podId) match {
      // Removed before its conversion started: do not bring it back.
      case _ if liveMeeting.droppedPresentations.contains(presentationId) =>
        log.info("Not adding presentation that was already removed. " +
          s"meetingId=$meetingId podId=$podId presentationId=$presentationId")
        sendConversionRejected("PRESENTATION_REMOVED")
        state

      // Already in the pod: a repeated start. Re-adding would replace it with an empty
      // presentation and reset its row, so leave it as it is.
      case Some(pod) if pod.getPresentation(presentationId).isDefined =>
        log.info("Ignoring repeated conversion start for presentation already in pod. " +
          s"meetingId=$meetingId podId=$podId presentationId=$presentationId")
        state

      // Bounds the akka pod map. 0 disables the cap.
      case Some(pod) if PresentationPodsApp.podIsFullFor(pod, presentationId, maxPerPod) =>
        log.warning("Rejecting presentation: pod presentation limit reached. " +
          s"meetingId=$meetingId userId=${msg.header.userId} podId=$podId " +
          s"count=${pod.getPresentationsSize()} limit=$maxPerPod presentationId=$presentationId")

        // Not added to the pod, so it does not occupy a slot. Record the error on the row
        // instead; the insert is a no-op when a row already exists.
        PresPresentationDAO.insertUploadTokenIfNotExists(
          meetingId, "", "", presentationId, "", msg.body.presName
        )
        PresPresentationDAO.updateErrors(
          presentationId,
          "PRESENTATION_UPLOAD_POD_LIMIT_REACHED",
          Map("maxPresentationsPerPod" -> maxPerPod.toString)
        )

        liveMeeting.droppedPresentations.add(presentationId)
        sendConversionRejected("PRESENTATION_UPLOAD_POD_LIMIT_REACHED")

        // Drop any conversion tracker entry for this presentation.
        state.update(state.presentationConversions.remove(presentationId))

      case Some(pod) =>
        var pods = state.presentationPodManager.addPod(pod)
        pods = pods.addPresentationToPod(pod.id, pres)
        if (msg.body.current) {
          pods = pods.setCurrentPresentation(pod.id, pres)
        }
        val ns = state.update(pods)

        PresPresentationDAO.updateConversionStarted(meetingId, pres)
        broadcastEvent(msg)
        ns

      case None =>
        log.warning("Rejecting presentation: unknown presentation pod. " +
          s"meetingId=$meetingId podId=$podId presentationId=$presentationId")

        PresPresentationDAO.insertUploadTokenIfNotExists(
          meetingId, "", "", presentationId, "", msg.body.presName
        )
        PresPresentationDAO.updateErrors(
          presentationId,
          "PRESENTATION_UPLOAD_UNKNOWN_POD",
          Map.empty
        )

        liveMeeting.droppedPresentations.add(presentationId)
        sendConversionRejected("PRESENTATION_UPLOAD_UNKNOWN_POD")

        state
    }

  }
}
