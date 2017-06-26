package org.bigbluebutton.core2.message.handlers.breakoutrooms

import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.apps.BreakoutRoomsUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.common2.messages.breakoutrooms._

trait RequestBreakoutJoinURLMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleRequestBreakoutJoinURLMsg(msg: RequestBreakoutJoinURLMsg): Unit = {

    def broadcastEvent(msg: RequestBreakoutJoinURLMsg): Unit = {
      for {
        breakoutRoom <- BreakoutRooms.getRoomWithExternalId(liveMeeting.breakoutRooms, msg.body.breakoutMeetingId)
      } yield sendJoinURL(msg.body.userId, msg.body.breakoutMeetingId, breakoutRoom.sequence.toString())
    }

    def sendJoinURL(userId: String, externalMeetingId: String, roomSequence: String) {
      log.debug("Sending breakout meeting {} Join URL for user: {}", externalMeetingId, userId)
      for {
        user <- Users.findWithId(userId, liveMeeting.users)
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
      } yield {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
        val envelope = BbbCoreEnvelope(BreakoutRoomJoinURLEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(BreakoutRoomJoinURLEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

        val body = BreakoutRoomJoinURLEvtMsgBody(props.meetingProp.intId,
          props.recordProp.record, externalMeetingId, userId, redirectJoinURL, noRedirectJoinURL)
        val event = BreakoutRoomJoinURLEvtMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

        outGW.send(msgEvent)
      }
    }

    broadcastEvent(msg)
  }
}
