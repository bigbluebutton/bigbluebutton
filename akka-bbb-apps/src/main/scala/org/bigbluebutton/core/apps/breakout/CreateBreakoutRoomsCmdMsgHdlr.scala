package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ BreakoutModel, PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.domain.{ BreakoutRoom2x, MeetingState2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.running.MeetingActor

trait CreateBreakoutRoomsCmdMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleCreateBreakoutRoomsCmdMsg(msg: CreateBreakoutRoomsCmdMsg, state: MeetingState2x): MeetingState2x = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to create breakout room for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId,
        reason, outGW, liveMeeting)
      state
    } else {
      state.breakout match {
        case Some(breakout) =>
          log.warning(
            "CreateBreakoutRooms event received while breakout created for meeting {}", liveMeeting.props.meetingProp.intId
          )
          state
        case None =>
          processRequest(msg, state)
      }
    }
  }

  def processRequest(msg: CreateBreakoutRoomsCmdMsg, state: MeetingState2x): MeetingState2x = {

    val presId = getPresentationId(state)
    val presSlide = getPresentationSlide(state)
    val parentId = liveMeeting.props.meetingProp.intId
    var rooms = new collection.immutable.HashMap[String, BreakoutRoom2x]

    var i = 0
    for (room <- msg.body.rooms) {
      i += 1
      val (internalId, externalId) = BreakoutRoomsUtil.createMeetingIds(liveMeeting.props.meetingProp.intId, i)
      val voiceConf = BreakoutRoomsUtil.createVoiceConfId(liveMeeting.props.voiceProp.voiceConf, i)

      val breakout = BreakoutModel.create(parentId, internalId, externalId, room.name, room.sequence, room.freeJoin, voiceConf, room.users)
      rooms = rooms + (breakout.id -> breakout)
    }

    for (breakout <- rooms.values.toVector) {
      val roomDetail = new BreakoutRoomDetail(
        breakout.id, breakout.name,
        liveMeeting.props.meetingProp.intId,
        breakout.sequence,
        breakout.freeJoin,
        breakout.voiceConf,
        msg.body.durationInMinutes,
        liveMeeting.props.password.moderatorPass,
        liveMeeting.props.password.viewerPass,
        presId, presSlide, msg.body.record
      )

      val event = buildCreateBreakoutRoomSysCmdMsg(liveMeeting.props.meetingProp.intId, roomDetail)
      outGW.send(event)
    }

    val breakoutModel = new BreakoutModel(None, msg.body.durationInMinutes, rooms)
    state.update(Some(breakoutModel))
  }

  def buildCreateBreakoutRoomSysCmdMsg(meetingId: String, breakout: BreakoutRoomDetail): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(CreateBreakoutRoomSysCmdMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateBreakoutRoomSysCmdMsg.NAME)

    val body = CreateBreakoutRoomSysCmdMsgBody(meetingId, breakout)
    val event = CreateBreakoutRoomSysCmdMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def getPresentationId(state: MeetingState2x): String = {
    // in very rare cases the presentation conversion generates an error, what should we do?
    // those cases where default.pdf is deleted from the whiteboard
    var currentPresentation = "blank"
    for {
      defaultPod <- state.presentationPodManager.getDefaultPod()
      curPres <- defaultPod.getCurrentPresentation()
    } yield {
      currentPresentation = curPres.id
    }

    currentPresentation
  }

  def getPresentationSlide(state: MeetingState2x): Int = {
    if (!liveMeeting.presModel.getCurrentPage().isEmpty) liveMeeting.presModel.getCurrentPage().get.num else 0
    var currentSlide = 0
    for {
      defaultPod <- state.presentationPodManager.getDefaultPod()
      curPres <- defaultPod.getCurrentPresentation()
      curPage <- curPres.getCurrentPage(curPres)
    } yield {
      currentSlide = curPage.num
    }

    currentSlide
  }
}
