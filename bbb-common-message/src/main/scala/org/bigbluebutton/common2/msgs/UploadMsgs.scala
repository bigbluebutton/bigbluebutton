package org.bigbluebutton.common2.msgs

object UploadRequestReqMsg { val NAME = "UploadRequestReqMsg" }
case class UploadRequestReqMsg(header: BbbClientMsgHeader, body: UploadRequestReqMsgBody) extends StandardMsg
case class UploadRequestReqMsgBody(source: String, filename: String)

object UploadRequestRespMsg { val NAME = "UploadRequestRespMsg" }
case class UploadRequestRespMsg(header: BbbClientMsgHeader, body: UploadRequestRespMsgBody) extends StandardMsg
case class UploadRequestRespMsgBody(source: String, filename: String, userId: String, success: Boolean, token: String = null)

object UploadRequestSysMsg { val NAME = "UploadRequestSysMsg" }
case class UploadRequestSysMsg(header: BbbCoreHeaderWithMeetingId, body: UploadRequestSysMsgBody) extends BbbCoreMsg
case class UploadRequestSysMsgBody(source: String, filename: String, userId: String, token: String)
