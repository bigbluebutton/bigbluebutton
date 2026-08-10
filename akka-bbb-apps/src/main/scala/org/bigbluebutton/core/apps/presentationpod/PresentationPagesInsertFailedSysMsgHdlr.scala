package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ NotificationDAO, PresPresentationDAO }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.Roles
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait PresentationPagesInsertFailedSysMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg:         PresentationPagesInsertFailedSysMsg,
      state:       MeetingState2x,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): MeetingState2x = {

    val meetingId = liveMeeting.props.meetingProp.intId
    val insertPresId = msg.body.insertPresentationId

    // The splice failed after conversion, so the transient insert presentation would otherwise
    // linger forever (it is never surfaced as its own presentation). Drop it from pod state and
    // DB, and tell the meeting the insert failed.
    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      insertPres <- pod.getPresentation(insertPresId)
    } yield {
      PresPresentationDAO.delete(meetingId, insertPresId)

      val notifyEvent = MsgBuilder.buildNotifyRoleInMeetingEvtMsg(
        Roles.PRESENTER_ROLE,
        meetingId,
        "error",
        "presentation",
        "app.presentation.insertPagesFailedNotification",
        "Notification when inserting pages into a presentation fails",
        // insertRequestId is not rendered in the message: it is carried so the client that
        // requested this insert can tell this failure apart from a concurrent one, since the
        // notification goes out to every presenter in the meeting.
        Map(
          "presentationName" -> insertPres.name,
          "insertRequestId" -> msg.body.insertRequestId
        )
      )
      bus.outGW.send(notifyEvent)
      NotificationDAO.insert(notifyEvent)

      state.update(state.presentationPodManager.removePresentationInPod(pod.id, insertPresId))
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}
