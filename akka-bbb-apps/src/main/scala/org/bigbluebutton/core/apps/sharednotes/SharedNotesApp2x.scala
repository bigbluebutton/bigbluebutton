package org.bigbluebutton.core.apps.sharednotes

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.LiveMeeting

class SharedNotesApp2x(val liveMeeting: LiveMeeting,
  val outGW: OutMessageGateway)(implicit val context: ActorContext)
    extends GetSharedNotesPubMsgHdlr
    with SyncSharedNotePubMsgHdlr
    with UpdateSharedNoteReqMsgHdlr
    with CreateSharedNoteReqMsgHdlr
    with DestroySharedNoteReqMsgHdlr {

  val log = Logging(context.system, getClass)
}