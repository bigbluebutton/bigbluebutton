package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.db.UserDAO
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }

trait UserLeftVoiceConfEvtMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserLeftVoiceConfEvtMsg(msg: UserLeftVoiceConfEvtMsg): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserLeftVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserLeftVoiceConfToClientEvtMsg.NAME, liveMeeting.props.meetingProp.intId, vu.intId)

      val body = UserLeftVoiceConfToClientEvtMsgBody(voiceConf = msg.header.voiceConf, intId = vu.intId, voiceUserId = vu.intId)

      val event = UserLeftVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    //if user was a dial-in, this would be their ID
    val ifDialInUserId = IntIdPrefixType.DIAL_IN + msg.body.voiceUserId

    for {
      // Check whether there is such dial-in user
      user <- Users2x.findWithIntId(liveMeeting.users2x, ifDialInUserId)
    } yield {
      if (GuestsWaiting.findWithIntId(liveMeeting.guestsWaiting, user.intId) != None) {
        GuestsWaiting.remove(liveMeeting.guestsWaiting, user.intId)
        UsersApp.guestWaitingLeft(liveMeeting, user.intId, outGW)
      }
      Users2x.remove(liveMeeting.users2x, user.intId)
      UserDAO.softDelete(user.meetingId, user.intId)
      VoiceApp.removeUserFromVoiceConf(liveMeeting, outGW, msg.body.voiceUserId)
    }

    for {
      user <- VoiceUsers.findWithVoiceUserId(liveMeeting.voiceUsers, msg.body.voiceUserId)
    } yield {
      VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, liveMeeting.props.meetingProp.intId, user.intId)
      broadcastEvent(user)
    }

    if (liveMeeting.props.meetingProp.isBreakout) {
      BreakoutHdlrHelpers.updateParentMeetingWithUsers(liveMeeting, eventBus)
    }

    if (Users2x.numUsers(liveMeeting.users2x) == 0) meetingEndTime = System.currentTimeMillis()
  }
}
