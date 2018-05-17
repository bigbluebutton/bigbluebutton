package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.BreakoutModel
import org.bigbluebutton.core.domain.{ BreakoutRoom2x, MeetingState2x }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait CreateBreakoutRoomsCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleCreateBreakoutRoomsCmdMsg(msg: CreateBreakoutRoomsCmdMsg, state: MeetingState2x): MeetingState2x = {
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

  def processRequest(msg: CreateBreakoutRoomsCmdMsg, state: MeetingState2x): MeetingState2x = {

    val presId = getPresentationId
    val presSlide = getPresentationSlide
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

  def getPresentationId: String = {
    // in very rare cases the presentation conversion generates an error, what should we do?
    // those cases where default.pdf is deleted from the whiteboard
    if (!liveMeeting.presModel.getCurrentPresentation().isEmpty) liveMeeting.presModel.getCurrentPresentation().get.id else "blank"
  }

  def getPresentationSlide: Int = {
    if (!liveMeeting.presModel.getCurrentPage().isEmpty) liveMeeting.presModel.getCurrentPage().get.num else 0
  }
}
