package org.bigbluebutton.common2.msgs

// In messages
object UpdateTranscriptPubMsg { val NAME = "UpdateTranscriptPubMsg" }
case class UpdateTranscriptPubMsg(header: BbbClientMsgHeader, body: UpdateTranscriptPubMsgBody) extends StandardMsg
case class UpdateTranscriptPubMsgBody(
    transcriptId: String,
    start:        Int,
    end:          Int,
    text:         String,
    transcript:   String,
    locale:       String
)

// Out messages
object TranscriptUpdatedEvtMsg { val NAME = "TranscriptUpdatedEvtMsg" }
case class TranscriptUpdatedEvtMsg(header: BbbClientMsgHeader, body: TranscriptUpdatedEvtMsgBody) extends BbbCoreMsg
case class TranscriptUpdatedEvtMsgBody(transcriptId: String, transcript: String, locale: String)
