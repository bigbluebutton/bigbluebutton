package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ BreakoutRooms, Users2x }
import org.bigbluebutton.core.running.MeetingActor

trait RequestBreakoutJoinURLReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handle(msg: RequestBreakoutJoinURLReqMsg): Unit = {

    def broadcastEvent(msg: RequestBreakoutJoinURLReqMsg): Unit = {
      for {
        breakoutRoom <- BreakoutRooms.getRoomWithExternalId(liveMeeting.breakoutRooms, msg.body.breakoutMeetingId)
      } yield sendJoinURL(msg.body.userId, msg.body.breakoutMeetingId, breakoutRoom.sequence.toString())
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
      } yield {
        val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, props.meetingProp.intId, msg.header.userId)
        val envelope = BbbCoreEnvelope(RequestBreakoutJoinURLRespMsg.NAME, routing)
        val header = BbbClientMsgHeader(RequestBreakoutJoinURLRespMsg.NAME, props.meetingProp.intId, msg.header.userId)

        val body = RequestBreakoutJoinURLRespMsgBody(props.meetingProp.intId,
          externalMeetingId, userId, redirectJoinURL, noRedirectJoinURL)
        val event = RequestBreakoutJoinURLRespMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

        outGW.send(msgEvent)
      }
    }

    broadcastEvent(msg)
  }
}
