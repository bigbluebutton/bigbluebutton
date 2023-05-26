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

    val currentEmojiState = Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId).get.emoji

    if (isNodeUser && (!currentEmojiState.equals("raiseHand") && !currentEmojiState.equals("away") && !currentEmojiState.equals("notAway"))) {
      Users2x.setEmojiStatus(liveMeeting.users2x, msg.body.userId, "none")
    }
  }
}
