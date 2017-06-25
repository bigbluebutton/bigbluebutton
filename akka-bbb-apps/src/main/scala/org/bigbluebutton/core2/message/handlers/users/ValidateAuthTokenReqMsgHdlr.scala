package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.users.ValidateAuthTokenReqMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.api.{ GuestPolicy, ValidateAuthToken }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders._

trait ValidateAuthTokenReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleValidateAuthTokenReqMsg(msg: ValidateAuthTokenReqMsg): Unit = {
    log.debug("RECEIVED ValidateAuthTokenReqMsg msg {}", msg)

    RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId, liveMeeting.registeredUsers) match {
      case Some(u) =>

        if (u.guest && u.waitingForAcceptance && MeetingStatus2x.getGuestPolicy(liveMeeting.status) == GuestPolicy.ASK_MODERATOR) {
          ValidateAuthTokenRespMsgSender.send(outGW, meetingId = props.meetingProp.intId,
            userId = msg.body.userId, authToken = msg.body.authToken, valid = true, waitForApproval = true)

          val guest = GuestWaiting(u.id, u.name, u.role)
          addGuestToWaitingForApproval(guest)
          notifyModeratorsOfGuestWaiting(Vector(guest))
        } else {

          ValidateAuthTokenRespMsgSender.send(outGW, meetingId = props.meetingProp.intId,
            userId = msg.body.userId, authToken = msg.body.authToken, valid = true, waitForApproval = false)
          log.debug("validate token token={}, valid=true, waitForApproval=false", msg.body.authToken)
          // Temp only so we can implement user handling in client. (ralam june 21, 2017)
          userJoinMeeting(msg.body.authToken)
          sendAllUsersInMeeting(msg.body.userId)
          sendAllVoiceUsersInMeeting(msg.body.userId)
          sendAllWebcamStreams(msg.body.userId)
        }

      case None =>
        ValidateAuthTokenRespMsgSender.send(outGW, meetingId = props.meetingProp.intId,
          userId = msg.body.userId, authToken = msg.body.authToken, valid = false, waitForApproval = false)
    }
  }

  def notifyModeratorsOfGuestWaiting(guests: Vector[GuestWaiting]): Unit = {
    def build(meetingId: String, userId: String, guests: Vector[GuestWaiting]): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GuestsWaitingApprovalEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(GuestsWaitingApprovalEvtMsg.NAME, meetingId, userId)

      val guestsWaiting = guests.map(g => GuestWaitingVO(g.intId, g.name, g.role))
      val body = GuestsWaitingApprovalEvtMsgBody(guestsWaiting)
      val event = GuestsWaitingApprovalEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val mods = Users2x.findAll(liveMeeting.users2x).filter(p => p.role == Roles.MODERATOR_ROLE)
    mods foreach { m =>
      val event = build(liveMeeting.props.meetingProp.intId, m.intId, guests)
      Sender.send(outGW, event)
    }

  }

  def addGuestToWaitingForApproval(guest: GuestWaiting): Unit = {
    GuestsWaiting.add(liveMeeting.guestsWaiting, guest)
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

  def sendAllUsersInMeeting(requesterId: String): Unit = {
    val users = Users2x.findAll(liveMeeting.users2x)
    val webUsers = users.map { u =>
      WebUser(intId = u.intId, extId = u.extId, name = u.name, role = u.role,
        guest = u.guest, authed = u.authed, waitingForAcceptance = u.waitingForAcceptance, emoji = u.emoji,
        locked = u.locked, presenter = u.presenter, avatar = u.avatar)
    }

    val event = GetUsersMeetingRespMsgBuilder.build(liveMeeting.props.meetingProp.intId, requesterId, webUsers)
    Sender.send(outGW, event)
  }
}
