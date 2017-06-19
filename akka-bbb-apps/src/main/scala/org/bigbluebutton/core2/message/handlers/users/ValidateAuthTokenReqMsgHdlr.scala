package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ RegisteredUsers, VoiceUsers, Webcams }
import org.bigbluebutton.core.api.ValidateAuthToken
import org.bigbluebutton.core.models.RegisteredUsers
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.{ GetVoiceUsersMeetingRespMsgBuilder, GetWebcamStreamsMeetingRespMsgBuilder, Sender, ValidateAuthTokenRespMsgSender }

trait ValidateAuthTokenReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleValidateAuthTokenReqMsg(msg: ValidateAuthTokenReqMsg): Unit = {
    log.debug("****** RECEIVED ValidateAuthTokenReqMsg msg {}", msg)

    val valid = RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId, liveMeeting.registeredUsers) match {
      case Some(u) => true
      case None => false
    }

    sendOldValidateToken(props.meetingProp.intId, msg.body.userId, msg.body.authToken)

    ValidateAuthTokenRespMsgSender.send(outGW, meetingId = props.meetingProp.intId,
      userId = msg.body.userId, authToken = msg.body.authToken, valid = valid)

    userJoinMeeting(msg.body.authToken)

    sendAllUsersInMeeting(msg.body.userId)

    sendAllVoiceUsersInMeeting(msg.body.userId)

    sendAllWebcamStreams(msg.body.userId)
  }

  def sendAllVoiceUsersInMeeting(requesterId: String): Unit = {
    val users = VoiceUsers.findAll(liveMeeting.voiceUsers)
    val voiceUsers = users.map { u =>
      VoiceConfUser(intId = u.intId, voiceUserId = u.voiceUserId, callingWith = u.callingWith, callerName = u.callerName,
        callerNum = u.callerNum, muted = u.muted, talking = u.talking, listenOnly = u.listenOnly)
    }

    val event = GetVoiceUsersMeetingRespMsgBuilder.build(liveMeeting.props.meetingProp.intId, requesterId, voiceUsers)
    Sender.send(outGW, event)
  }

  def sendAllWebcamStreams(requesterId: String): Unit = {
    val streams = Webcams.findAll(liveMeeting.webcams)
    val webcamStreams = streams.map { u =>
      val msVO = MediaStreamVO(id = u.stream.id, url = u.stream.url, userId = u.stream.userId,
        attributes = u.stream.attributes, viewers = u.stream.viewers)

      WebcamStreamVO(streamId = msVO.id, stream = msVO)
    }

    val event = GetWebcamStreamsMeetingRespMsgBuilder.build(liveMeeting.props.meetingProp.intId, requesterId, webcamStreams)
    Sender.send(outGW, event)
  }

  def sendOldValidateToken(meetingId: String, userId: String, authToken: String): Unit = {
    handleValidateAuthToken(ValidateAuthToken(meetingID = meetingId, userId = userId, token = authToken,
      correlationId = authToken, sessionId = authToken))
  }
}
