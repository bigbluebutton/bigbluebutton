package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait UpdateWebcamsOnlyForModeratorCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUpdateWebcamsOnlyForModeratorCmdMsg(msg: UpdateWebcamsOnlyForModeratorCmdMsg) {
    log.info("Change webcams only for moderator status. meetingId=" + liveMeeting.props.meetingProp.intId + " webcamsOnlyForModeratorrecording=" + msg.body.webcamsOnlyForModerator)
    if (MeetingStatus2x.webcamsOnlyForModeratorEnabled(liveMeeting.status) != msg.body.webcamsOnlyForModerator) {
      MeetingStatus2x.setWebcamsOnlyForModerator(liveMeeting.status, msg.body.webcamsOnlyForModerator)

      val event = buildWebcamsOnlyForModeratorChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.setBy, msg.body.webcamsOnlyForModerator)
      outGW.send(event)
    }

    def buildWebcamsOnlyForModeratorChangedEvtMsg(meetingId: String, userId: String, webcamsOnlyForModerator: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(WebcamsOnlyForModeratorChangedEvtMsg.NAME, routing)
      val body = WebcamsOnlyForModeratorChangedEvtMsgBody(webcamsOnlyForModerator, userId)
      val header = BbbClientMsgHeader(WebcamsOnlyForModeratorChangedEvtMsg.NAME, meetingId, userId)
      val event = WebcamsOnlyForModeratorChangedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }
  }
}