package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ GetUsers, GetUsersReply }
import org.bigbluebutton.core.models.{ Users, Users2x }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.MessageSenders

trait GetUsersHdlr extends MessageSenders {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetUsers(msg: GetUsers): Unit = {
    val users = Users2x.findAll(liveMeeting.users2x)
    val webUsers = users.map { u =>
      WebUser(intId = u.intId, extId = u.extId, name = u.name, role = u.role,
        guest = u.guest, authed = u.authed, waitingForAcceptance = u.waitingForAcceptance, emoji = u.emoji,
        locked = u.locked, presenter = u.presenter, avatar = u.avatar)
    }

    sendGetUsersMeetingRespMsg(msg.meetingID, msg.requesterID, webUsers, liveMeeting.props.recordProp.record)
  }

}
