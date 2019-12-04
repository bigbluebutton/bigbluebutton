package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait GetWebcamsOnlyForModeratorReqMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetWebcamsOnlyForModeratorReqMsg(msg: GetWebcamsOnlyForModeratorReqMsg) {

    def buildGetWebcamsOnlyForModeratorRespMsg(meetingId: String, userId: String, webcamsOnlyForModerator: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetWebcamsOnlyForModeratorRespMsg.NAME, routing)
      val body = GetWebcamsOnlyForModeratorRespMsgBody(webcamsOnlyForModerator, userId)
      val header = BbbClientMsgHeader(GetWebcamsOnlyForModeratorRespMsg.NAME, meetingId, userId)
      val event = GetWebcamsOnlyForModeratorRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val event = buildGetWebcamsOnlyForModeratorRespMsg(liveMeeting.props.meetingProp.intId, msg.body.requestedBy,
      MeetingStatus2x.webcamsOnlyForModeratorEnabled(liveMeeting.status))
    outGW.send(event)
  }
}