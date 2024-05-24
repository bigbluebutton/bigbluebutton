package org.bigbluebutton.common2.msgs

trait PadStandardMsg extends BbbCoreMsg {
  def header: BbbCoreHeaderWithMeetingId
}

// apps -> pads
object PadCreateGroupCmdMsg { val NAME = "PadCreateGroupCmdMsg" }
case class PadCreateGroupCmdMsg(header: BbbCoreHeaderWithMeetingId, body: PadCreateGroupCmdMsgBody) extends BbbCoreMsg
case class PadCreateGroupCmdMsgBody(externalId: String, model: String)

// pads -> apps
object PadGroupCreatedEvtMsg { val NAME = "PadGroupCreatedEvtMsg" }
case class PadGroupCreatedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: PadGroupCreatedEvtMsgBody) extends PadStandardMsg
case class PadGroupCreatedEvtMsgBody(externalId: String, groupId: String)

// apps -> client
object PadGroupCreatedRespMsg { val NAME = "PadGroupCreatedRespMsg" }
case class PadGroupCreatedRespMsg(header: BbbClientMsgHeader, body: PadGroupCreatedRespMsgBody) extends BbbCoreMsg
case class PadGroupCreatedRespMsgBody(externalId: String, model: String, name: String)

// client -> apps
object PadCreateReqMsg { val NAME = "PadCreateReqMsg" }
case class PadCreateReqMsg(header: BbbClientMsgHeader, body: PadCreateReqMsgBody) extends StandardMsg
case class PadCreateReqMsgBody(externalId: String, name: String)

// apps -> pads
object PadCreateCmdMsg { val NAME = "PadCreateCmdMsg" }
case class PadCreateCmdMsg(header: BbbCoreHeaderWithMeetingId, body: PadCreateCmdMsgBody) extends BbbCoreMsg
case class PadCreateCmdMsgBody(groupId: String, name: String)

// pads -> apps
object PadCreatedEvtMsg { val NAME = "PadCreatedEvtMsg" }
case class PadCreatedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: PadCreatedEvtMsgBody) extends PadStandardMsg
case class PadCreatedEvtMsgBody(groupId: String, padId: String, name: String)

// apps -> client
object PadCreatedRespMsg { val NAME = "PadCreatedRespMsg" }
case class PadCreatedRespMsg(header: BbbClientMsgHeader, body: PadCreatedRespMsgBody) extends BbbCoreMsg
case class PadCreatedRespMsgBody(externalId: String, padId: String, name: String)

// client -> apps
object PadCreateSessionReqMsg { val NAME = "PadCreateSessionReqMsg" }
case class PadCreateSessionReqMsg(header: BbbClientMsgHeader, body: PadCreateSessionReqMsgBody) extends StandardMsg
case class PadCreateSessionReqMsgBody(externalId: String)

// apps -> pads
object PadCreateSessionCmdMsg { val NAME = "PadCreateSessionCmdMsg" }
case class PadCreateSessionCmdMsg(header: BbbCoreHeaderWithMeetingId, body: PadCreateSessionCmdMsgBody) extends BbbCoreMsg
case class PadCreateSessionCmdMsgBody(groupId: String, userId: String)

// pads -> apps
object PadSessionCreatedEvtMsg { val NAME = "PadSessionCreatedEvtMsg" }
case class PadSessionCreatedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: PadSessionCreatedEvtMsgBody) extends PadStandardMsg
case class PadSessionCreatedEvtMsgBody(groupId: String, userId: String, sessionId: String)

// apps -> client
object PadSessionCreatedRespMsg { val NAME = "PadSessionCreatedRespMsg" }
case class PadSessionCreatedRespMsg(header: BbbClientMsgHeader, body: PadSessionCreatedRespMsgBody) extends BbbCoreMsg
case class PadSessionCreatedRespMsgBody(externalId: String, sessionId: String)

