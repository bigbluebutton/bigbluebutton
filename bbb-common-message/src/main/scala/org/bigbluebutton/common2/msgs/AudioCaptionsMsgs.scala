package org.bigbluebutton.common2.msgs

object TranscriptionProviderErrorMsg { val NAME = "TranscriptionProviderErrorMsg" }
case class TranscriptionProviderErrorMsg(header: BbbClientMsgHeader, body: TranscriptionProviderErrorMsgBody) extends StandardMsg
case class TranscriptionProviderErrorMsgBody(
    errorCode:    String,
    errorMessage: String,
)

// In messages
object UpdateTranscriptPubMsg { val NAME = "UpdateTranscriptPubMsg" }
case class UpdateTranscriptPubMsg(header: BbbClientMsgHeader, body: UpdateTranscriptPubMsgBody) extends StandardMsg
case class UpdateTranscriptPubMsgBody(
    transcriptId: String,
    start:        Int,
    end:          Int,
    text:         String,
    transcript:   String,
    locale:       String,
    result:       Boolean,
)

// Out messages
object TranscriptionProviderErrorEvtMsg { val NAME = "TranscriptionProviderErrorEvtMsg" }
case class TranscriptionProviderErrorEvtMsg(header: BbbClientMsgHeader, body: TranscriptionProviderErrorEvtMsgBody) extends BbbCoreMsg
case class TranscriptionProviderErrorEvtMsgBody(errorCode: String, errorMessage: String)

object TranscriptUpdatedEvtMsg { val NAME = "TranscriptUpdatedEvtMsg" }
case class TranscriptUpdatedEvtMsg(header: BbbClientMsgHeader, body: TranscriptUpdatedEvtMsgBody) extends BbbCoreMsg
case class TranscriptUpdatedEvtMsgBody(transcriptId: String, transcript: String, locale: String, result: Boolean)

// For recordings
object EditCaptionHistoryEvtMsg { val NAME = "EditCaptionHistoryEvtMsg" }
case class EditCaptionHistoryEvtMsg(header: BbbClientMsgHeader, body: EditCaptionHistoryEvtMsgBody) extends StandardMsg
case class EditCaptionHistoryEvtMsgBody(startIndex: Integer, endIndex: Integer, name: String, locale: String, text: String)

