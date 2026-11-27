package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.db.NotificationDAO
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

object LayoutHdlrHelpers {

  // Same confirmation push layout gives, for the Layout view options that apply to everyone.
  def notifyLayoutUpdate(userId: String, liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
    val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
      userId,
      liveMeeting.props.meetingProp.intId,
      "info",
      "user",
      "app.layoutUpdate.label",
      "Notification to when the layout view options change for everyone",
      Map()
    )
    outGW.send(notifyEvent)
    NotificationDAO.insert(notifyEvent)
  }

  def clampPresentationVideoRate(rate: Double): Double = {
    if (java.lang.Double.isFinite(rate)) {
      Math.max(0, Math.min(rate, 1))
    } else {
      0
    }
  }
}
