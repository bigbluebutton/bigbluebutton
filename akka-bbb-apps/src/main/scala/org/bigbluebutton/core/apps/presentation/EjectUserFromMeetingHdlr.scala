package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models.{ UserState, Users2x }

trait EjectUserFromMeetingHdlr {
  this: PresentationApp2x =>

  def handle(msg: EjectUserFromMeeting, userToEject: UserState) {
    log.error("TODO: Handle message")

    if (userToEject.presenter) {
      /* The current presenter has left the meeting. Find a moderator and make
       * him presenter. This way, if there is a moderator in the meeting, there
       * will always be a presenter.
       */
      for {
        moderator <- Users2x.findModerator(liveMeeting.users2x)
        newPresenter <- Users2x.makePresenter(liveMeeting.users2x, moderator.intId)
      } yield {
        sendPresenterAssigned(newPresenter.intId, newPresenter.name, newPresenter.name)
        sendUserStatusChange(newPresenter.intId)
      }
    }
  }

  def sendPresenterAssigned(intId: String, name: String, assignedBy: String): Unit = {
    //outGW.send(new PresenterAssigned(liveMeeting.props.meetingProp.intId, liveMeeting.props.recordProp.record,
    //  new Presenter(intId, name, assignedBy)))
  }

  def sendUserStatusChange(intId: String): Unit = {
    //outGW.send(new UserStatusChange(liveMeeting.props.meetingProp.intId, liveMeeting.props.recordProp.record,
    //  intId, "presenter", true: java.lang.Boolean))
  }
}
