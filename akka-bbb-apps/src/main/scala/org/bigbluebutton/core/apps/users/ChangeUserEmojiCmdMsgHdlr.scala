package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ChangeUserEmojiCmdMsgHdlr extends RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserEmojiCmdMsg(msg: ChangeUserEmojiCmdMsg) {
    val isUserSettingOwnEmoji = (msg.header.userId == msg.body.userId)

    val isUserModerator = !permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )

    val isUserPresenter = !permissionFailed(
      PermissionCheck.VIEWER_LEVEL,
      PermissionCheck.PRESENTER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      val initialEmojiState = user.emoji
      val nextEmojiState = msg.body.emoji

      if (isUserSettingOwnEmoji
        || isUserModerator && nextEmojiState.equals("none")
        || isUserPresenter && initialEmojiState.equals("raiseHand") && nextEmojiState.equals("none")) {
        for {
          uvo <- Users2x.setEmojiStatus(liveMeeting.users2x, msg.body.userId, msg.body.emoji)
        } yield {
          outGW.send(MsgBuilder.buildUserEmojiChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId, msg.body.emoji))

          if (initialEmojiState == "raiseHand" || nextEmojiState == "raiseHand") {
            Users2x.setUserRaiseHand(liveMeeting.users2x, msg.body.userId, msg.body.emoji == "raiseHand")
            outGW.send(MsgBuilder.buildUserRaiseHandChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId, msg.body.emoji == "raiseHand"))
          }

          if (initialEmojiState == "away" || nextEmojiState == "away") {
            Users2x.setUserAway(liveMeeting.users2x, msg.body.userId, msg.body.emoji == "away")
            outGW.send(MsgBuilder.buildUserAwayChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId, msg.body.emoji == "away"))
          }

        }
      } else {
        val meetingId = liveMeeting.props.meetingProp.intId
        val reason = "No permission to clear change user emoji status."
        PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      }
    }
  }

}
