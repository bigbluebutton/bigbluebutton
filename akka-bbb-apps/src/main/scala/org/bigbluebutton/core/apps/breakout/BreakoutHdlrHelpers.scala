package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait BreakoutHdlrHelpers extends SystemConfiguration {
  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def sendJoinURL(userId: String, externalMeetingId: String, roomSequence: String, breakoutId: String) {
    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, userId)
      apiCall = "join"
      (redirectParams, noRedirectParams) = BreakoutRoomsUtil.joinParams(user.name, userId + "-" + roomSequence, true,
        externalMeetingId, liveMeeting.props.password.moderatorPass)
      // We generate a first url with redirect -> true
      redirectBaseString = BreakoutRoomsUtil.createBaseString(redirectParams)
      redirectJoinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, redirectBaseString,
        BreakoutRoomsUtil.calculateChecksum(apiCall, redirectBaseString, bbbWebSharedSecret))
      // We generate a second url with redirect -> false
      noRedirectBaseString = BreakoutRoomsUtil.createBaseString(noRedirectParams)
      noRedirectJoinURL = BreakoutRoomsUtil.createJoinURL(bbbWebAPI, apiCall, noRedirectBaseString,
        BreakoutRoomsUtil.calculateChecksum(apiCall, noRedirectBaseString, bbbWebSharedSecret))
    } yield {
      sendJoinURLMsg(liveMeeting.props.meetingProp.intId, breakoutId, externalMeetingId,
        userId, redirectJoinURL, noRedirectJoinURL)
    }
  }

  def sendJoinURLMsg(meetingId: String, breakoutId: String, externalId: String,
                     userId: String, redirectJoinURL: String, noRedirectJoinURL: String): Unit = {
    def build(meetingId: String, breakoutId: String,
              userId: String, redirectJoinURL: String, noRedirectJoinURL: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(BreakoutRoomJoinURLEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(BreakoutRoomJoinURLEvtMsg.NAME, meetingId, userId)

      val body = BreakoutRoomJoinURLEvtMsgBody(meetingId, breakoutId, externalId,
        userId, redirectJoinURL, noRedirectJoinURL)
      val event = BreakoutRoomJoinURLEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    val msgEvent = build(meetingId, breakoutId, userId, redirectJoinURL, noRedirectJoinURL)
    outGW.send(msgEvent)

  }
}