// pads -> apps
object PadSessionDeletedSysMsg { val NAME = "PadSessionDeletedSysMsg" }
case class PadSessionDeletedSysMsg(header: BbbCoreHeaderWithMeetingId, body: PadSessionDeletedSysMsgBody) extends PadStandardMsg
case class PadSessionDeletedSysMsgBody(groupId: String, userId: String, sessionId: String)

// apps -> client
object PadSessionDeletedEvtMsg { val NAME = "PadSessionDeletedEvtMsg" }
case class PadSessionDeletedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: PadSessionDeletedEvtMsgBody) extends BbbCoreMsg
case class PadSessionDeletedEvtMsgBody(externalId: String, userId: String, sessionId: String)

// pads -> apps
object PadUpdatedSysMsg { val NAME = "PadUpdatedSysMsg" }
case class PadUpdatedSysMsg(header: BbbCoreHeaderWithMeetingId, body: PadUpdatedSysMsgBody) extends PadStandardMsg
case class PadUpdatedSysMsgBody(groupId: String, padId: String, userId: String, rev: Int, changeset: String)

// apps -> client
object PadUpdatedEvtMsg { val NAME = "PadUpdatedEvtMsg" }
case class PadUpdatedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: PadUpdatedEvtMsgBody) extends BbbCoreMsg
case class PadUpdatedEvtMsgBody(externalId: String, padId: String, userId: String, rev: Int, changeset: String)

// pads -> apps
object PadContentSysMsg { val NAME = "PadContentSysMsg" }
case class PadContentSysMsg(header: BbbCoreHeaderWithMeetingId, body: PadContentSysMsgBody) extends PadStandardMsg
case class PadContentSysMsgBody(groupId: String, padId: String, rev: String, start: Int, end: Int, text: String)

// apps -> client
object PadContentEvtMsg { val NAME = "PadContentEvtMsg" }
case class PadContentEvtMsg(header: BbbCoreHeaderWithMeetingId, body: PadContentEvtMsgBody) extends BbbCoreMsg
case class PadContentEvtMsgBody(externalId: String, padId: String, rev: String, start: Int, end: Int, text: String)

// apps -> client
object PadTailEvtMsg { val NAME = "PadTailEvtMsg" }
case class PadTailEvtMsg(header: BbbCoreHeaderWithMeetingId, body: PadTailEvtMsgBody) extends BbbCoreMsg
case class PadTailEvtMsgBody(externalId: String, tail: String)

// client -> apps
object PadUpdatePubMsg { val NAME = "PadUpdatePubMsg" }
case class PadUpdatePubMsg(header: BbbClientMsgHeader, body: PadUpdatePubMsgBody) extends StandardMsg
case class PadUpdatePubMsgBody(externalId: String, text: String, transcript: Boolean)

// apps -> pads
object PadUpdateCmdMsg { val NAME = "PadUpdateCmdMsg" }
case class PadUpdateCmdMsg(header: BbbCoreHeaderWithMeetingId, body: PadUpdateCmdMsgBody) extends BbbCoreMsg
case class PadUpdateCmdMsgBody(groupId: String, name: String, text: String)

// pads -> apps
object PadCapturePubMsg { val NAME = "PadCapturePubMsg" }
case class PadCapturePubMsg(header: BbbCoreHeaderWithMeetingId, body: PadCapturePubMsgBody) extends PadStandardMsg
case class PadCapturePubMsgBody(parentMeetingId: String, breakoutId: String, padId: String, filename: String)

// client -> apps
object PadPinnedReqMsg { val NAME = "PadPinnedReqMsg" }
case class PadPinnedReqMsg(header: BbbClientMsgHeader, body: PadPinnedReqMsgBody) extends StandardMsg
case class PadPinnedReqMsgBody(externalId: String, pinned: Boolean)

// apps -> client
object PadPinnedEvtMsg { val NAME = "PadPinnedEvtMsg" }
case class PadPinnedEvtMsg(header: BbbClientMsgHeader, body: PadPinnedEvtMsgBody) extends BbbCoreMsg
case class PadPinnedEvtMsgBody(externalId: String, pinned: Boolean)
