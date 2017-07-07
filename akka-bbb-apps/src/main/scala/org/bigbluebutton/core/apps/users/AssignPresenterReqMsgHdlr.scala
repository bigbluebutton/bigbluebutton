package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ UserState, Users2x }

trait AssignPresenterReqMsgHdlr {
  this: UsersApp2x =>

  def handleAssignPresenterReqMsg(msg: AssignPresenterReqMsg) {

    def broadcastPresenterChange(oldPres: UserState, newPres: UserState): Unit = {
      // unassign old presenter
      val routingUnassign = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING,
        this.liveMeeting.props.meetingProp.intId, oldPres.intId)
      val envelopeUnassign = BbbCoreEnvelope(PresenterUnassignedEvtMsg.NAME, routingUnassign)
      val headerUnassign = BbbClientMsgHeader(PresenterUnassignedEvtMsg.NAME, this.liveMeeting.props.meetingProp.intId,
        oldPres.intId)

      val bodyUnassign = PresenterUnassignedEvtMsgBody(oldPres.intId, oldPres.name, msg.body.assignedBy) // TODO make sure assignedBy is a userID
      val eventUnassign = PresenterUnassignedEvtMsg(headerUnassign, bodyUnassign)
      val msgEventUnassign = BbbCommonEnvCoreMsg(envelopeUnassign, eventUnassign)
      outGW.send(msgEventUnassign)

      // set new presenter
      val routingAssign = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING,
        this.liveMeeting.props.meetingProp.intId, newPres.intId)
      val envelopeAssign = BbbCoreEnvelope(PresenterAssignedEvtMsg.NAME, routingAssign)
      val headerAssign = BbbClientMsgHeader(PresenterAssignedEvtMsg.NAME, this.liveMeeting.props.meetingProp.intId,
        newPres.intId)

      val bodyAssign = PresenterAssignedEvtMsgBody(newPres.intId, newPres.name, msg.body.assignedBy) // TODO make sure assignedBy is a userID
      val eventAssign = PresenterAssignedEvtMsg(headerAssign, bodyAssign)
      val msgEventAssign = BbbCommonEnvCoreMsg(envelopeAssign, eventAssign)
      outGW.send(msgEventAssign)
    }

    for {
      oldPres <- Users2x.findPresenter(this.liveMeeting.users2x)
      newPres <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.newPresenterId)
    } yield {
      Users2x.unmakePresenter(this.liveMeeting.users2x, oldPres.intId)
      Users2x.makePresenter(this.liveMeeting.users2x, newPres.intId)
      broadcastPresenterChange(oldPres, newPres)
    }
  }

}
