package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.presentationpod.PresentationPodsApp
import org.bigbluebutton.core.domain.{ MeetingExpiryTracker, MeetingState2x }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.util.TimeUtil
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait UserLeaveReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserLeaveReqMsg(msg: UserLeaveReqMsg, state: MeetingState2x): MeetingState2x = {

    def broadcastSetPresenterInPodRespMsg(podId: String, nextPresenterId: String, requesterId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, requesterId
      )
      val envelope = BbbCoreEnvelope(SetPresenterInPodRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetPresenterInPodRespMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

      val body = SetPresenterInPodRespMsgBody(podId, nextPresenterId)
      val event = SetPresenterInPodRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    var newState = state
    for {
      u <- Users2x.remove(liveMeeting.users2x, msg.body.userId)
    } yield {
      log.info("User left meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.intId + " user=" + u)

      // stop the webcams of a user leaving
      handleUserBroadcastCamStopMsg(msg.body.userId)

      captionApp2x.handleUserLeavingMsg(msg.body.userId, liveMeeting, msgBus)
      stopAutoStartedRecording()

      // send a user left event for the clients to update
      val userLeftMeetingEvent = MsgBuilder.buildUserLeftMeetingEvtMsg(liveMeeting.props.meetingProp.intId, u.intId)
      outGW.send(userLeftMeetingEvent)

      if (u.presenter) {
        UsersApp.automaticallyAssignPresenter(outGW, liveMeeting)

        // request screenshare to end
        screenshareApp2x.handleScreenshareStoppedVoiceConfEvtMsg(
          liveMeeting.props.voiceProp.voiceConf,
          liveMeeting.props.screenshareProps.screenshareConf,
          liveMeeting, msgBus
        )

        // request ongoing poll to end
        pollApp.stopPoll(state, u.intId, liveMeeting, msgBus)
      }

      if (Users2x.userIsInPresenterGroup(liveMeeting.users2x, u.intId)) {
        Users2x.removeUserFromPresenterGroup(liveMeeting.users2x, u.intId)
        outGW.send(buildRemoveUserFromPresenterGroup(liveMeeting.props.meetingProp.intId, u.intId, u.intId))

        val pods = PresentationPodsApp.findPodsWhereUserIsPresenter(state.presentationPodManager, u.intId)

        pods foreach { pod =>
          val presenters = Users2x.getPresenterGroupUsers(liveMeeting.users2x)
          if (presenters.length > 0) {
            val updatedPod = pod.setCurrentPresenter(presenters.head)

            broadcastSetPresenterInPodRespMsg(pod.id, presenters.head, presenters.head)

            val newpods = state.presentationPodManager.addPod(updatedPod)
            newState = state.update(newpods)
          }
        }
      }
    }

    if (liveMeeting.props.meetingProp.isBreakout) {
      updateParentMeetingWithUsers()
    }

    if (Users2x.numUsers(liveMeeting.users2x) == 0) {
      val tracker = state.expiryTracker.setLastUserLeftOn(TimeUtil.timeNowInMs())
      newState.update(tracker)
    } else {
      newState
    }
  }

}
