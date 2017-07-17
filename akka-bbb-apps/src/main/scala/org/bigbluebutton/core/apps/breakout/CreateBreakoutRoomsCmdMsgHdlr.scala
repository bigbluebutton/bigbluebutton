package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.BreakoutRooms
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }

trait CreateBreakoutRoomsCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleCreateBreakoutRoomsCmdMsg(msg: CreateBreakoutRoomsCmdMsg): Unit = {
    // If breakout rooms are being created we ignore the coming message
    if (liveMeeting.breakoutRooms.pendingRoomsNumber > 0) {
      log.warning(
        "CreateBreakoutRooms event received while {} are pending to be created for meeting {}",
        liveMeeting.breakoutRooms.pendingRoomsNumber, liveMeeting.props.meetingProp.intId
      )
    } else if (BreakoutRooms.getNumberOfRooms(liveMeeting.breakoutRooms) > 0) {
      log.warning(
        "CreateBreakoutRooms event received while {} breakout rooms running for meeting {}",
        BreakoutRooms.getNumberOfRooms(liveMeeting.breakoutRooms), liveMeeting.props.meetingProp.intId
      )
    } else {
      var i = 0
      // in very rare cases the presentation conversion generates an error, what should we do?
      // those cases where default.pdf is deleted from the whiteboard
      val sourcePresentationId = if (!liveMeeting.presModel.getCurrentPresentation().isEmpty) liveMeeting.presModel.getCurrentPresentation().get.id else "blank"
      val sourcePresentationSlide = if (!liveMeeting.presModel.getCurrentPage().isEmpty) liveMeeting.presModel.getCurrentPage().get.num else 0
      liveMeeting.breakoutRooms.pendingRoomsNumber = msg.body.rooms.length

      for (room <- msg.body.rooms) {
        i += 1
        val breakoutMeetingId = BreakoutRoomsUtil.createMeetingIds(liveMeeting.props.meetingProp.intId, i)
        val voiceConfId = BreakoutRoomsUtil.createVoiceConfId(liveMeeting.props.voiceProp.voiceConf, i)

        for {
          r <- BreakoutRooms.newBreakoutRoom(liveMeeting.props.meetingProp.intId, breakoutMeetingId._1, breakoutMeetingId._2, room.name,
            room.sequence, voiceConfId, room.users, liveMeeting.breakoutRooms)
        } yield {
          val roomDetail = new BreakoutRoomDetail(r.id, r.name, liveMeeting.props.meetingProp.intId, r.sequence,
            r.voiceConfId, msg.body.durationInMinutes, liveMeeting.props.password.moderatorPass, liveMeeting.props.password.viewerPass,
            sourcePresentationId, sourcePresentationSlide, msg.body.record)

          def build(meetingId: String, breakout: BreakoutRoomDetail): BbbCommonEnvCoreMsg = {
            val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
            val envelope = BbbCoreEnvelope(CreateBreakoutRoomSysCmdMsg.NAME, routing)
            val header = BbbCoreBaseHeader(CreateBreakoutRoomSysCmdMsg.NAME)

            val body = CreateBreakoutRoomSysCmdMsgBody(meetingId, breakout)
            val event = CreateBreakoutRoomSysCmdMsg(header, body)
            BbbCommonEnvCoreMsg(envelope, event)
          }

          val event = build(liveMeeting.props.meetingProp.intId, roomDetail)
          outGW.send(event)
        }
      }
    }
  }

}
