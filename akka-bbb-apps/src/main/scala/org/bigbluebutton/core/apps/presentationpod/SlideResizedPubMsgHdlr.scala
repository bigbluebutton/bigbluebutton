package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPageDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SlideResizedPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: SlideResizedPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus) = {
    PresPageDAO.updateSlidePosition(msg.body.pageId, msg.body.width, msg.body.height,
      msg.body.xOffset, msg.body.yOffset, msg.body.widthRatio, msg.body.heightRatio)
    state
  }
}
