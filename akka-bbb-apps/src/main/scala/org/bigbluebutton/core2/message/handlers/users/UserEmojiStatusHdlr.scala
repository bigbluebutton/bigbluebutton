package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{UserChangedEmojiStatus, UserEmojiStatus}
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait UserEmojiStatusHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserEmojiStatus(msg: UserEmojiStatus) {
    for {
      uvo <- Users.setEmojiStatus(msg.userId, liveMeeting.users, msg.emojiStatus)
    } yield {
      outGW.send(new UserChangedEmojiStatus(props.meetingProp.intId, props.recordProp.record, msg.emojiStatus, uvo.id))
    }
  }

}
