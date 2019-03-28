package org.bigbluebutton.common2.msgs

/* In Messages  */
object EditCaptionHistoryPubMsg { val NAME = "EditCaptionHistoryPubMsg" }
case class EditCaptionHistoryPubMsg(header: BbbClientMsgHeader, body: EditCaptionHistoryPubMsgBody) extends StandardMsg
case class EditCaptionHistoryPubMsgBody(startIndex: Integer, endIndex: Integer, locale: String, localeCode: String, text: String)

object UpdateCaptionOwnerPubMsg { val NAME = "UpdateCaptionOwnerPubMsg" }
case class UpdateCaptionOwnerPubMsg(header: BbbClientMsgHeader, body: UpdateCaptionOwnerPubMsgBody) extends StandardMsg
case class UpdateCaptionOwnerPubMsgBody(locale: String, localeCode: String, ownerId: String)

object SendCaptionHistoryReqMsg { val NAME = "SendCaptionHistoryReqMsg" }
case class SendCaptionHistoryReqMsg(header: BbbClientMsgHeader, body: SendCaptionHistoryReqMsgBody) extends StandardMsg
case class SendCaptionHistoryReqMsgBody()

/* Out Messages */
object EditCaptionHistoryEvtMsg { val NAME = "EditCaptionHistoryEvtMsg" }
case class EditCaptionHistoryEvtMsg(header: BbbClientMsgHeader, body: EditCaptionHistoryEvtMsgBody) extends StandardMsg
case class EditCaptionHistoryEvtMsgBody(startIndex: Integer, endIndex: Integer, locale: String, localeCode: String, text: String)

object UpdateCaptionOwnerEvtMsg { val NAME = "UpdateCaptionOwnerEvtMsg" }
case class UpdateCaptionOwnerEvtMsg(header: BbbClientMsgHeader, body: UpdateCaptionOwnerEvtMsgBody) extends StandardMsg
case class UpdateCaptionOwnerEvtMsgBody(locale: String, localeCode: String, ownerId: String)

object SendCaptionHistoryRespMsg { val NAME = "SendCaptionHistoryRespMsg" }
case class SendCaptionHistoryRespMsg(header: BbbClientMsgHeader, body: SendCaptionHistoryRespMsgBody) extends StandardMsg
case class SendCaptionHistoryRespMsgBody(history: Map[String, TranscriptVO])

case class TranscriptVO(ownerId: String, text: String, localeCode: String)