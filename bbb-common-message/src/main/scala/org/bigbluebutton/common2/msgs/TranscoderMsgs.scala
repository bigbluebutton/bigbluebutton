package org.bigbluebutton.common2.msgs

/* In Messages  */
object StartProbingSysReqMsg { val NAME = "StartProbingSysReqMsg" }
case class StartProbingSysReqMsg(header: BbbCoreHeaderWithMeetingId, body: StartProbingSysReqMsgBody) extends BbbCoreMsg
case class StartProbingSysReqMsgBody(transcoderId: String, params: Map[String, String])

object StartTranscoderSysReqMsg { val NAME = "StartTranscoderSysReqMsg" }
case class StartTranscoderSysReqMsg(header: BbbCoreHeaderWithMeetingId, body: StartTranscoderSysReqMsgBody) extends BbbCoreMsg
case class StartTranscoderSysReqMsgBody(transcoderId: String, params: Map[String, String])

object StopTranscoderSysReqMsg { val NAME = "StopTranscoderSysReqMsg" }
case class StopTranscoderSysReqMsg(header: BbbCoreHeaderWithMeetingId, body: StopTranscoderSysReqMsgBody) extends BbbCoreMsg
case class StopTranscoderSysReqMsgBody(transcoderId: String)

object UpdateTranscoderSysReqMsg { val NAME = "UpdateTranscoderSysReqMsg" }
case class UpdateTranscoderSysReqMsg(header: BbbCoreHeaderWithMeetingId, body: UpdateTranscoderSysReqMsgBody) extends BbbCoreMsg
case class UpdateTranscoderSysReqMsgBody(transcoderId: String, params: Map[String, String])

object TranscoderStatusUpdateSysCmdMsg { val NAME = "TranscoderStatusUpdateSysCmdMsg" }
case class TranscoderStatusUpdateSysCmdMsg(header: BbbCoreHeaderWithMeetingId, body: TranscoderStatusUpdateSysCmdMsgBody) extends BbbCoreMsg
case class TranscoderStatusUpdateSysCmdMsgBody(transcoderId: String, params: Map[String, String])

object StopMeetingTranscodersSysCmdMsg { val NAME = "StopMeetingTranscodersSysCmdMsg" }
case class StopMeetingTranscodersSysCmdMsg(header: BbbCoreHeaderWithMeetingId, body: StopMeetingTranscodersSysCmdMsgBody) extends BbbCoreMsg
case class StopMeetingTranscodersSysCmdMsgBody()

/* Out Messages */
object StartProbingSysRespMsg { val NAME = "StartProbingSysRespMsg" }
case class StartProbingSysRespMsg(header: BbbCoreHeaderWithMeetingId, body: StartProbingSysRespMsgBody) extends BbbCoreMsg
case class StartProbingSysRespMsgBody(transcoderId: String, params: Map[String, String])

object StartTranscoderSysRespMsg { val NAME = "StartTranscoderSysRespMsg" }
case class StartTranscoderSysRespMsg(header: BbbCoreHeaderWithMeetingId, body: StartTranscoderSysRespMsgBody) extends BbbCoreMsg
case class StartTranscoderSysRespMsgBody(transcoderId: String, params: Map[String, String])

object StopTranscoderSysRespMsg { val NAME = "StopTranscoderSysRespMsg" }
case class StopTranscoderSysRespMsg(header: BbbCoreHeaderWithMeetingId, body: StopTranscoderSysRespMsgBody) extends BbbCoreMsg
case class StopTranscoderSysRespMsgBody(transcoderId: String)

object UpdateTranscoderSysRespMsg { val NAME = "UpdateTranscoderSysRespMsg" }
case class UpdateTranscoderSysRespMsg(header: BbbCoreHeaderWithMeetingId, body: UpdateTranscoderSysRespMsgBody) extends BbbCoreMsg
case class UpdateTranscoderSysRespMsgBody(transcoderId: String, params: Map[String, String])