package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PageVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ResizeAndMovePagePubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: ResizeAndMovePagePubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(msg: ResizeAndMovePagePubMsg, podId: String, page: PageVO): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(ResizeAndMovePageEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        ResizeAndMovePageEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = ResizeAndMovePageEvtMsgBody(podId, msg.body.presentationId, page.id,
        page.xOffset, page.yOffset, page.widthRatio, page.heightRatio)
      val event = ResizeAndMovePageEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to resize and move page."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      val podId: String = msg.body.podId
      val presentationId: String = msg.body.presentationId
      val pageId: String = msg.body.pageId
      val xOffset: Double = msg.body.xOffset
      val yOffset: Double = msg.body.yOffset
      val widthRatio: Double = msg.body.widthRatio
      val heightRatio: Double = msg.body.heightRatio

      val newState = for {
        pod <- PresentationPodsApp.getPresentationPodIfPresenter(state, podId, msg.header.userId)
        (updatedPod, page) <- pod.resizePage(presentationId, pageId, xOffset, yOffset, widthRatio, heightRatio)
      } yield {
        broadcastEvent(msg, podId, page)

        val pods = state.presentationPodManager.addPod(updatedPod)
        state.update(pods)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    }
  }
}
