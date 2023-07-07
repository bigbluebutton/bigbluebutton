package org.bigbluebutton.core.apps.timer

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ RightsManagementTrait, TimerModel }
import org.bigbluebutton.core.db.TimerDAO

trait TimerEndedPubMsgHdlr extends RightsManagementTrait {
  this: TimerApp2x =>

  def handle(msg: TimerEndedPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received timerEndedPubMsg {}", TimerEndedPubMsg)
    def broadcastEvent(): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(TimerEndedEvtMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        TimerEndedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = TimerEndedEvtMsgBody()
      val event = TimerEndedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    TimerModel.setEndedAt(liveMeeting.timerModel, System.currentTimeMillis())
    TimerDAO.update(liveMeeting.props.meetingProp.intId, liveMeeting.timerModel)
    broadcastEvent()
  }
}
