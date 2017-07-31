package org.bigbluebutton.core2

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil

object AnalyticsActor {
  def props(): Props = Props(classOf[AnalyticsActor])
}

class AnalyticsActor extends Actor with ActorLogging {

  val TAG = "-- analytics -- "

  def receive = {
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case _                        => log.warning("Cannot handle message ")
  }

  def logMessage(msg: BbbCommonEnvCoreMsg): Unit = {
    val json = JsonUtil.toJson(msg)
    log.info(TAG + json)
  }

  def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {

    msg.core match {
      case m: DisconnectAllClientsSysMsg =>
        logMessage(msg)
      case m: DisconnectClientSysMsg =>
        logMessage(msg)
      case m: MeetingEndingEvtMsg =>
        logMessage(msg)
      case m: MeetingCreatedEvtMsg =>
        logMessage(msg)
      case m: LogoutAndEndMeetingCmdMsg =>
        logMessage(msg)
      case _ => // ignore message
    }
  }
}
