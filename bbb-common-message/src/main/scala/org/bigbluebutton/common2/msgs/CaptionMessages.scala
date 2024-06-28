package org.bigbluebutton.common2.msgs

/* In Messages  */
object EditCaptionHistoryPubMsg { val NAME = "EditCaptionHistoryPubMsg" }
case class EditCaptionHistoryPubMsg(header: BbbClientMsgHeader, body: EditCaptionHistoryPubMsgBody) extends StandardMsg
case class EditCaptionHistoryPubMsgBody(startIndex: Integer, endIndex: Integer, name: String, locale: String, text: String)

object AddCaptionLocalePubMsg { val NAME = "AddCaptionLocalePubMsg" }
case class AddCaptionLocalePubMsg(header: BbbClientMsgHeader, body: AddCaptionLocalePubMsgBody) extends StandardMsg
case class AddCaptionLocalePubMsgBody(locale: String)

object CaptionSubmitTranscriptPubMsg { val NAME = "CaptionSubmitTranscriptPubMsg" }
case class CaptionSubmitTranscriptPubMsg(header: BbbClientMsgHeader, body: CaptionSubmitTranscriptPubMsgBody) extends StandardMsg
case class CaptionSubmitTranscriptPubMsgBody(
                                              transcriptId: String,
                                              transcript:   String,
                                              locale:       String,
                                              captionType:  String,
                                            )
object CaptionSubmitTranscriptEvtMsg { val NAME = "CaptionSubmitTranscriptEvtMsg" }
case class CaptionSubmitTranscriptEvtMsg(header: BbbClientMsgHeader, body: CaptionSubmitTranscriptEvtMsgBody) extends StandardMsg
case class CaptionSubmitTranscriptEvtMsgBody(
                                                     transcriptId: String,
                                                     transcript:   String,
                                                     locale:       String,
                                                     captionType:  String,
                                                   )
object SendCaptionHistoryReqMsg { val NAME = "SendCaptionHistoryReqMsg" }
case class SendCaptionHistoryReqMsg(header: BbbClientMsgHeader, body: SendCaptionHistoryReqMsgBody) extends StandardMsg
case class SendCaptionHistoryReqMsgBody()

/* Out Messages */
object EditCaptionHistoryEvtMsg { val NAME = "EditCaptionHistoryEvtMsg" }
case class EditCaptionHistoryEvtMsg(header: BbbClientMsgHeader, body: EditCaptionHistoryEvtMsgBody) extends StandardMsg
case class EditCaptionHistoryEvtMsgBody(startIndex: Integer, endIndex: Integer, name: String, locale: String, text: String)

object AddCaptionLocaleEvtMsg { val NAME = "AddCaptionLocaleEvtMsg" }
case class AddCaptionLocaleEvtMsg(header: BbbClientMsgHeader, body: AddCaptionLocaleEvtMsgBody) extends StandardMsg
case class AddCaptionLocaleEvtMsgBody(locale: String)

object SendCaptionHistoryRespMsg { val NAME = "SendCaptionHistoryRespMsg" }
case class SendCaptionHistoryRespMsg(header: BbbClientMsgHeader, body: SendCaptionHistoryRespMsgBody) extends StandardMsg
case class SendCaptionHistoryRespMsgBody(history: Map[String, TranscriptVO])

case class TranscriptVO(ownerId: String, text: String, locale: String)
