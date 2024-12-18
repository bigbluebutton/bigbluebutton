package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.db.UserStateDAO
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait SetUserEchoTestRunningReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetUserEchoTestRunningReqMsg(msg: SetUserEchoTestRunningReqMsg): Unit = {
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      UserStateDAO.updateEchoTestRunningAt(liveMeeting.props.meetingProp.intId, user.intId)
    }
  }
}
