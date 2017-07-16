package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.GetUsersMeetingReqMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait GetUsersMeetingReqMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleGetUsersMeetingReqMsg(msg: GetUsersMeetingReqMsg): Unit = {
    sendAllUsersInMeeting(outGW, msg.body.userId, liveMeeting)
    sendAllVoiceUsersInMeeting(outGW, msg.body.userId, liveMeeting.voiceUsers, liveMeeting.props.meetingProp.intId)
    sendAllWebcamStreams(outGW, msg.body.userId, liveMeeting.webcams, liveMeeting.props.meetingProp.intId)
  }
}
