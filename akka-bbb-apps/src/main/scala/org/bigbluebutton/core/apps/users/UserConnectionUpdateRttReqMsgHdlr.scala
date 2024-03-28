package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.db.UserConnectionStatusDAO
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait UserConnectionUpdateRttReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserConnectionUpdateRttReqMsg(msg: UserConnectionUpdateRttReqMsg): Unit = {
    log.info("handleUserConnectionUpdateRttReqMsg: networkRttInMs={} userId={}", msg.body.networkRttInMs, msg.body.userId)

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      UserConnectionStatusDAO.updateUserRtt(user.intId, msg.body.networkRttInMs)
    }

  }
}
