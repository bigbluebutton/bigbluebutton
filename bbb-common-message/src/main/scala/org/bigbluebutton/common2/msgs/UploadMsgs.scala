package org.bigbluebutton.common2.msgs

// client to akka-apps
object UploadRequestReqMsg { val NAME = "UploadRequestReqMsg" }
case class UploadRequestReqMsg(header: BbbClientMsgHeader, body: UploadRequestReqMsgBody) extends StandardMsg
case class UploadRequestReqMsgBody(source: String, filename: String, timestamp: Long)

// akka-apps to client
object UploadRequestRespMsg { val NAME = "UploadRequestRespMsg" }
case class UploadRequestRespMsg(header: BbbClientMsgHeader, body: UploadRequestRespMsgBody) extends StandardMsg
case class UploadRequestRespMsgBody(source: String, filename: String, userId: String, success: Boolean, timestamp: Long, token: String = null)

object FileUploadedEvtMsg { val NAME = "FileUploadedEvtMsg" }
case class FileUploadedEvtMsg(header: BbbClientMsgHeader, body: FileUploadedEvtMsgBody) extends StandardMsg
case class FileUploadedEvtMsgBody(uploadId: String, source: String, filename: String)

// akka-apps to bbb-web
object UploadRequestSysMsg { val NAME = "UploadRequestSysMsg" }
case class UploadRequestSysMsg(header: BbbCoreHeaderWithMeetingId, body: UploadRequestSysMsgBody) extends BbbCoreMsg
case class UploadRequestSysMsgBody(source: String, filename: String, userId: String, token: String)

// bbb-web to akka-apps
object FileUploadedSysMsg { val NAME = "FileUploadedSysMsg" }
case class FileUploadedSysMsg(header: BbbClientMsgHeader, body: FileUploadedSysMsgBody) extends StandardMsg
case class FileUploadedSysMsgBody(uploadId: String, source: String, filename: String, contentType: String)
