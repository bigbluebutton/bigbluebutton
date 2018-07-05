package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait SyncGetUsersMeetingRespMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSyncGetUsersMeetingRespMsg(): Unit = {
    log.debug("Handling SyncGetUsersMeetingRespMsg")

    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
    val envelope = BbbCoreEnvelope(SyncGetUsersMeetingRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(SyncGetUsersMeetingRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")

    val users = Users2x.findAll(liveMeeting.users2x)
    val webUsers = users.map { u =>
      WebUser(intId = u.intId, extId = u.extId, name = u.name, role = u.role,
        guest = u.guest, authed = u.authed, waitingForAcceptance = u.waitingForAcceptance, emoji = u.emoji,
        locked = u.locked, presenter = u.presenter, avatar = u.avatar, clientType = u.clientType)
    }

    val body = SyncGetUsersMeetingRespMsgBody(webUsers)
    val event = SyncGetUsersMeetingRespMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
