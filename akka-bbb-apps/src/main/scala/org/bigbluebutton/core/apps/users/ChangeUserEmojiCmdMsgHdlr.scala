package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait ChangeUserEmojiCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserEmojiCmdMsg(msg: ChangeUserEmojiCmdMsg) {
    log.debug("handling " + msg)
    for {
      uvo <- Users2x.setEmojiStatus(liveMeeting.users2x, msg.body.userId, msg.body.emoji)
    } yield {
      sendUserEmojiChangedEvtMsg(outGW, liveMeeting.props.meetingProp.intId, msg.body.userId, msg.body.emoji)
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
