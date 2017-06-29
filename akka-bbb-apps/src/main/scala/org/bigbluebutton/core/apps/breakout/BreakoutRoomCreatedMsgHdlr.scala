package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.MeetingActor

trait BreakoutRoomCreatedMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleBreakoutRoomCreatedMsg(msg: BreakoutRoomCreatedMsg): Unit = {

    liveMeeting.breakoutRooms.pendingRoomsNumber -= 1
    val room = BreakoutRooms.getBreakoutRoom(liveMeeting.breakoutRooms, msg.body.breakoutRoomId)
    room foreach { room =>
      sendBreakoutRoomStarted(room.parentRoomId, room.name, room.externalMeetingId, room.id, room.sequence, room.voiceConfId)
    }

    // We postpone sending invitation until all breakout rooms have been created
    if (liveMeeting.breakoutRooms.pendingRoomsNumber == 0) {
      log.info("All breakout rooms created for meetingId={}", props.meetingProp.intId)
      BreakoutRooms.getRooms(liveMeeting.breakoutRooms).foreach { room =>
        BreakoutRooms.getAssignedUsers(liveMeeting.breakoutRooms, room.id) foreach { users =>
          users.foreach { u =>
            log.debug("Sending Join URL for users");
            sendJoinURL(u, room.externalMeetingId, room.sequence.toString())
          }
        }
      }

      handleBreakoutRoomsListMsg(new BreakoutRoomsListMsg(new BbbClientMsgHeader(BreakoutRoomsListMsg.NAME,
        msg.header.meetingId, msg.header.userId), new BreakoutRoomsListMsgBody(props.meetingProp.intId)))
    }
  }
}
