package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core2.MeetingStatus2x
import scala.util.Random

trait SelectRandomViewerReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val outGW: OutMsgRouter

  var randomizedIds = Vector[String]()
  var previousIds = Set[String]()
  var counter = 0

  def pickUser(userIds: Vector[String], refresh: Boolean): String = {
    if (userIds.length != 1) {
      val setOfIds = userIds.toSet
      if ((randomizedIds.size == 0) || refresh) { //executed once on the first call
        randomizedIds = Random.shuffle(userIds)
        previousIds = setOfIds
        counter = 0
      }
      if (!(setOfIds).equals(previousIds)) { //only executed if list of users has changed
        val usedUp = randomizedIds.dropRight(randomizedIds.length - counter)
        val leftToChoose = userIds.diff(usedUp)
        randomizedIds = usedUp ++ Random.shuffle(leftToChoose)
        previousIds = setOfIds
      }
      if (counter != userIds.length) {
        counter = counter + 1
        randomizedIds(counter - 1)
      } else ""
    } else userIds(0)
  }

  def handleSelectRandomViewerReqMsg(msg: SelectRandomViewerReqMsg): Unit = {
    log.debug("Received SelectRandomViewerReqMsg {}", SelectRandomViewerReqMsg)

    def broadcastEvent(msg: SelectRandomViewerReqMsg, users: Vector[String], choice: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SelectRandomViewerRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SelectRandomViewerRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SelectRandomViewerRespMsgBody(msg.header.userId, users, choice)
      val event = SelectRandomViewerRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to select random user."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val users = Users2x.findNotPresentersNorModerators(liveMeeting.users2x)

      val userIds = (users.map { case (v) => v.intId })

      var allowRepeat = msg.body.allowRepeat

      var refresh = msg.body.refresh

      val choice = if (allowRepeat) {
        val randNum = new scala.util.Random
        if (users.size == 0) "" else userIds(randNum.nextInt(users.size))
      } else pickUser(userIds, refresh)

      broadcastEvent(msg, userIds, choice)
    }
  }
}
