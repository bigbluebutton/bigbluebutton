package org.bigbluebutton.core.apps.pads

import org.apache.pekko.actor.ActorContext
import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, PadPinnedEvtMsg, PadPinnedEvtMsgBody }
import org.bigbluebutton.core.db.{ NotificationDAO, SharedNotesDAO }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

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

    // Send notification to all users when notes are pinned
    if (pinned) {
      val notifyEvent = MsgBuilder.buildNotifyAllInMeetingEvtMsg(
        liveMeeting.props.meetingProp.intId,
        "info",
        "copy",
        "app.notes.pinnedNotification",
        "Notification text for pinned shared notes",
        Map()
      )
      outGW.send(notifyEvent)
      NotificationDAO.insert(notifyEvent)
    }
  }
}

class PadsApp2x(implicit val context: ActorContext)
  extends BNSharedNotesCreatedEvtMsgHdlr
  with BNSharedNotesUpdatedEvtMsgHdlr
  // TODO(4.1 etherpad removal, #25720): drop once bbb-transcription-controller is confirmed not to publish PadUpdatePubMsg
  with PadUpdatePubMsgHdlr
  with PadPinnedReqMsgHdlr {
}
