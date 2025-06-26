package org.bigbluebutton.core.apps.timer

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import scala.concurrent.duration._
import org.apache.pekko.actor.{ ActorSystem, Cancellable }
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.TimerModel
import org.bigbluebutton.core.db.TimerDAO

class TimerApp2x(implicit val context: ActorContext)
  extends ActivateTimerReqMsgHdlr
  with DeactivateTimerReqMsgHdlr
  with StartTimerReqMsgHdlr
  with StopTimerReqMsgHdlr
  with SwitchTimerReqMsgHdlr
  with SetTimerReqMsgHdlr
  with ResetTimerReqMsgHdlr
  with SetTrackReqMsgHdlr {

  val log = Logging(context.system, getClass)

  implicit val system: ActorSystem = context.system
  private var timerCheckTask: Option[Cancellable] = None
  import scala.concurrent.ExecutionContext
  implicit val ec: ExecutionContext = system.dispatcher

  def startTimerCheck(liveMeeting: LiveMeeting): Unit = {
    timerCheckTask.foreach(_.cancel())
    if (TimerModel.isStopwatch(liveMeeting.timerModel)) return
    timerCheckTask = Some(system.scheduler.scheduleAtFixedRate(
      initialDelay = 0.seconds,
      interval = 1.second
    )(() => checkAndBroadcastTimer(liveMeeting)))
  }

  private def checkAndBroadcastTimer(liveMeeting: LiveMeeting): Unit = {
    val timerModel = liveMeeting.timerModel
    if (TimerModel.isRunning(timerModel)) {
      if (TimerModel.resetTimerIfFinished(timerModel)) {
        TimerDAO.update(liveMeeting.props.meetingProp.intId, timerModel)
        stopTimerCheck()
      }
    }
  }

  def stopTimerCheck(): Unit = {
    timerCheckTask.foreach(_.cancel())
    timerCheckTask = None
  }
}
