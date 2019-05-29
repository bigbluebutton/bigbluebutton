package org.bigbluebutton.common2.msgs

import scala.collection.immutable.List

case class Note(
    name:         String,
    document:     String,
    patchCounter: Int,
    undoPatches:  List[(String, String)],
    redoPatches:  List[(String, String)]
)

case class NoteReport(
    name:         String,
    document:     String,
    patchCounter: Int,
    undo:         Boolean,
    redo:         Boolean
)

/* In Messages  */
object GetSharedNotesPubMsg { val NAME = "GetSharedNotesPubMsg" }
case class GetSharedNotesPubMsg(header: BbbClientMsgHeader, body: GetSharedNotesPubMsgBody) extends StandardMsg
case class GetSharedNotesPubMsgBody()

object SyncSharedNotePubMsg { val NAME = "SyncSharedNotePubMsg" }
case class SyncSharedNotePubMsg(header: BbbClientMsgHeader, body: SyncSharedNotePubMsgBody) extends StandardMsg
case class SyncSharedNotePubMsgBody(noteId: String)

object UpdateSharedNoteReqMsg { val NAME = "UpdateSharedNoteReqMsg" }
case class UpdateSharedNoteReqMsg(header: BbbClientMsgHeader, body: UpdateSharedNoteReqMsgBody) extends StandardMsg
case class UpdateSharedNoteReqMsgBody(noteId: String, patch: String, operation: String)

object ClearSharedNotePubMsg { val NAME = "ClearSharedNotePubMsg" }
case class ClearSharedNotePubMsg(header: BbbClientMsgHeader, body: ClearSharedNotePubMsgBody) extends StandardMsg
case class ClearSharedNotePubMsgBody(noteId: String)

object CreateSharedNoteReqMsg { val NAME = "CreateSharedNoteReqMsg" }
case class CreateSharedNoteReqMsg(header: BbbClientMsgHeader, body: CreateSharedNoteReqMsgBody) extends StandardMsg
case class CreateSharedNoteReqMsgBody(noteName: String)

object DestroySharedNoteReqMsg { val NAME = "DestroySharedNoteReqMsg" }
case class DestroySharedNoteReqMsg(header: BbbClientMsgHeader, body: DestroySharedNoteReqMsgBody) extends StandardMsg
case class DestroySharedNoteReqMsgBody(noteId: String)

/* Out Messages */
object GetSharedNotesEvtMsg { val NAME = "GetSharedNotesEvtMsg" }
case class GetSharedNotesEvtMsg(header: BbbClientMsgHeader, body: GetSharedNotesEvtMsgBody) extends StandardMsg
case class GetSharedNotesEvtMsgBody(notesReport: Map[String, NoteReport], isNotesLimit: Boolean)

object SyncSharedNoteEvtMsg { val NAME = "SyncSharedNoteEvtMsg" }
case class SyncSharedNoteEvtMsg(header: BbbClientMsgHeader, body: SyncSharedNoteEvtMsgBody) extends StandardMsg
case class SyncSharedNoteEvtMsgBody(noteId: String, noteReport: NoteReport)

object UpdateSharedNoteRespMsg { val NAME = "UpdateSharedNoteRespMsg" }
case class UpdateSharedNoteRespMsg(header: BbbClientMsgHeader, body: UpdateSharedNoteRespMsgBody) extends StandardMsg
case class UpdateSharedNoteRespMsgBody(noteId: String, patch: String, patchId: Int, undo: Boolean, redo: Boolean)

object CreateSharedNoteRespMsg { val NAME = "CreateSharedNoteRespMsg" }
case class CreateSharedNoteRespMsg(header: BbbClientMsgHeader, body: CreateSharedNoteRespMsgBody) extends StandardMsg
case class CreateSharedNoteRespMsgBody(noteId: String, noteName: String, isNotesLimit: Boolean)

object DestroySharedNoteRespMsg { val NAME = "DestroySharedNoteRespMsg" }
case class DestroySharedNoteRespMsg(header: BbbClientMsgHeader, body: DestroySharedNoteRespMsgBody) extends StandardMsg
case class DestroySharedNoteRespMsgBody(noteId: String, isNotesLimit: Boolean)