package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.SharedNotesRevDAO
import org.bigbluebutton.core.running.LiveMeeting

trait BNSharedNotesUpdatedEvtMsgHdlr {
  this: PadsApp2x =>

  def handle(msg: BNSharedNotesUpdatedEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    SharedNotesRevDAO.insertNextRev(liveMeeting.props.meetingProp.intId, "notes", msg.body.userId)
  }
}

