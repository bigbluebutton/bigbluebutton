package org.bigbluebutton.common2.msgs

/* Sent straight to redis to look up a user's info  */
object LookUpUserReqMsg {val NAME = "LookUpUserReqMsg"}
case class LookUpUserReqMsg(header: BbbCoreHeaderWithMeetingId, body: LookUpUserReqMsgBody) extends BbbCoreMsg
case class LookUpUserReqMsgBody(externalUserId: String)

object LookUpUserRespMsg {val NAME = "LookUpUserRespMsg"}
case class LookUpUserRespMsg(header: BbbCoreHeaderWithMeetingId, body: LookUpUserRespMsgBody) extends BbbCoreMsg
case class LookUpUserRespMsgBody(userInfo: scala.collection.immutable.List[scala.collection.immutable.Map[String, Any]])
/* ************************ */