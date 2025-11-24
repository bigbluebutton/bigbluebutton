package org.bigbluebutton.common2.msgs

/* In Messages  */
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

/* Out Messages */
// For recordings
object EditCaptionHistoryEvtMsg { val NAME = "EditCaptionHistoryEvtMsg" }
case class EditCaptionHistoryEvtMsg(header: BbbClientMsgHeader, body: EditCaptionHistoryEvtMsgBody) extends StandardMsg
case class EditCaptionHistoryEvtMsgBody(startIndex: Integer, endIndex: Integer, name: String, locale: String, text: String)

object AddCaptionLocaleEvtMsg { val NAME = "AddCaptionLocaleEvtMsg" }
case class AddCaptionLocaleEvtMsg(header: BbbClientMsgHeader, body: AddCaptionLocaleEvtMsgBody) extends StandardMsg
case class AddCaptionLocaleEvtMsgBody(locale: String)
