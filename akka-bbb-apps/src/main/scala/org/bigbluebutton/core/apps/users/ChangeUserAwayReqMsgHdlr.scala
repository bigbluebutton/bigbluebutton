package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ChangeUserAwayReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserAwayReqMsg(msg: ChangeUserAwayReqMsg): Unit = {
    log.info("handleChangeUserAwayReqMsg: away={} userId={}", msg.body.away, msg.body.userId)

    def broadcast(user: UserState, away: Boolean): Unit = {
      val routingChange = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, user.intId
      )
      val envelopeChange = BbbCoreEnvelope(UserAwayChangedEvtMsg.NAME, routingChange)
      val headerChange = BbbClientMsgHeader(UserAwayChangedEvtMsg.NAME, liveMeeting.props.meetingProp.intId,
        user.intId)

      val bodyChange = UserAwayChangedEvtMsgBody(user.intId, away)
      val eventChange = UserAwayChangedEvtMsg(headerChange, bodyChange)
      val msgEventChange = BbbCommonEnvCoreMsg(envelopeChange, eventChange)
      outGW.send(msgEventChange)
    }

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
      newUserState <- Users2x.setUserAway(liveMeeting.users2x, user.intId, msg.body.away)
    } yield {
      if (msg.body.away && user.emoji == "") {
        Users2x.setEmojiStatus(liveMeeting.users2x, msg.body.userId, "away")
        outGW.send(MsgBuilder.buildUserEmojiChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId, "away"))
      }

      if (msg.body.away == false && user.emoji == "away") {
        Users2x.setEmojiStatus(liveMeeting.users2x, msg.body.userId, "none")
        outGW.send(MsgBuilder.buildUserEmojiChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId, "none"))
      }

      broadcast(newUserState, msg.body.away)
    }
  }
}