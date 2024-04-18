package org.bigbluebutton.core.apps.users

import org.bigbluebutton.ClientSettings.{ getConfigPropertyValueByPathAsListOfIntOrElse, getConfigPropertyValueByPathAsListOfStringOrElse }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.db.UserConnectionStatusDAO
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait UserConnectionAliveReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserConnectionAliveReqMsg(msg: UserConnectionAliveReqMsg): Unit = {
    log.info("handleUserConnectionAliveReqMsg: networkRttInMs={} userId={}", msg.body.networkRttInMs, msg.body.userId)

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      val rtt: Option[Double] = msg.body.networkRttInMs match {
        case 0           => None
        case rtt: Double => Some(rtt)
      }

      val status = getLevelFromRtt(msg.body.networkRttInMs)

      UserConnectionStatusDAO.updateUserAlive(user.meetingId, user.intId, rtt, status)
    }
  }

  def getLevelFromRtt(networkRttInMs: Double): String = {
    val levelOptions = getConfigPropertyValueByPathAsListOfStringOrElse(
      liveMeeting.clientSettings,
      "public.stats.level",
      List("warning", "danger", "critical")
    )

    val rttOptions = getConfigPropertyValueByPathAsListOfIntOrElse(
      liveMeeting.clientSettings,
      "public.stats.rtt",
      List(500, 1000, 2000)
    )

    val statusRttXLevel = levelOptions.zip(rttOptions).reverse

    val statusFound = statusRttXLevel.collectFirst {
      case (level, rtt) if networkRttInMs > rtt => level
    }

    statusFound.getOrElse("normal")
  }

}
