package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait SetCurrentPageByNumPubMsgHdlr extends RightsManagementTrait {

  this: PresentationPodHdlrs =>

  def handle(
      msg: SetCurrentPageByNumPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set current presentation page."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      val body = msg.body
      val page = for {
        pod <- PresentationPodsApp.getPresentationPod(state, body.podId)
        pres <- pod.getPresentation(body.presentationId)
        num = PresentationPageOrder.numNow(body.pageNum, body.seenTotalPages, pres.pages.size, pres.orderChanges)
        page <- PresentationInPod.pageByNum(pres, num)
      } yield page

      page match {
        case Some(p) =>
          setCurrentPage(state, liveMeeting, bus, body.podId, msg.header.userId, body.presentationId, p.id)
        case None =>
          log.info(
            "Ignoring page change to page {} (seen total {}) of presentation {}: no such page.",
            body.pageNum, body.seenTotalPages, body.presentationId
          )
          state
      }
    }
  }
}
