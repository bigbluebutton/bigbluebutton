package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.handlers.users.{ UserEmojiStatusHdlr, UserLeavingHdlr }

trait UsersApp extends UserLeavingHdlr with UserEmojiStatusHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def usersWhoAreNotPresenter(): Vector[UserState] = {
    Users2x.findNotPresenters(liveMeeting.users2x)
  }

  def getInitialLockStatus(role: String): Boolean = {
    MeetingStatus2x.getPermissions(liveMeeting.status).lockOnJoin && !role.equals(Roles.MODERATOR_ROLE)
  }

  def handleAssignPresenter(msg: AssignPresenter): Unit = {
    assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  }

  def assignNewPresenter(newPresenterID: String, newPresenterName: String, assignedBy: String) {
    // Stop poll if one is running as presenter left.
    //handleStopPollRequest(StopPollRequest(props.meetingProp.intId, assignedBy))

    def removePresenterRightsToCurrentPresenter(): Unit = {
      for {
        curPres <- Users2x.findPresenter(liveMeeting.users2x)
      } yield {
        Users2x.makeNotPresenter(liveMeeting.users2x, curPres.intId)
        outGW.send(new UserStatusChange(props.meetingProp.intId, props.recordProp.record, curPres.intId, "presenter", false: java.lang.Boolean))
      }
    }

    for {
      newPres <- Users2x.findWithIntId(liveMeeting.users2x, newPresenterID)
    } yield {
      removePresenterRightsToCurrentPresenter()
      Users2x.makePresenter(liveMeeting.users2x, newPres.intId)
      //   MeetingStatus2x.setCurrentPresenterInfo(liveMeeting.status, new Presenter(newPresenterID, newPresenterName, assignedBy))
      outGW.send(new PresenterAssigned(props.meetingProp.intId, props.recordProp.record, new Presenter(newPresenterID, newPresenterName, assignedBy)))
      outGW.send(new UserStatusChange(props.meetingProp.intId, props.recordProp.record, newPresenterID, "presenter", true: java.lang.Boolean))
    }
  }
}
