package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.{ MessageRecorder, OutMessageGateway }
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.{ GetUsersMeetingRespMsgBuilder, Sender }

trait GetUsersHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetUsers(msg: GetUsers): Unit = {
    val users = Users2x.findAll(liveMeeting.users2x)
    val webUsers = users.map { u =>
      WebUser(intId = u.intId, extId = u.extId, name = u.name, role = u.role,
        guest = u.guest, authed = u.authed, waitingForAcceptance = u.waitingForAcceptance, emoji = u.emoji,
        locked = u.locked, presenter = u.presenter, avatar = u.avatar)
    }

    val event = GetUsersMeetingRespMsgBuilder.build(msg.meetingID, msg.requesterID, webUsers)
    Sender.send(outGW, event)
    MessageRecorder.record(outGW, liveMeeting.props.recordProp.record, event.core)
  }

}
