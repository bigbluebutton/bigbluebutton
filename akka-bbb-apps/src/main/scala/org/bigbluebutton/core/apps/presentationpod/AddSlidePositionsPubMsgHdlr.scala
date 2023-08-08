package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPageDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait AddSlidePositionsPubMsgHdlr extends RightsManagementTrait {

  this: PresentationPodHdlrs =>

  def handle(msg: AddSlidePositionsPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus) = {
    PresPageDAO.addSlidePosition(msg.body.slideId, msg.body.width, msg.body.height,
      msg.body.viewBoxWidth, msg.body.viewBoxHeight)
    state
  }
}
