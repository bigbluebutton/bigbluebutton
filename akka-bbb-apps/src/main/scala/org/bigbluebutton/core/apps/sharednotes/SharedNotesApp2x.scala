package org.bigbluebutton.core.apps.sharednotes

import akka.actor.ActorContext
import akka.event.Logging

class SharedNotesApp2x(implicit val context: ActorContext)
    extends GetSharedNotesPubMsgHdlr
    with SyncSharedNotePubMsgHdlr
    with ClearSharedNotePubMsgHdlr
    with UpdateSharedNoteReqMsgHdlr
    with CreateSharedNoteReqMsgHdlr
    with DestroySharedNoteReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
