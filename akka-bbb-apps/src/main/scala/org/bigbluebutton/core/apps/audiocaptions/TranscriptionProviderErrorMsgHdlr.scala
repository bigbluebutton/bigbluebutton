package org.bigbluebutton.core.apps.audiocaptions

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.UserTranscriptionErrorDAO
import org.bigbluebutton.core.models.AudioCaptions
import org.bigbluebutton.core.running.LiveMeeting

trait TranscriptionProviderErrorMsgHdlr {
  this: AudioCaptionsApp2x =>

  def handleTranscriptionProviderErrorMsg(msg: TranscriptionProviderErrorMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(userId: String, errorCode: String, errorMessage: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(TranscriptionProviderErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(TranscriptionProviderErrorEvtMsg.NAME, meetingId, userId)
      val body = TranscriptionProviderErrorEvtMsgBody(errorCode, errorMessage)
      val event = TranscriptionProviderErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    // "user_transcriptionError"."errorCode" is varchar(255)
    val errorCode = msg.body.errorCode.take(255)
    val errorMessage = msg.body.errorMessage.take(1024)

    broadcastEvent(msg.header.userId, errorCode, errorMessage)

    UserTranscriptionErrorDAO.insert(msg.header.userId, msg.header.meetingId, errorCode, errorMessage)

  }
}
