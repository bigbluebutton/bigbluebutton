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

  var previouslySelectedIds = List("")

  def pickUser(userIds: Vector[String]): Int = {

    if (previouslySelectedIds.size == 1) {
      val log1 = log.debug(s"\n\n\n")
      val log2 = log.debug(s" --- start experimental select viewer only once ---")
      val log7 = log.debug(s" from the choosable users in the meeting")
      val log6 = userIds.map(i => log.debug(s" Id -> $i"))
    }

    if (userIds.size != previouslySelectedIds.size - 1) {
      val randNum = (new scala.util.Random).nextInt(userIds.size)
      val matches = previouslySelectedIds.filter(_ == userIds(randNum))
      if (matches.size == 1) pickUser(userIds)
      else {
        previouslySelectedIds = previouslySelectedIds :+ userIds(randNum)
        val chosen = userIds(randNum)
        val log7 = log.debug(s" Chose user with ID - $chosen so returning number $randNum")
        randNum
      }
    } else {
      val log3 = log.debug(s" no-more-users")
      val log4 = log.debug(s" --- end experimental select viewer only once -")
      val log5 = log.debug(s"\n\n\n")

      -1
    }
  }

  def handleSelectRandomViewerReqMsg(msg: SelectRandomViewerReqMsg): Unit = {
    log.debug("Received SelectRandomViewerReqMsg {}", SelectRandomViewerReqMsg)

    def broadcastEvent(msg: SelectRandomViewerReqMsg, users: Vector[String], choice: Integer): Unit = {
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
      // val randNum = new scala.util.Random
      // val chosenUser = if (users.size == 0) -1 else randNum.nextInt(users.size)

      val userIds = users.map { case (v) => v.intId }

      val log5 = log.debug(s"\n\n\n")
      val log1 = log.debug("allowRepeat: " + msg.body.allowRepeat)
      val log4 = log.debug(s"\n\n\n")

      var allowRepeat = msg.body.allowRepeat

      val choice = if (allowRepeat) {
        val randNum = new scala.util.Random
        if (users.size == 0) -1 else randNum.nextInt(users.size)
      } else pickUser(userIds)

      broadcastEvent(msg, userIds, choice)
    }
  }
}
