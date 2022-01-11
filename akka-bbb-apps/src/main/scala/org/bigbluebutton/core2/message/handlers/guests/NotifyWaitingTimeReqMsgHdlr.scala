package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.NotifyWaitingTimeReqMsg
import org.bigbluebutton.core.models.GuestsWaiting
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder }
import org.bigbluebutton.core.api.TimestampGenerator

trait NotifyWaitingTimeReqMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleNotifyWaitingTimeReqMsg(msg: NotifyWaitingTimeReqMsg): Unit = {

    /**
     * The current time of entrance in the guest lobby is measured now
     * and the property registeredOn is not used, since it can be misleading
     * if the user rejoins and is mapped to an old entry
     */
    val currentTime = TimestampGenerator.getCurrentTime();

    GuestsWaiting.setTimeArrivedAtTheGuestLobby(liveMeeting.guestsWaiting, msg.body.guestId, currentTime)
    val event = MsgBuilder.buildNotifyWaitingTimeRespMsg(
      liveMeeting.props.meetingProp.intId,
      msg.body.guestId,
      currentTime.toString
    )
    outGW.send(event)
  }
}
