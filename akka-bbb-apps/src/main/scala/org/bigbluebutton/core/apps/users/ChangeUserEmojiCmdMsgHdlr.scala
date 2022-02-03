package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

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

    val initialEmojiState = Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId).get.emoji
    val nextEmojiState = msg.body.emoji

    if (isUserSettingOwnEmoji
      || isUserModerator && nextEmojiState.equals("none")
      || isUserPresenter && initialEmojiState.equals("raiseHand") && nextEmojiState.equals("none")) {
      for {
        uvo <- Users2x.setEmojiStatus(liveMeeting.users2x, msg.body.userId, msg.body.emoji)
      } yield {
        sendUserEmojiChangedEvtMsg(outGW, liveMeeting.props.meetingProp.intId, msg.body.userId, msg.body.emoji)
      }
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to clear change user emoji status."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    }
  }

  def sendUserEmojiChangedEvtMsg(outGW: OutMsgRouter, meetingId: String, userId: String, emoji: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserEmojiChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserEmojiChangedEvtMsg.NAME, meetingId, userId)
    val body = UserEmojiChangedEvtMsgBody(userId, emoji)
    val event = UserEmojiChangedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
