package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait ChangeUserReactionEmojiReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserReactionEmojiReqMsg(msg: ChangeUserReactionEmojiReqMsg): Unit = {
    log.info("handleChangeUserReactionEmojiReqMsg: reactionEmoji={} userId={}", msg.body.reactionEmoji, msg.body.userId)

    def broadcast(user: UserState, reactionEmoji: String): Unit = {
      val routingChange = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, user.intId
      )
      val envelopeChange = BbbCoreEnvelope(UserReactionEmojiChangedEvtMsg.NAME, routingChange)
      val headerChange = BbbClientMsgHeader(UserReactionEmojiChangedEvtMsg.NAME, liveMeeting.props.meetingProp.intId,
        user.intId)

      val bodyChange = UserReactionEmojiChangedEvtMsgBody(user.intId, reactionEmoji)
      val eventChange = UserReactionEmojiChangedEvtMsg(headerChange, bodyChange)
      val msgEventChange = BbbCommonEnvCoreMsg(envelopeChange, eventChange)
      outGW.send(msgEventChange)
    }

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
      newUserState <- Users2x.setReactionEmoji(liveMeeting.users2x, user.intId, msg.body.reactionEmoji)
    } yield {
      if (user.reactionEmoji != msg.body.reactionEmoji) {
        broadcast(newUserState, msg.body.reactionEmoji)
      }
    }
  }
}