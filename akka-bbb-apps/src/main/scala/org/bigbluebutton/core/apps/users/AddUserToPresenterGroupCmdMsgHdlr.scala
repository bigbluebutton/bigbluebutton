package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait AddUserToPresenterGroupCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleAddUserToPresenterGroupCmdMsg(msg: AddUserToPresenterGroupCmdMsg) {

    def broadcastAddUserToPresenterGroup(meetingId: String, userId: String, requesterId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(UserAddedToPresenterGroupEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserAddedToPresenterGroupEvtMsg.NAME, meetingId, userId)
      val body = UserAddedToPresenterGroupEvtMsgBody(userId, requesterId)
      val event = UserAddedToPresenterGroupEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    val userId = msg.body.userId
    val requesterId = msg.body.requesterId

    for {
      requester <- Users2x.findWithIntId(liveMeeting.users2x, requesterId)
    } yield {
      if (requester.role == Roles.MODERATOR_ROLE) {
        Users2x.addUserToPresenterGroup(liveMeeting.users2x, userId)
        broadcastAddUserToPresenterGroup(liveMeeting.props.meetingProp.intId, userId, requesterId)
      }
    }
  }

}
