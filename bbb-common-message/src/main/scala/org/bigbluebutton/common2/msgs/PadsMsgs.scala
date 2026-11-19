package org.bigbluebutton.common2.msgs

trait PadStandardMsg extends BbbCoreMsg {
  def header: BbbCoreHeaderWithMeetingId
}

// apps -> shared-notes-server
object BNSharedNotesCreateCmdMsg { val NAME = "BNSharedNotesCreateCmdMsg" }
case class BNSharedNotesCreateCmdMsg(header: BbbCoreHeaderWithMeetingId, body: BNSharedNotesCreateCmdMsgBody) extends BbbCoreMsg
case class BNSharedNotesCreateCmdMsgBody(externalId: String, model: String, initialContentJson: Vector[AnyRef], initialContentMarkdown: String = "")

// shared-notes-server -> apps
object BNSharedNotesCreatedEvtMsg { val NAME = "BNSharedNotesCreatedEvtMsg" }
case class BNSharedNotesCreatedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: BNSharedNotesCreatedEvtMsgBody) extends PadStandardMsg
case class BNSharedNotesCreatedEvtMsgBody(padId: String, externalId: String, model: String)

// shared-notes-server -> apps
object BNSharedNotesUpdatedEvtMsg { val NAME = "BNSharedNotesUpdatedEvtMsg" }
case class BNSharedNotesUpdatedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: BNSharedNotesUpdatedEvtMsgBody) extends PadStandardMsg
case class BNSharedNotesUpdatedEvtMsgBody(intUserId: String, documentName: String)

// apps -> client
object PadCreatedRespMsg { val NAME = "PadCreatedRespMsg" }
case class PadCreatedRespMsg(header: BbbClientMsgHeader, body: PadCreatedRespMsgBody) extends BbbCoreMsg
case class PadCreatedRespMsgBody(externalId: String, padId: String, name: String, sharedNotesEditor: String)

// client -> apps
object PadPinnedReqMsg { val NAME = "PadPinnedReqMsg" }
case class PadPinnedReqMsg(header: BbbClientMsgHeader, body: PadPinnedReqMsgBody) extends StandardMsg
case class PadPinnedReqMsgBody(externalId: String, pinned: Boolean)

// apps -> client
object PadPinnedEvtMsg { val NAME = "PadPinnedEvtMsg" }
case class PadPinnedEvtMsg(header: BbbClientMsgHeader, body: PadPinnedEvtMsgBody) extends BbbCoreMsg
case class PadPinnedEvtMsgBody(externalId: String, pinned: Boolean)

// apps -> shared-notes-server (BlockNote export)
object ExportBNSharedNotesEvtMsg { val NAME = "ExportBNSharedNotesEvtMsg" }
case class ExportBNSharedNotesEvtMsg(header: BbbCoreHeaderWithMeetingId, body: ExportBNSharedNotesEvtMsgBody) extends BbbCoreMsg
case class ExportBNSharedNotesEvtMsgBody(
    jobId:              String,
    presId:             String,
    serverSideFilename: String,
    parentMeetingId:    String,
    presUploadToken:    String
)
