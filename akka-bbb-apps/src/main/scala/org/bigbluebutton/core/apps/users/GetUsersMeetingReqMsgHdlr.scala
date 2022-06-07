package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.GetUsersMeetingReqMsg
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, OutMsgRouter }

trait GetUsersMeetingReqMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetUsersMeetingReqMsg(msg: GetUsersMeetingReqMsg): Unit = {
    sendAllUsersInMeeting(msg.body.userId)
    sendAllVoiceUsersInMeeting(msg.body.userId, liveMeeting.voiceUsers, liveMeeting.props.meetingProp.intId)
    sendAllWebcamStreams(outGW, msg.body.userId, liveMeeting.webcams, liveMeeting.props.meetingProp.intId)
  }
}
