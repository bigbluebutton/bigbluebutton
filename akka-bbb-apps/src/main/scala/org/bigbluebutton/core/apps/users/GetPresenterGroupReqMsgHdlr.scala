package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait GetPresenterGroupReqMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetPresenterGroupReqMsg(msg: GetPresenterGroupReqMsg) {

    def broadcastGetPresenterGroupRespMsg(meetingId: String, userId: String, requesterId: String, presenterGroup: Vector[String]): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, requesterId)
      val envelope = BbbCoreEnvelope(GetPresenterGroupRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetPresenterGroupRespMsg.NAME, meetingId, userId)
      val body = GetPresenterGroupRespMsgBody(presenterGroup, requesterId)
      val event = GetPresenterGroupRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    val userId = msg.header.userId
    val requesterId = msg.body.requesterId

    for {
      requester <- Users2x.findWithIntId(liveMeeting.users2x, requesterId)
    } yield {
      val presGroup = Users2x.getPresenterGroupUsers(liveMeeting.users2x)
      broadcastGetPresenterGroupRespMsg(liveMeeting.props.meetingProp.intId, userId, requesterId, presGroup)
    }
  }

}
