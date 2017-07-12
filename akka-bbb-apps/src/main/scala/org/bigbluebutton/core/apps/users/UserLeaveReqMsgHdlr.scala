package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait UserLeaveReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserLeaveReqMsg(msg: UserLeaveReqMsg): Unit = {
    for {
      u <- Users2x.remove(liveMeeting.users2x, msg.body.userId)
    } yield {
      log.info("User left meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)

      captionApp2x.handleUserLeavingMsg(msg.body.userId)
      liveMeeting.startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()

      // send a user left event for the clients to update
      val userLeftMeetingEvent = MsgBuilder.buildUserLeftMeetingEvtMsg(liveMeeting.props.meetingProp.intId, u.intId)
      outGW.send(userLeftMeetingEvent)
      log.info("User left meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + msg.body.userId)
    }
  }

}
