package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ BreakoutRoomJoinURLOutMessage, BreakoutRoomStartedOutMessage }
import org.bigbluebutton.core.apps.BreakoutRoomsUtil
import org.bigbluebutton.core.models.{ BreakoutRooms, Users2x }
import org.bigbluebutton.core.running.MeetingActor

trait BreakoutRoomCreatedMsgHdlr extends SystemConfiguration {
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
            log.debug("Sending Join URL for users")
            sendJoinURL(u, room.externalMeetingId, room.sequence.toString())
          }
        }
      }

      handleBreakoutRoomsListMsg(new BreakoutRoomsListMsg(new BbbClientMsgHeader(BreakoutRoomsListMsg.NAME,
        msg.header.meetingId, msg.header.userId), new BreakoutRoomsListMsgBody(props.meetingProp.intId)))
    }
  }

  def sendBreakoutRoomStarted(meetingId: String, breakoutName: String, externalMeetingId: String,
    breakoutMeetingId: String, sequence: Int, voiceConfId: String) {
    log.info("Sending breakout room started {} for parent meeting {} ", breakoutMeetingId, meetingId)
    outGW.send(new BreakoutRoomStartedOutMessage(meetingId, props.recordProp.record, new BreakoutRoomInfo(breakoutName,
      externalMeetingId, breakoutMeetingId, sequence)))
  }

  def sendJoinURL(userId: String, externalMeetingId: String, roomSequence: String) {
    log.debug("Sending breakout meeting {} Join URL for user: {}", externalMeetingId, userId)
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, userId)
      apiCall = "join"
      params = BreakoutRoomsUtil.joinParams(user.name, userId + "-" + roomSequence, true,
        externalMeetingId, props.password.moderatorPass)
      // We generate a first url with redirect -> true
      redirectBaseString = BreakoutRoomsUtil.createBaseString(params._1)
      redirectJoinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, redirectBaseString,
        BreakoutRoomsUtil.calculateChecksum(apiCall, redirectBaseString, bbbWebSharedSecret))
      // We generate a second url with redirect -> false
      noRedirectBaseString = BreakoutRoomsUtil.createBaseString(params._2)
      noRedirectJoinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, noRedirectBaseString,
        BreakoutRoomsUtil.calculateChecksum(apiCall, noRedirectBaseString, bbbWebSharedSecret))
    } yield outGW.send(new BreakoutRoomJoinURLOutMessage(props.meetingProp.intId,
      props.recordProp.record, externalMeetingId, userId, redirectJoinURL, noRedirectJoinURL))
  }
}
