package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ RightsManagementTrait }

trait UserReactionTimeExpiredCmdMsgHdlr extends RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting

  def handleUserReactionTimeExpiredCmdMsg(msg: UserReactionTimeExpiredCmdMsg) {
    val isNodeUser = msg.header.userId.equals("nodeJSapp")
    if (isNodeUser) {
      Users2x.setReactionEmoji(liveMeeting.users2x, msg.body.userId, "none")
    }
  }
}
