package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationUploadedFileTooLargeErrorPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg: PresentationUploadedFileTooLargeErrorSysPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastEvent(msg: PresentationUploadedFileTooLargeErrorSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationUploadedFileTooLargeErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationUploadedFileTooLargeErrorEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PresentationUploadedFileTooLargeErrorEvtMsgBody(msg.body.podId, msg.body.messageKey, msg.body.code, msg.body.presentationName, msg.body.presentationToken, msg.body.fileSize, msg.body.maxFileSize)
      val event = PresentationUploadedFileTooLargeErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val errorDetails = scala.collection.immutable.Map(
      "maxFileSize" -> msg.body.maxFileSize.toString,
      "actualFileSize" -> msg.body.fileSize.toString
    )

    // A document inserted through the API has no row until its conversion starts, and one refused for
    // its size never gets there, so a plain UPDATE would record nothing. Insert the row with its reason
    // (a no-op when the client's upload path already created it from the upload token), then record the
    // error on the row that exists.
    PresPresentationDAO.insertRejectedUpload(
      liveMeeting.props.meetingProp.intId, "", "", msg.body.presentationId, msg.body.presentationName,
      msg.body.messageKey, errorDetails
    )
    PresPresentationDAO.updateErrors(msg.body.presentationId, msg.body.messageKey, errorDetails)
    broadcastEvent(msg)
    state
  }
}
