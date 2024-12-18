package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.db.ChatUserDAO
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.LiveMeeting
import java.sql.Timestamp
import java.time.Instant

trait SetGroupChatLastSeenReqMsgHdlr {
  def handle(msg: SetGroupChatLastSeenReqMsg, liveMeeting: LiveMeeting): Unit = {
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      val lastSeenAtInstant = Instant.parse(msg.body.lastSeenAt)
      val lastSeenAtTimestamp = Timestamp.from(lastSeenAtInstant)

      ChatUserDAO.updateChatLastSeen(liveMeeting.props.meetingProp.intId, msg.body.chatId, user.intId, lastSeenAtTimestamp)
    }
  }
}
