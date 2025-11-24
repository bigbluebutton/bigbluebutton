package org.bigbluebutton.core.apps.pads

import org.apache.pekko.actor.ActorContext
import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, PadPinnedEvtMsg, PadPinnedEvtMsgBody }
import org.bigbluebutton.core.db.SharedNotesDAO
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

object PadsApp2x {
  def setPinned(outGW: OutMsgRouter, liveMeeting: LiveMeeting, sharedNotesExtId: String, pinned: Boolean): Unit = {

    def broadcastEvent(groupId: String, pinned: Boolean): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(PadPinnedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(PadPinnedEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")
      val body = PadPinnedEvtMsgBody(groupId, pinned)
      val event = PadPinnedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    SharedNotesDAO.updatePinned(liveMeeting.props.meetingProp.intId, sharedNotesExtId, pinned)
    broadcastEvent(sharedNotesExtId, pinned)
  }
}

class PadsApp2x(implicit val context: ActorContext)
  extends PadGroupCreatedEvtMsgHdlr
  with PadCreateReqMsgHdlr
  with PadCreatedEvtMsgHdlr
  with PadCreateSessionReqMsgHdlr
  with PadSessionCreatedEvtMsgHdlr
  with PadSessionDeletedSysMsgHdlr
  with PadUpdatedSysMsgHdlr
  with PadContentSysMsgHdlr
  with PadUpdatePubMsgHdlr
  with PadPinnedReqMsgHdlr {
}
