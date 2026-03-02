package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.db.ChatMessageDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.RegisteredUsers
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait BreakoutRoomCallModeratorMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomCallModeratorMsg(msg: BreakoutRoomCallModeratorReqMsg, state: MeetingState2x): MeetingState2x = {
    val meetingId = liveMeeting.props.meetingProp.intId

    for {
      breakoutModel <- state.breakout
      room <- breakoutModel.rooms.get(msg.body.breakoutRoomId)
      senderUser <- RegisteredUsers.findWithUserId(msg.header.userId, liveMeeting.registeredUsers)
      if room.assignedUsers.contains(msg.header.userId)
    } yield {
      val roomName = room.shortName
      val msgMeta = Map(
        "senderMeetingId" -> room.id,
        "roomName" -> roomName,
        "sequence" -> room.sequence.toString
      )

      ChatMessageDAO.insertSystemMsg(
        meetingId,
        GroupChatApp.MAIN_PUBLIC_CHAT,
        "", "",
        GroupChatMessageType.BREAKOUT_CALL_MODERATOR_MSG,
        msgMeta,
        senderUser.name
      )

      log.info("Breakout call moderator: user={} room={} meetingId={}", senderUser.name, roomName, meetingId)
    }

    state
  }
}
