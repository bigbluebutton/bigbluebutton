package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ UserEmojiStatus }
import org.bigbluebutton.core.models.{ Users2x }
import org.bigbluebutton.core.running.MeetingActor

trait UserEmojiStatusHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserEmojiStatus(msg: UserEmojiStatus) {
    for {
      uvo <- Users2x.setEmojiStatus(liveMeeting.users2x, msg.userId, msg.emojiStatus)
    } yield {
      sendUserEmojiChangedEvtMsg(outGW, liveMeeting.props.meetingProp.intId, msg.userId, msg.emojiStatus)
    }
  }

  def sendUserEmojiChangedEvtMsg(outGW: OutMessageGateway, meetingId: String, userId: String, emoji: String): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserEmojiChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserEmojiChangedEvtMsg.NAME, meetingId, userId)
    val body = UserEmojiChangedEvtMsgBody(userId, emoji)
    val event = UserEmojiChangedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
