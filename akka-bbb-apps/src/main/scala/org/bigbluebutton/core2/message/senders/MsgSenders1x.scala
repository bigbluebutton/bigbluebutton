package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ DisconnectUser, EjectVoiceUser, UserEjectedFromMeeting, UserLeft }
import org.bigbluebutton.core.models.UserVO
import org.bigbluebutton.core.running.LiveMeeting

trait MsgSenders1x {
  val outGW: OutMessageGateway
  val liveMeeting: LiveMeeting

  def sendEjectVoiceUser(intId: String, ejectedBy: String, voiceUserId: String): Unit = {
    outGW.send(new EjectVoiceUser(liveMeeting.props.meetingProp.intId, liveMeeting.props.recordProp.record,
      ejectedBy, intId, liveMeeting.props.voiceProp.voiceConf, voiceUserId))
  }

  def sendUserEjectedFromMeeting(intId: String, ejectedBy: String): Unit = {
    outGW.send(new UserEjectedFromMeeting(liveMeeting.props.meetingProp.intId, liveMeeting.props.recordProp.record, intId, ejectedBy))
  }

  def sendDisconnectUser(intId: String): Unit = {
    outGW.send(new DisconnectUser(liveMeeting.props.meetingProp.intId, intId))
  }

  def sendUserLeft(user: UserVO): Unit = {
    outGW.send(new UserLeft(liveMeeting.props.meetingProp.intId, liveMeeting.props.recordProp.record, user))
  }
}
