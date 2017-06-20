package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.{ OutMessageGateway }
import org.bigbluebutton.core.api.GetUsers
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.{ GetUsersMeetingRespMsgBuilder, Sender }

trait GetUsersHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetUsers(msg: GetUsers): Unit = {
    sendAllUsersInMeeting(msg.requesterID)
  }

  def sendAllUsersInMeeting(requesterId: String): Unit = {
    val users = Users2x.findAll(liveMeeting.users2x)
    val webUsers = users.map { u =>
      WebUser(intId = u.intId, extId = u.extId, name = u.name, role = u.role,
        guest = u.guest, authed = u.authed, waitingForAcceptance = u.waitingForAcceptance, emoji = u.emoji,
        locked = u.locked, presenter = u.presenter, avatar = u.avatar)
    }

    val event = GetUsersMeetingRespMsgBuilder.build(liveMeeting.props.meetingProp.intId, requesterId, webUsers)
    Sender.send(outGW, event)
  }

}
